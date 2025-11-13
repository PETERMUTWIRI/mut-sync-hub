// @ts-nocheck
// src/app/api/process-file/route.ts

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 300; // Increase for file processing

import { NextRequest, NextResponse } from 'next/server';
import { getOrgProfileInternal } from '@/lib/org-profile';
import { redis, getDatasourceKey } from '@/lib/redis';

export async function POST(req: NextRequest) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('[process-file] ➜ QSTASH JOB STARTED');

  try {
    // ✅ CORRECT: Use datasourceId, not id
    const body = await req.json();
    const { datasourceId, orgId, fileUrl, config } = body;

    console.log('[process-file] Payload received:', { datasourceId, orgId, fileUrl });

    if (!datasourceId || !orgId || !fileUrl) {
      console.error('[process-file] ❌ Missing required fields in payload');
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // Optional: Verify datasource still exists
    const datasourceKey = getDatasourceKey(orgId, datasourceId);
    const datasource = await redis.get(datasourceKey);
    
    if (!datasource) {
      console.error('[process-file] ❌ Datasource not found in Redis');
      return NextResponse.json({ error: 'Datasource not found' }, { status: 404 });
    }

    console.log('[process-file] ✓ Datasource verified');

    // TODO: Add your actual file processing logic here
    // Example: Download CSV, parse, send to analytics engine
    
    console.log('[process-file] ✅ Job completed successfully');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    return NextResponse.json({ success: true, datasourceId });

  } catch (err: any) {
    console.error('[process-file] ❌ FATAL ERROR:', {
      message: err.message,
      stack: err.stack,
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Health check
export async function GET() {
  return NextResponse.json({ message: 'Process-file endpoint active' });
}