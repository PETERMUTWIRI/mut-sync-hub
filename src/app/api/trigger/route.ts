// @ts-nocheck
// src/app/api/trigger/route.ts
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';


import { NextRequest, NextResponse } from 'next/server';
import { getOrgProfileInternal } from '@/lib/org-profile';
import { redis, getDatasourceKey } from '@/lib/redis';
import { qstash } from '@/lib/qstash';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const datasourceId = body?.datasourceId;

    if (!datasourceId) {
      return NextResponse.json({ error: 'Missing datasourceId in body' }, { status: 400 });
    }

    const { orgId } = await getOrgProfileInternal();
    const datasourceKey = getDatasourceKey(orgId, datasourceId);
    const datasourceStr = await redis.get(datasourceKey) as string | null;
    
    if (!datasourceStr || typeof datasourceStr !== 'string') {
      console.error('[trigger] ❌ Datasource not found:', { orgId, datasourceId });
      return NextResponse.json({ error: 'Datasource not found' }, { status: 404 });
    }

    const datasource = JSON.parse(datasourceStr);

    if (!datasource.config?.fileUrl) {
      return NextResponse.json({ error: 'Datasource missing fileUrl' }, { status: 400 });
    }

    console.log('[trigger] ✅ Queuing job for datasource:', datasourceId);

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

    return NextResponse.json({ 
      success: true, 
      message: 'File processing queued',
      jobId: result.messageId,
      datasourceId,
    });

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error('[trigger] ❌ Error:', errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Trigger endpoint active - use POST with { datasourceId }' });
}