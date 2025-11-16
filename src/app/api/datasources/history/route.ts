// src/app/api/datasources/history/route.ts
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { getOrgProfileInternal } from '@/lib/org-profile';
import { redis } from '@/lib/redis';

export async function GET(req: NextRequest) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('[history] ➜ FETCHING ACTIVITY');

  try {
    const profile = await getOrgProfileInternal();
    const orgId = profile.orgId;
    console.log('[history] Org ID:', orgId);

    // ✅ CORRECT PATTERN: datasource:org_synth_123:*
    const pattern = `datasource:${orgId}:*`;
    console.log('[history] Redis pattern:', pattern);

    const keys = await redis.keys(pattern);
    console.log('[history] Found keys:', keys.length, keys);

    if (keys.length === 0) {
      console.log('[history] ➜ No keys found, returning empty');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      return NextResponse.json([]);
    }

    const datasources = await redis.mget(...keys);
    console.log('[history] Raw datasources from Redis:', datasources.length);

    const history = datasources
      .filter(ds => {
        const isString = typeof ds === 'string';
        if (!isString) console.log('[history] Skipping non-string:', ds);
        return isString;
      })
      .map(ds => {
        try {
          const parsed = JSON.parse(ds as string);
          console.log('[history] Parsed datasource:', {
            id: parsed.id,
            name: parsed.name,
            status: parsed.status,
            createdAt: parsed.createdAt,
            transmittedRows: parsed.transmittedRows
          });
          return parsed;
        } catch (err) {
          console.error('[history] Parse error:', err);
          return null;
        }
      })
      .filter(Boolean)
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 20)
      .map(ds => ({
        id: ds.id,
        sourceId: ds.id,
        name: ds.name || 'Unnamed Datasource', // ✅ Add name
        type: ds.type || 'unknown', // ✅ Add type
        status: ds.status || 'unknown',
        createdAt: ds.createdAt || new Date().toISOString(),
        rowsProcessed: ds.transmittedRows || 0,
      }));

    console.log('[history] ✅ Returning history:', history.length, 'items');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    return NextResponse.json(history);

  } catch (err: any) {
    console.error('[history] ❌ ERROR:', err.message);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    return NextResponse.json([]);
  }
}