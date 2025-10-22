export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { enforceAnalyticsLimitServer } from '@/lib/server/billingServer';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orgId, feature } = body || {};
    if (!orgId || !feature) return NextResponse.json({ error: 'orgId and feature required' }, { status: 400 });
    await enforceAnalyticsLimitServer(orgId, feature);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 400 });
  }
}
