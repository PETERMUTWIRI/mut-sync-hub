// lib/redis.ts
import { Redis } from '@upstash/redis';

// REST client for general operations (datasource metadata, caching, etc.)
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Helper function to generate consistent Redis keys for datasources
export const getDatasourceKey = (orgId: string, datasourceId: string) => 
  `datasource:${orgId}:${datasourceId}`;

