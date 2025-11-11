// app/api/datasources/[id]/trigger/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getOrgProfileInternal } from '@/lib/org-profile';
import { Queue } from 'bullmq';
import { redis } from '@/lib/redis';

const queue = new Queue('file-processor', {
  // cast to any because the Redis client instance type doesn't exactly match
  // bullmq's ConnectionOptions type in our typing setup
  connection: redis as any,
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('[trigger] Starting for datasource:', params.id);

    const { orgId } = await getOrgProfileInternal();
    
    // Get datasource from Redis
    const datasourceKey = `datasource:${orgId}:${params.id}`;
    const datasourceStr = await redis.get(datasourceKey);
    
    if (!datasourceStr) {
      return NextResponse.json(
        { error: 'Datasource not found' }, 
        { status: 404 }
      );
    }

    if (typeof datasourceStr !== 'string') {
      console.error('[trigger] invalid datasource payload', typeof datasourceStr, datasourceStr);
      return NextResponse.json(
        { error: 'Invalid datasource payload' },
        { status: 500 }
      );
    }

    const datasource = JSON.parse(datasourceStr);

    // Add job to queue (returns immediately, no timeout)
    await queue.add('process-file', {
      datasourceId: params.id,
      orgId,
      fileUrl: datasource.config.fileUrl,
      config: {
        delimiter: datasource.config.delimiter,
        hasHeaders: datasource.config.hasHeaders,
      },
    });

    console.log('[trigger] ✅ Job queued for', params.id);

    return NextResponse.json({ 
      success: true, 
      message: 'File processing queued',
      jobId: params.id,
    });

  } catch (err: any) {
    console.error('[trigger] error', err);
    return NextResponse.json(
      { error: err.message || 'Failed to trigger processing' }, 
      { status: 500 }
    );
  }
}