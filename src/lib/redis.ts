// lib/redis.ts
import { Redis } from '@upstash/redis';

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const getDatasourceKey = (orgId: string, datasourceId: string) => 
  `datasource:${orgId}:${datasourceId}`;

export const getQueueKey = 'file-processor:queue';