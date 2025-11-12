// src/app/api/datasources/[id]/trigger/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getOrgProfileInternal } from '@/lib/org-profile';
import { redis, getDatasourceKey } from '@/lib/redis';
import { qstash } from '@/lib/qstash';

// ✅ Next.js 16: Force dynamic, no caching
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// ✅ Next.js 16: params is ALWAYS a Promise
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ AWAIT params (required in Next.js 16+)
    const { id } = await params;
    
    const { orgId } = await getOrgProfileInternal();
    const datasourceKey = getDatasourceKey(orgId, id);
    const datasourceStr = await redis.get(datasourceKey) as string | null;
    
    if (!datasourceStr || typeof datasourceStr !== 'string') {
      console.error('[trigger] ❌ Datasource not found:', { orgId, id });
      return NextResponse.json({ error: 'Datasource not found' }, { status: 404 });
    }

    const datasource = JSON.parse(datasourceStr);

    if (!datasource.config?.fileUrl) {
      return NextResponse.json({ 
        error: 'Datasource missing fileUrl in config' 
      }, { status: 400 });
    }

    // ✅ Publish to QStash (tiny payload)
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

    console.log('[trigger] ✅ Job queued via QStash:', {
      messageId: result.messageId,
      datasourceId: id,
    });

    return NextResponse.json({ 
      success: true, 
      message: 'File processing queued',
      jobId: result.messageId,
      datasourceId: id,
    });

  } catch (err: any) {
    console.error('[trigger] ❌ Fatal error:', {
      message: err.message,
      stack: err.stack,
      url: req.url,
    });
    
    return NextResponse.json(
      { error: err.message || 'Failed to trigger processing' }, 
      { status: 500 }
    );
  }
}

// ✅ Optional: GET endpoint for health check
export async function GET() {
  return NextResponse.json({ 
    message: 'Trigger endpoint is active. Use POST to queue a job.',
    method: 'POST',
    requiredBody: {
      datasourceId: 'string',
      orgId: 'string',
      fileUrl: 'string',
      config: 'object',
    },
  });
}