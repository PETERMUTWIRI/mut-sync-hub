// @ts-nocheck
// src/app/api/process-file/route.ts

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 300;

import { NextRequest, NextResponse } from 'next/server';
import { redis, getDatasourceKey } from '@/lib/redis';
import Papa from 'papaparse';

export async function POST(req: NextRequest) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('[process-file] ➜ QSTASH JOB STARTED');

  try {
    // ✅ Validate env vars
    if (!process.env.ANALYTICS_ENGINE_URL || !process.env.ANALYTICS_ENGINE_API_KEY) {
      console.error('[process-file] ❌ Missing ANALYTICS_ENGINE_URL or ANALYTICS_ENGINE_API_KEY');
      return NextResponse.json({ error: 'Analytics engine not configured' }, { status: 500 });
    }

    const body = await req.json();
    const { datasourceId, orgId, fileUrl, config } = body;

    // ✅ Verify datasource
    const datasourceKey = getDatasourceKey(orgId, datasourceId);
    const datasourceRaw = await redis.get(datasourceKey);
    const datasource = typeof datasourceRaw === 'string' ? JSON.parse(datasourceRaw) : datasourceRaw;
    
    if (!datasource) {
      console.error('[process-file] ❌ Datasource not found');
      return NextResponse.json({ error: 'Datasource not found' }, { status: 404 });
    }

    console.log('[process-file] ✓ Datasource verified:', datasource.name);

    // 1. ⬇️ Download file from Storj
    const fileRes = await fetch(fileUrl);
    if (!fileRes.ok) throw new Error(`Download failed: ${fileRes.status}`);
    const csvText = await fileRes.text();
    console.log('[process-file] ✓ File downloaded:', csvText.length, 'bytes');

    // 2. 📊 Parse CSV to JSON
    const parsed = Papa.parse(csvText, {
      header: config.hasHeaders ?? true,
      delimiter: config.delimiter || ',',
      skipEmptyLines: true,
      dynamicTyping: true,
      transformHeader: (h) => h.trim().toLowerCase().replace(/\s+/g, '_'),
    });

    if (parsed.errors.length > 0) {
      throw new Error(`CSV parse failed: ${parsed.errors[0].message}`);
    }

    const rows = parsed.data;
    console.log('[process-file] ✓ CSV parsed:', rows.length, 'rows');

    // ✅ Define the variable here
    const ANALYTICS_API_KEY = process.env.ANALYTICS_ENGINE_API_KEY;
    
    // 3. 🚀 Call HF analytics engine JSON endpoint
    const analyticsUrl = `${process.env.ANALYTICS_ENGINE_URL}/api/v1/datasources/json`;
    const queryParams = new URLSearchParams({
      orgId,
      sourceId: datasourceId,
      type: 'FILE_IMPORT'
    });

    console.log('[process-file] ➜ Calling HF:', `${analyticsUrl}?${queryParams.toString()}`);
    
    const analyticsRes = await fetch(`${analyticsUrl}?${queryParams}`, {
      method: 'POST',
      headers: {
        'x-api-key': ANALYTICS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        config: {
          fileUrl,
          fileName: datasource.name,
          delimiter: config.delimiter,
          hasHeaders: config.hasHeaders,
          source: 'STORJ',
        },
        data: rows,
      }),
    });

    if (!analyticsRes.ok) {
      const errorText = await analyticsRes.text();
      console.error('[process-file] ❌ HF error:', analyticsRes.status, errorText);
      throw new Error(`HF rejected: ${analyticsRes.status} - ${errorText}`);
    }

    const result = await analyticsRes.json();
    console.log('[process-file] ✅ HF response:', result);

    // ✅ CRITICAL: SAVE RESPONSE TO REDIS (This was missing!)
    const liveKey = `orgs/${orgId}/live_ingestion/${datasourceId}`;
    console.log('[process-file] 💾 Saving to Redis key:', liveKey);
    await redis.set(
      liveKey, 
      JSON.stringify({
        ...result,
        createdAt: new Date().toISOString(),
      }), 
      { ex: 300 } // 5 minute TTL
    );
    console.log('[process-file] ✅ Live response saved to Redis');

    // 4. ✅ Update datasource status
    await redis.set(datasourceKey, JSON.stringify({
      ...datasource,
      status: 'PROCESSED',
      processedAt: new Date().toISOString(),
      transmittedRows: rows.length,
    }));

    console.log('[process-file] ✅ COMPLETED');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    return NextResponse.json({ success: true, datasourceId, rows: rows.length });

  } catch (err: any) {
    console.error('[process-file] ❌ FATAL:', err.message);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Active' });
}