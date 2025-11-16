// @ts-nocheck
// src/app/api/datasources/[datasourceId]/live/route.ts

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { getOrgProfileInternal } from '@/lib/org-profile';

export async function GET(
  req: NextRequest,
  { params }: { params: { datasourceId: string } }
) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('[live-data] ➜ LIVE DATA REQUEST');

  try {
    const datasourceId = params.datasourceId;
    console.log('[live-data] Datasource ID:', datasourceId);

    // Get orgId from profile
    const profile = await getOrgProfileInternal();
    const orgId = profile.orgId;
    console.log('[live-data] Org ID:', orgId);

    // Construct Redis key
    const liveKey = `orgs/${orgId}/live_ingestion/${datasourceId}`;
    console.log('[live-data] Redis key:', liveKey);

    // Fetch from Redis
    const liveData = await redis.get(liveKey);
    
    if (!liveData) {
      console.log('[live-data] ⚠️ No live data found');
      return NextResponse.json({ 
        error: 'No live data available. Check if processing is complete.', 
        key: liveKey 
      }, { status: 404 });
    }

    // Parse if string
    const parsedData = typeof liveData === 'string' ? JSON.parse(liveData) : liveData;
    
    console.log('[live-data] ✅ Data retrieved, keys:', Object.keys(parsedData));
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    return NextResponse.json(parsedData);

  } catch (err: any) {
    console.error('[live-data] ❌ ERROR:', err.message);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}