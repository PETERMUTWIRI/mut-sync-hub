// @ts-nocheck
// src/app/api/process-file/route.ts

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 300;

import { NextRequest, NextResponse } from 'next/server';
import { redis, getDatasourceKey } from '@/lib/redis';
import { getOrgProfileInternal } from '@/lib/org-profile';
import Papa from 'papaparse';
import { XMLParser } from 'fast-xml-parser';

// ✅ NEW: Helper to detect delimiter automatically
function detectDelimiter(csvText: string, filename: string): string {
  // Check first line for tabs
  const firstLine = csvText.split('\n')[0];
  if (firstLine.includes('\t')) {
    console.log('[detectDelimiter] ✅ Detected TAB delimiter');
    return '\t';
  }
  if (firstLine.includes(';')) {
    console.log('[detectDelimiter] ✅ Detected SEMICOLON delimiter');
    return ';';
  }
  console.log('[detectDelimiter] ✅ Defaulting to COMMA delimiter');
  return ',';
}

// ✅ NEW: Helper to get file extension
function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}
function parseXmlToRows(xmlText: string): any[] {
  console.log('[parseXmlToRows] Converting XML to row format...');
  
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '',
    textNodeName: 'value',
    trimValues: true,
    parseAttributeValue: true,
  });

  const parsed = parser.parse(xmlText);
  
  // Handle common XML structures
  // Case 1: Root with array of records
  if (parsed.root && Array.isArray(parsed.root.record)) {
    return parsed.root.record;
  }
  
  // Case 2: Direct array of objects
  if (Array.isArray(parsed)) {
    return parsed;
  }
  
  // Case 3: Single record wrapper
  if (parsed.record) {
    return [parsed.record];
  }
  
  // Case 4: Flat structure with repeating elements
  const keys = Object.keys(parsed);
  for (const key of keys) {
    if (Array.isArray(parsed[key])) {
      return parsed[key];
    }
  }
  
  throw new Error('XML format not recognized - expected array of records');
}
export async function POST(req: NextRequest) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('[process-file] ➜ QSTASH JOB STARTED');

  try {
    if (!process.env.ANALYTICS_ENGINE_URL || !process.env.ANALYTICS_ENGINE_API_KEY) {
      console.error('[process-file] ❌ Missing ANALYTICS_ENGINE_URL or ANALYTICS_ENGINE_API_KEY');
      return NextResponse.json({ error: 'Analytics engine not configured' }, { status: 500 });
    }

    const body = await req.json();
    console.log('[process-file] Request body keys:', Object.keys(body));
    
    const profile = await getOrgProfileInternal();
    const orgId = profile.orgId;
    console.log('[process-file] Using orgId from profile:', orgId);

    const { datasourceId, fileUrl, config, type } = body;

    const datasourceKey = getDatasourceKey(orgId, datasourceId);
    console.log('[process-file] Fetching datasource from key:', datasourceKey);
    
    const datasourceRaw = await redis.get(datasourceKey);
    const datasource = typeof datasourceRaw === 'string' ? JSON.parse(datasourceRaw) : datasourceRaw;
    
    if (!datasource) {
      console.error('[process-file] ❌ Datasource not found');
      return NextResponse.json({ error: 'Datasource not found' }, { status: 404 });
    }

    console.log('[process-file] ✓ Datasource verified:', datasource.name, 'Type:', datasource.type);

    // 1. Download file
    console.log('[process-file] ➜ Downloading file...');
    const fileRes = await fetch(fileUrl);
    if (!fileRes.ok) throw new Error(`Download failed: ${fileRes.status}`);
    const fileContent = await fileRes.text();
    console.log('[process-file] ✓ File downloaded:', fileContent.length, 'bytes');
    console.log('[process-file] 🔍 First 200 chars:', fileContent.substring(0, 200));

      // 2. Detect file type and parse
    const filenameFromUrl = fileUrl.split('/').pop() || ''; // ✅ NEW
    const filenameFromUrl = fileUrl.split('/').pop() || '';
    const cleanFilename = filenameFromUrl.split('?')[0]; 
    const fileExt = getFileExtension(filenameFromUrl);     // ✅ FIXED
    console.log('[process-file] File extension:', fileExt);

    let rows = [];

    if (fileExt === 'csv' || fileExt === 'txt') {
     // ✅ Use filenameFromUrl instead of datasource.name
    const delimiter = config.delimiter || detectDelimiter(fileContent, filenameFromUrl);
    console.log('[process-file] Using delimiter:', JSON.stringify(delimiter));
  
    const parsed = Papa.parse(fileContent, {
       header: config.hasHeaders ?? true,
       delimiter: delimiter,
       skipEmptyLines: true,
      dynamicTyping: false,
       transformHeader: (h) => h.trim().toLowerCase().replace(/\s+/g, '_'),
    });

    if (parsed.errors.length > 0) {
      throw new Error(`CSV parse failed: ${parsed.errors[0].message}`);
    }
  
    rows = parsed.data;
    console.log('[process-file] ✓ CSV parsed:', rows.length, 'rows');
  
  // ✅ Debug logging
  if (rows.length > 0) {
    console.log('[process-file] 🔍 FIRST ROW:', JSON.stringify(rows[0]));
    console.log('[process-file] 🔍 COLUMN COUNT:', Object.keys(rows[0]).length);
    console.log('[process-file] 🔍 COLUMN NAMES:', Object.keys(rows[0]));
  } 
  
  } else if (fileExt === 'xml') {
    console.log('[process-file] ⚠️ XML parsing not yet implemented');
    return NextResponse.json({ error: 'XML files not supported yet' }, { status: 400 });
  
  } else {
    throw new Error(`Unsupported file type: ${fileExt}`);
  }

  // 3. Call HF engine
  const ANALYTICS_API_KEY = process.env.ANALYTICS_ENGINE_API_KEY;
  const analyticsUrl = `${process.env.ANALYTICS_ENGINE_URL}/api/v1/datasources/json`;
  const queryParams = new URLSearchParams({
    orgId,
    sourceId: datasourceId,
    type: type  // ✅ This is already correct!
  });

    console.log('[process-file] ➜ Calling HF engine with', rows.length, 'rows...');
    
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
          fileType: fileExt,
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
    console.log('[process-file] ✅ HF response received');

    // 4. Save to Redis
    const liveKey = `orgs/${orgId}/live_ingestion/${datasourceId}`;
    console.log('[process-file] ➜ Saving to Redis key:', liveKey);
    
    try {
      await redis.set(
        liveKey, 
        JSON.stringify({
          ...result,
          createdAt: new Date().toISOString(),
        }), 
        { ex: 3600 }
      );
      console.log('[process-file] ✅ Redis save attempted');
    } catch (redisErr) {
      console.error('[process-file] ⚠️ Redis save failed but continuing:', redisErr.message);
    }

    // 5. Update datasource status
    console.log('[process-file] ➜ Updating datasource status...');
    await redis.set(datasourceKey, JSON.stringify({
      ...datasource,
      status: 'PROCESSED',
      processedAt: new Date().toISOString(),
      transmittedRows: rows.length,
      transmittedColumns: Object.keys(rows[0] || {}).length,
    }));
    console.log('[process-file] ✅ Datasource status updated');

    console.log('[process-file] ✅ COMPLETED SUCCESSFULLY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    return NextResponse.json({ 
      success: true, 
      datasourceId, 
      rows: rows.length,
      columns: Object.keys(rows[0] || {}).length,
      message: 'Processing completed'
    });

  } catch (err: any) {
    console.error('[process-file] ❌ FATAL ERROR:', err.message);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Active' });
}