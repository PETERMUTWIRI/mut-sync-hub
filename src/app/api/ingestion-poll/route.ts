// src/app/api/ingestion-poll/route.ts
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

export async function GET(req: NextRequest) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('[ingestion-poll] ➜ REQUEST RECEIVED');

  try {
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("orgId");
    const datasourceId = searchParams.get("datasourceId");

    console.log('[ingestion-poll] Params:', { orgId, datasourceId });

    if (!orgId || !datasourceId) {
      console.log('[ingestion-poll] ❌ Missing params, returning null');
      return NextResponse.json(null);
    }

    const key = `orgs/${orgId}/live_ingestion/${datasourceId}`;
    console.log('[ingestion-poll] Redis key:', key);

    const data = await redis.get(key);
    console.log('[ingestion-poll] Redis data found:', !!data);

    if (!data) {
      console.log('[ingestion-poll] ➜ No data, returning null');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      return NextResponse.json(null);
    }

    const parsed = typeof data === "string" ? JSON.parse(data) : data;
    console.log('[ingestion-poll] ✅ Returning data:', parsed.id);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    return NextResponse.json(parsed);

  } catch (err: any) {
    console.error('[ingestion-poll] ❌ ERROR:', err.message);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    return NextResponse.json(null);
  }
}