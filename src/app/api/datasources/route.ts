export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { getOrgProfileInternal } from '@/lib/org-profile';

/* ----------  LAZY env check – only when route is actually hit  ---------- */
function getAnalyticsCredentials() {
  const url = process.env.ANALYTICS_INTERNAL_URL;
  const key = process.env.ANALYTICS_API_KEY;
  if (!url || !key) throw new Error('Missing analytics env vars (ANALYTICS_INTERNAL_URL or ANALYTICS_API_KEY)');
  return { url, key };
}

export async function POST(req: NextRequest) {
  try {
    console.log('[datasource] ➜  incoming upload');

    const { orgId } = await getOrgProfileInternal(req);
    console.log('[datasource] ➜  orgId', orgId);

    const incomingForm = await req.formData();
    const type = incomingForm.get('type') as string;
    if (!type) return NextResponse.json({ error: 'type required' }, { status: 400 });
    console.log('[datasource] ➜  type', type);

    const { url, key } = getAnalyticsCredentials();
    const target = new URL(`${url}/api/v1/datasources`);
    target.searchParams.set('orgId', orgId);
    target.searchParams.set('sourceId', crypto.randomUUID());
    target.searchParams.set('type', type);
    console.log('[datasource] ➜  relaying to', target.toString());

    const outgoingForm = new FormData();
    for (const [k, v] of incomingForm.entries()) {
      outgoingForm.append(k, v);
    }

    const engineRes = await fetch(target, {
      method: 'POST',
      headers: { 'x-api-key': key },
      body: outgoingForm,
    });

    console.log('[datasource] ➜  engine status', engineRes.status);
    if (!engineRes.ok) {
      const text = await engineRes.text();
      console.error('[datasource] ➜  engine error', text);
      return NextResponse.json({ error: `engine: ${text}` }, { status: engineRes.status });
    }

    const data = await engineRes.json();
    console.log('[datasource] ➜  engine reply', data);
    return NextResponse.json(data);
  } catch (e: any) {
    console.error('[datasource] ➜  crash', e);
    return NextResponse.json({ error: e.message || 'relay failed' }, { status: 500 });
  }
}