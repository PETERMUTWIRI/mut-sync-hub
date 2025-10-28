export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { getAnalyticsUsageServer } from '@/lib/server/billingServer';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const orgId = url.searchParams.get('orgId') || '';
    if (!orgId) return NextResponse.json({ error: 'orgId required' }, { status: 400 });
    const usage = await getAnalyticsUsageServer(orgId);
    return NextResponse.json(usage);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
  }
}
