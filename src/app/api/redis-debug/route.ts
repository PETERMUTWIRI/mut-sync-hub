// src/app/api/redis-debug/route.ts
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

export async function GET() {
  const keys = await redis.keys('orgs/*/live_ingestion/*');
  const data = await Promise.all(keys.map(async (key) => {
    const value = await redis.get(key);
    return { key, exists: !!value, ttl: await redis.ttl(key) };
  }));
  
  return NextResponse.json(data);
}