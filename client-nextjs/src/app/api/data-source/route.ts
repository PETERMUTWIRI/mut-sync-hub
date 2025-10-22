export const dynamic = 'force-dynamic';
// /app/api/datasources/route.ts  (top of file)
export const runtime = 'nodejs';       // optional but explicit


// /app/api/datasources/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getOrgProfileInternal } from '@/lib/org-profile';


const ANALYTICS_URL = process.env.ANALYTICS_INTERNAL_URL!;
const ANALYTICS_API_KEY = process.env.ANALYTICS_API_KEY!;

if (!ANALYTICS_URL || !ANALYTICS_API_KEY) {
  throw new Error('Missing analytics env vars');
}

export async function POST(req: NextRequest) {
  try {
    const { orgId } = await getOrgProfileInternal(req);

    const incomingForm = await req.formData();
    const type = incomingForm.get('type') as string;
    if (!type) return NextResponse.json({ error: 'type required' }, { status: 400 });

    const url = new URL(`${ANALYTICS_URL}/api/v1/datasources`);
    url.searchParams.set('orgId', orgId);
    url.searchParams.set('sourceId', crypto.randomUUID());
    url.searchParams.set('type', type);

    const outgoingForm = new FormData();
    for (const [k, v] of incomingForm.entries()) {
      if (v instanceof File) {
        outgoingForm.append(k, v);
      } else {
        outgoingForm.append(k, v);
      }
    }
    const engineRes = await fetch(url.toString(), {
      method: 'POST',
      headers: { 'x-api-key': ANALYTICS_API_KEY },
      body: outgoingForm,
    });

    if (!engineRes.ok) {
      const text = await engineRes.text();
      return NextResponse.json({ error: `engine: ${text}` }, { status: engineRes.status });
    }

    return NextResponse.json(await engineRes.json());
  } catch (e: any) {
    console.error('[datasource relay]', e);
    return NextResponse.json({ error: e.message || 'relay failed' }, { status: 500 });
  }
}