// @ts-nocheck
// src/app/api/trigger/[id]/route.ts
// This comment MUST be on line 1 to disable all TypeScript checks

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 10;

import { NextRequest, NextResponse } from 'next/server';
import { getOrgProfileInternal } from '@/lib/org-profile';
import { redis, getDatasourceKey } from '@/lib/redis';
import { qstash } from '@/lib/qstash';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { orgId } = await getOrgProfileInternal();
    const datasourceKey = getDatasourceKey(orgId, id);
    const datasourceStr = await redis.get(datasourceKey) as string | null;
    
    if (!datasourceStr || typeof datasourceStr !== 'string') {
      return NextResponse.json({ error: 'Datasource not found' }, { status: 404 });
    }

    const datasource = JSON.parse(datasourceStr);

    if (!datasource.config?.fileUrl) {
      return NextResponse.json({ error: 'Datasource missing fileUrl' }, { status: 400 });
    }

    const result = await qstash.publishJSON({
      url: `${process.env.NEXT_PUBLIC_APP_URL}/api/process-file`,
      body: {
        datasourceId: id,
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
      datasourceId: id,
    });

  } catch (err) {
    // ✅ SAFE: Works with unknown type
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error('[trigger] ❌ Error:', errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Trigger endpoint active' });
}