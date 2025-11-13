// src/app/api/datasources/history/route.ts
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { getOrgProfileInternal } from '@/lib/org-profile';
import { redis, getDatasourceKey } from '@/lib/redis';

export async function GET(req: NextRequest) {
  try {
    const profile = await getOrgProfileInternal();
    const orgId = profile.orgId;
    const pattern = getDatasourceKey(orgId, '*');
    const keys = await redis.keys(pattern);
    
    if (keys.length === 0) return NextResponse.json([]);
    
    const datasources = await redis.mget(...keys);
    const history = datasources
      .filter(ds => typeof ds === 'string')
      .map(ds => JSON.parse(ds))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 20)
      .map(ds => ({
        id: ds.id,
        sourceId: ds.id,
        status: ds.status || 'unknown',
        createdAt: ds.createdAt,
        rowsProcessed: ds.transmittedRows || 0,
      }));

    return NextResponse.json(history);
  } catch (err: any) {
    console.error('[history] ❌', err.message);
    return NextResponse.json([]);
  }
}