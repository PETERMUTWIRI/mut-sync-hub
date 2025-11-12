// app/api/datasources/[id]/trigger/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getOrgProfileInternal } from '@/lib/org-profile';
import { redis } from '@/lib/redis';
import { qstash } from '@/lib/qstash';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { orgId } = await getOrgProfileInternal();
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;

    // Fetch datasource
    const datasourceKey = `datasource:${orgId}:${id}`;
    const datasourceStr = await redis.get(datasourceKey) as string | null;
    
    if (!datasourceStr || typeof datasourceStr !== 'string') {
      return NextResponse.json({ error: 'Datasource not found' }, { status: 404 });
    }

    const datasource = JSON.parse(datasourceStr);

    // Validate fileUrl exists
    if (!datasource.config?.fileUrl) {
      return NextResponse.json({ 
        error: 'Datasource missing fileUrl in config' 
      }, { status: 400 });
    }

    // Prepare tiny payload (under 1KB)
    const jobPayload = {
      datasourceId: id,
      orgId,
      fileUrl: datasource.config.fileUrl,
      config: {
        delimiter: datasource.config.delimiter || ',',
        hasHeaders: datasource.config.hasHeaders ?? true,
      },
    };

    // Publish to QStash (returns instantly, no timeout)
    const result = await qstash.publishJSON({
      url: `${process.env.NEXT_PUBLIC_APP_URL}/api/process-file`,
      body: jobPayload,
      retries: 3, // QStash will retry 3 times on failure
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
    console.error('[trigger] ❌ Error:', {
      message: err.message,
      stack: err.stack,
      params: params,
    });
    
    return NextResponse.json(
      { error: err.message || 'Failed to trigger processing' }, 
      { status: 500 }
    );
  }
}