// src/app/api/ingestion-poll/route.ts
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("orgId");
    const datasourceId = searchParams.get("datasourceId");

    if (!orgId || !datasourceId) {
      return NextResponse.json(null); // Return null if params missing
    }

    const key = `orgs/${orgId}/live_ingestion/${datasourceId}`;
    const data = await redis.get(key);

    if (!data) return NextResponse.json(null); // Still processing

    const parsed = typeof data === "string" ? JSON.parse(data) : data;
    return NextResponse.json(parsed);

  } catch (err: any) {
    console.error('[ingestion-poll] ❌', err.message);
    return NextResponse.json(null); // Graceful failure
  }
}