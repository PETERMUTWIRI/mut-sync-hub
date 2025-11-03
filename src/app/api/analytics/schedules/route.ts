export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { getOrgProfileInternal } from '@/lib/org-profile';

// Prefer an internal URL when running in the dev container or docker network.
// Fall back to the public preview URL when necessary.
const ANALYTICS_URL = process.env.ANALYTICS_INTERNAL_URL ;
// Some environments set ANALYTICS_KEY, others ANALYTICS_API_KEY — accept both.
const ANALYTICS_KEY = process.env.ANALYTICS_KEY ?? process.env.ANALYTICS_API_KEY ?? 'dev-analytics-key-123';

/* ------------------ GET /api/analytics/schedules?orgId=xxx ------------------ */
export async function GET(req: NextRequest) {
  try {
    const { orgId } = await getOrgProfileInternal(); // ✅ pass full request
    const res = await fetch(`${ANALYTICS_URL}/schedules?orgId=${orgId}`, {
      headers: { 'x-api-key': ANALYTICS_KEY },
    });

    const contentType = (res.headers.get('content-type') || '').toLowerCase();

    // If upstream responded with non-OK, capture body for debugging.
    if (!res.ok) {
      const text = await res.text();
      console.error('[analytics-schedules GET] upstream error', { status: res.status, contentType, snippet: text.slice(0, 2000) });
      throw new Error(`Scheduler unreachable (status ${res.status})`);
    }

    // If upstream returned HTML (e.g. redirect to auth/provider), fail with a helpful message.
    if (!contentType.includes('application/json')) {
      const text = await res.text();
      console.error('[analytics-schedules GET] upstream returned non-JSON response', { contentType, snippet: text.slice(0, 2000) });
      throw new Error('Scheduler returned non-JSON response (possible redirect/auth gateway)');
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (e: any) {
    console.error('[analytics-schedules GET]', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

/* ------------------ POST /api/analytics/schedules --------------------------- */
export async function POST(req: NextRequest) {
  try {
    const { orgId } = await getOrgProfileInternal(); // ✅ pass full request
    const body      = await req.json();
    const res = await fetch(`${ANALYTICS_URL}/schedules`, {
      method : 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key'   : ANALYTICS_KEY,
      },
      body: JSON.stringify({ ...body, orgId }),
    });

    const contentType = (res.headers.get('content-type') || '').toLowerCase();
    if (!res.ok) {
      const text = await res.text();
      console.error('[analytics-schedules POST] upstream error', { status: res.status, contentType, snippet: text.slice(0, 2000) });
      throw new Error(`Scheduler error (status ${res.status})`);
    }

    if (!contentType.includes('application/json')) {
      const text = await res.text();
      console.error('[analytics-schedules POST] upstream returned non-JSON response', { contentType, snippet: text.slice(0, 2000) });
      throw new Error('Scheduler returned non-JSON response (possible redirect/auth gateway)');
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (e: any) {
    console.error('[analytics-schedules POST]', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}