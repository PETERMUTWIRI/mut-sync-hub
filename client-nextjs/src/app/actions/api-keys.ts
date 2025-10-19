// src/app/actions/api-keys.ts
'use server';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';
import { enforceAnalyticsLimit } from '@/lib/billing';

export async function createApiKey(orgId: string, name: string, scopes: string[]) {
  await enforceAnalyticsLimit(orgId, 'ApiKey');
  const fullKey = 'sk_' + randomUUID().replace(/-/g, '');
  const key = await prisma.apiKey.create({
    data: { key: fullKey, name, key_preview: fullKey.slice(-8), scopes, orgId },
  });
  return { ...key, key: fullKey }; // send once to user
}

export async function revokeApiKey(orgId: string, keyId: string) {
  await prisma.apiKey.deleteMany({ where: { id: keyId, orgId } });
  return { success: true };
}