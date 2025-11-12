// app/api/process-file/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Papa from 'papaparse';
import { redis, getDatasourceKey } from '@/lib/redis';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 10; // Vercel Hobby limit

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    // ✅ STEP 1: Read raw body for QStash signature verification
    const bodyText = await req.text();
    
    // Verify QStash signature in production
    if (process.env.NODE_ENV === 'production') {
      const signature = req.headers.get('upstash-signature');
      if (!signature) {
        return NextResponse.json({ error: 'Missing QStash signature' }, { status: 401 });
      }

      const { verifyQstashSignature } = await import('@/lib/qstash');
      const isValid = await verifyQstashSignature(signature, bodyText);
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    // ✅ STEP 2: Parse job payload
    const { datasourceId, orgId, fileUrl, config } = JSON.parse(bodyText);

    if (!fileUrl || !datasourceId || !orgId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    console.log(`[process-file] Starting job for datasource: ${datasourceId}`);

    // ✅ STEP 3: Download file from Storj
    const response = await fetch(fileUrl, {
      signal: AbortSignal.timeout(8000), // 8s timeout
    });

    if (!response.ok) {
      throw new Error(`Storj fetch failed: ${response.status} ${response.statusText}`);
    }

    const csvText = await response.text();
    console.log(`[process-file] Fetched ${csvText.length} bytes`);

    // ✅ STEP 4: Parse CSV
    const { data, errors } = Papa.parse(csvText, {
      header: config.hasHeaders,
      delimiter: config.delimiter,
      skipEmptyLines: true,
      dynamicTyping: true,
      preview: 15000, // Safety: max 15K rows
    });

    if (errors.length > 0) {
      console.error('[process-file] CSV parse errors:', errors);
      throw new Error(`CSV parsing failed: ${errors[0].message}`);
    }

    console.log(`[process-file] Parsed ${data.length} rows`);

    // ✅ STEP 5: Transform to match Analytics Engine JsonPayload format
    // Your engine expects: { config: {...}, data: [...] }
    const analyticsPayload = {
      config: {
        delimiter: config.delimiter,
        hasHeaders: config.hasHeaders,
        datasourceId,
        orgId,
        fileUrl,
      },
      data: data.map((row: any, index: number) => ({
        id: crypto.randomUUID(),
        orgId,
        datasourceId,
        data: row, // Keep raw row data
        timestamp: row.timestamp || new Date().toISOString(),
        rowNumber: index,
        importedAt: new Date().toISOString(),
      })),
    };

    // ✅ STEP 6: Call Analytics Engine with CORRECT format
    const analyticsUrl = new URL(`${process.env.ANALYTICS_ENGINE_URL}/api/v1/datasources/json`);
    analyticsUrl.searchParams.set('orgId', orgId);
    analyticsUrl.searchParams.set('sourceId', datasourceId);
    analyticsUrl.searchParams.set('type', 'FILE_IMPORT');

    const analyticsRes = await fetch(analyticsUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANALYTICS_ENGINE_API_KEY!, // Match verify_key auth
      },
      body: JSON.stringify(analyticsPayload),
    });

    if (!analyticsRes.ok) {
      throw new Error(`Analytics engine failed: ${await analyticsRes.text()}`);
    }

    const result = await analyticsRes.json();
    const duration = Date.now() - startTime;

    console.log(`[process-file] ✅ Success: ${data.length} rows in ${duration}ms`);

    return NextResponse.json({ 
      success: true, 
      rowsProcessed: data.length,
      duration,
      analyticsResult: result,
    });

  } catch (err: any) {
    const duration = Date.now() - startTime;
    console.error(`[process-file] ❌ Failed after ${duration}ms:`, err);

    // Return 500 so QStash retries
    return NextResponse.json(
      { error: err.message || 'Processing failed' }, 
      { status: 500 }
    );
  }
}