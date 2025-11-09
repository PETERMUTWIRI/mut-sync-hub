// app/api/datasources/[id]/trigger/route.ts
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { getOrgProfileInternal } from '@/lib/org-profile';
import { getAnalyticsCredentials } from '@/lib/analytics-credentials';
import { prisma } from '@/lib/prisma';

const WORKFLOW_ID = process.env.N8N_WEBHOOK_ID || '10797c3b-17d6-41b5-bb67-2c71942018bf';

async function retryFetch(url: string, options: RequestInit, retries = 3, delay = 2000): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, options);
      if (res.ok) return res;
      console.warn(`[trigger] → attempt ${attempt + 1} failed (${res.status})`);
      if (attempt < retries) await new Promise(r => setTimeout(r, delay * (attempt + 1)));
    } catch (err) {
      console.warn(`[trigger] → attempt ${attempt + 1} network error:`, err);
      if (attempt < retries) await new Promise(r => setTimeout(r, delay * (attempt + 1)));
    }
  }
  throw new Error(`[trigger] → failed after ${retries + 1} attempts`);
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { orgId } = await getOrgProfileInternal();
    
    const datasource = await prisma.dataSource.findFirst({
      where: { id: params.id, orgId },
      select: { id: true, type: true, config: true, name: true }
    });
    
    if (!datasource) {
      return NextResponse.json({ error: 'Datasource not found' }, { status: 404 });
    }

    const { url } = getAnalyticsCredentials();
    const baseUrl = url.replace('/api/v1', '');
    const isProd = process.env.NODE_ENV === 'production';
    const webhookUrl = isProd
      ? `${baseUrl}/webhook/${orgId}`
      : `${baseUrl}/webhook-test/${WORKFLOW_ID}`;

    const payload = {
      orgId,
      sourceId: datasource.id,
      type: datasource.type,
      config: datasource.config,
      ts: new Date().toISOString(),
    };

    const res = await retryFetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }, 3, 1500);

    await prisma.dataSource.update({
      where: { id: params.id },
      data: { lastSyncAt: new Date() }
    });

    return new Response(null, { status: 204 });

  } catch (err: any) {
    console.error(`[trigger] → final failure:`, err.message || err);
    return NextResponse.json({ error: 'Trigger failed', details: err.message }, { status: 502 });
  }
}