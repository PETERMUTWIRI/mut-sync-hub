export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { getOrgProfileInternal } from '@/lib/org-profile';
import { getAnalyticsCredentials } from '@/lib/analytics-credentials';
import crypto from 'crypto';

// use shared helper from lib

export async function POST(req: NextRequest) {
  try {
    console.log('[datasource] ➜ incoming upload');

    const { orgId } = await getOrgProfileInternal();
    const { url, key } = getAnalyticsCredentials(); // now points to n8n base
    const incomingForm = await req.formData();
    const type = incomingForm.get('type') as string;
    if (!type) return NextResponse.json({ error: 'type required' }, { status: 400 });

    // --- Build webhook URL for n8n ---
    const target = new URL(`${url}/webhook/${orgId}`); // ✅ points to your n8n webhook

    console.log('[datasource] ➜ relaying to n8n', target.toString());

    const body: Record<string, FormDataEntryValue> = {};
    for (const [k, v] of incomingForm.entries()) body[k] = v;

    const headers = { 'x-api-key': key, 'Content-Type': 'application/json' };

    const rowsRaw = body.data ? (body.data as string) : '[]';
    let rows: any[];
    try { rows = JSON.parse(rowsRaw); }
    catch { rows = []; }

    const engineRes = await fetch(target, {
      method : 'POST',
      headers,
      body   : JSON.stringify({ orgId, rows }),
    });

    console.log('[datasource] ➜ n8n status', engineRes.status);
    if (!engineRes.ok) {
      const text = await engineRes.text();
      console.error('[datasource] ➜ n8n error', text);
      return NextResponse.json({ error: `n8n: ${text}` }, { status: engineRes.status });
    }

    const data = await engineRes.json();
    console.log('[datasource] ➜ n8n reply', data);
    return NextResponse.json(data);
  } catch (e: any) {
    console.error('[datasource] ➜ crash', e);
    return NextResponse.json({ error: e.message || 'relay failed' }, { status: 500 });
  }
}
