
'use server';
import { prisma } from '@/lib/prisma';
import CryptoJS from 'crypto-js';
import type { DataSourceType } from '@prisma/client';

const ENC_KEY = process.env.DATASOURCE_ENCRYPTION_KEY!;
if (!ENC_KEY || ENC_KEY.length !== 32) throw new Error('DATASOURCE_ENCRYPTION_KEY must be 32 chars');

const encrypt = (o: any) => CryptoJS.AES.encrypt(JSON.stringify(o), ENC_KEY).toString();

// Allowed values mirror Prisma enum DataSourceType in prisma/schema.prisma
const ALLOWED_TYPES = ['POS_SYSTEM', 'ERP', 'DATABASE', 'API', 'FILE_IMPORT', 'CUSTOM', 'WEBHOOK'] as const;

// Validate config for each type and return minimal engine payload
const validateAndPrepareConfig = (type: DataSourceType, config: any): { storedConfig: any; enginePayload: any } => {
  if (!config || typeof config !== 'object') {
    throw new Error('Config must be a valid object');
  }

  switch (type) {
    case 'FILE_IMPORT':
      if (!config.provider || !['upload', 's3', 'local'].includes(config.provider)) {
        throw new Error("FILE_IMPORT config must include provider: 'upload', 's3', or 'local'");
      }
      if (config.provider === 'upload' && !config.fileName) {
        throw new Error('FILE_IMPORT with provider "upload" must include fileName');
      }
      if (config.provider === 's3' && (!config.bucket || !config.region || !config.accessKey || !config.secretKey)) {
        throw new Error('FILE_IMPORT with provider "s3" must include bucket, region, accessKey, and secretKey');
      }
      if (config.provider === 'local' && !config.path) {
        throw new Error('FILE_IMPORT with provider "local" must include path');
      }
      // Store full config, send only provider and fileName (if upload) to engine
      return { storedConfig: config, enginePayload: { provider: config.provider, fileName: config.fileName } };
    case 'API':
      if (!config.endpoint || !config.apiKey) {
        throw new Error('API config must include endpoint and apiKey');
      }
      // Store full config, send endpoint and apiKey to engine for data fetching
      return { storedConfig: config, enginePayload: { endpoint: config.endpoint, apiKey: config.apiKey } };
    case 'DATABASE':
      if (!config.conn || !['mysql', 'postgres', 'sqlserver', 'sqlite'].includes(config.conn)) {
        throw new Error("DATABASE config must include conn: 'mysql', 'postgres', 'sqlserver', or 'sqlite'");
      }
      if (!config.host || !config.port || !config.username || !config.password || !config.database) {
        throw new Error('DATABASE config must include host, port, username, password, and database');
      }
      // Store full config, send only conn and database to engine (credentials stay in Next.js)
      return { storedConfig: config, enginePayload: { conn: config.conn, database: config.database } };
    case 'WEBHOOK':
      if (!config.webhook || !config.path) {
        throw new Error('WEBHOOK config must include webhook: true and path');
      }
      // Store full config, send only path to engine
      return { storedConfig: config, enginePayload: { path: config.path } };
    case 'POS_SYSTEM':
    case 'ERP':
    case 'CUSTOM':
      // No specific validation, send full config to engine
      return { storedConfig: config, enginePayload: config };
    default:
      throw new Error(`Unsupported type: ${type}`);
  }
};

export async function createDataSourceServer(orgId: string, type: string, name: string, config: any) {
  if (!orgId || typeof orgId !== 'string') {
    throw new Error('Invalid orgId');
  }
  if (!name || typeof name !== 'string') {
    throw new Error('Invalid name');
  }
  if (!ALLOWED_TYPES.includes(type as any)) {
    throw new Error(`Invalid data source type: ${type}. Allowed: ${ALLOWED_TYPES.join(', ')}`);
  }

  // Cast to Prisma enum type after validation
  const dsType = type as DataSourceType;

  // Validate config and prepare engine payload
  const { storedConfig, enginePayload } = validateAndPrepareConfig(dsType, config);

  try {
    const dataSource = await prisma.dataSource.create({
      data: { orgId, type: dsType, name, config: encrypt(storedConfig) },
    });
    return { id: dataSource.id, enginePayload };
  } catch (error: any) {
    console.error('[createDataSourceServer] Prisma error:', error);
    throw new Error(`Failed to create data source: ${error.message || 'Database error'}`);
  }
}