// @ts-nocheck
// src/app/api/trigger/route.ts

// ✅ CONFIG EXPORTS AT TOP
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 10;

import { NextRequest, NextResponse } from 'next/server';
import { getOrgProfileInternal } from '@/lib/org-profile';
import { redis, getDatasourceKey } from '@/lib/redis';
import { qstash } from '@/lib/qstash';

export async function POST(req: NextRequest) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('[trigger] ➜ TRIGGER REQUEST RECEIVED');

  try {
    const body = await req.json();
    console.log('[trigger] Request body:', body);

    const datasourceId = body?.datasourceId;
    if (!datasourceId) {
      console.error('[trigger] ❌ Missing datasourceId in body');
      return NextResponse.json({ error: 'Missing datasourceId in body' }, { status: 400 });
    }

    const profile = await getOrgProfileInternal();
    const orgId = profile.orgId;
    console.log('[trigger] Using orgId:', orgId);

    const datasourceKey = getDatasourceKey(orgId, datasourceId);
    console.log('[trigger] Redis key:', datasourceKey);

    const datasourceStr = await redis.get(datasourceKey) as string | null;
    
    if (!datasourceStr || typeof datasourceStr !== 'string') {
      console.error('[trigger] ❌ DATASOURCE NOT FOUND IN REDIS');
      console.error('[trigger] Key:', datasourceKey);
      console.error('[trigger] Value:', datasourceStr);
      console.error('[trigger] orgId from profile:', orgId);
      console.error('[trigger] datasourceId from body:', datasourceId);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      return NextResponse.json({ error: 'Datasource not found' }, { status: 404 });
    }

    console.log('[trigger] ✓ DATASOURCE FOUND:', datasourceStr.substring(0, 100) + '...');

    const datasource = JSON.parse(datasourceStr);
    console.log('[trigger] Parsed datasource:', { id: datasource.id, hasFileUrl: !!datasource.config?.fileUrl });

    if (!datasource.config?.fileUrl) {
      console.error('[trigger] ❌ Missing fileUrl in config');
      return NextResponse.json({ error: 'Datasource missing fileUrl' }, { status: 400 });
    }

    console.log('[trigger] ✅ All validation passed, queuing QStash job');

    const result = await qstash.publishJSON({
      url: `${process.env.NEXT_PUBLIC_APP_URL}/api/process-file`,
      body: {
        datasourceId,
        orgId,
        fileUrl: datasource.config.fileUrl,
        config: {
          delimiter: datasource.config.delimiter || ',',
          hasHeaders: datasource.config.hasHeaders ?? true,
        },
      },
      retries: 3,
    });

    console.log('[trigger] ✅ QSTASH JOB QUEUED:', result.messageId);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    return NextResponse.json({ 
      success: true, 
      message: 'File processing queued',
      jobId: result.messageId,
      datasourceId,
    });

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error('[trigger] ❌ UNEXPECTED ERROR:', errorMessage);
    console.error('[trigger] Stack:', err.stack);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Trigger endpoint active - use POST with { datasourceId }' });
}