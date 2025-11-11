// app/api/process-file/worker.ts
import { Worker } from 'bullmq';
import Papa from 'papaparse';
import { redis } from '@/lib/redis';
import crypto from 'crypto';

// Initialize worker ONLY if not already running
if (!process.env.WORKER_STARTED) {
  process.env.WORKER_STARTED = 'true';

  const worker = new Worker(
    'file-processor',
    async (job) => {
      console.log('[worker] Processing job:', job.id);
      
      const { datasourceId, orgId, fileUrl, config } = job.data;

      try {
        // 1. Fetch file from Storj
        console.log('[worker] Fetching from Storj:', fileUrl);
        const response = await fetch(fileUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
        }
        const csvText = await response.text();
        console.log('[worker] File fetched, size:', csvText.length, 'bytes');

        // 2. Parse CSV
        console.log('[worker] Parsing CSV...');
        const { data, errors, meta } = Papa.parse(csvText, {
          header: config.hasHeaders,
          delimiter: config.delimiter,
          skipEmptyLines: true,
          dynamicTyping: true,
        });

        if (errors.length > 0) {
          console.error('[worker] CSV parse errors:', errors);
          throw new Error(`CSV parsing failed: ${errors[0].message}`);
        }

        console.log('[worker] Parsed', data.length, 'rows');

        // 3. Transform for DuckDB
        const rows = data.map((row: any, index: number) => ({
          id: crypto.randomUUID(),
          orgId,
          datasourceId,
          data: row,
          rowNumber: index,
          timestamp: row.timestamp || new Date().toISOString(),
          importedAt: new Date().toISOString(),
        }));

        // 4. Send to DuckDB Analytics Engine
        console.log('[worker] Sending to DuckDB...');
        const analyticsRes = await fetch(`${process.env.ANALYTICS_ENGINE_URL}/api/ingest`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.ANALYTICS_ENGINE_API_KEY}`,
          },
          body: JSON.stringify({
            table: 'meter_data',
            rows,
            metadata: {
              datasourceId,
              orgId,
              rowCount: rows.length,
              importedAt: new Date().toISOString(),
            },
          }),
        });

        if (!analyticsRes.ok) {
          throw new Error(`Analytics engine failed: ${await analyticsRes.text()}`);
        }

        const result = await analyticsRes.json();
        console.log('[worker] ✅ Successfully ingested', result.insertedRows, 'rows');

        return { success: true, rowsProcessed: rows.length };

      } catch (error) {
        console.error('[worker] Job failed:', error);
        throw error; // Job will be retried
      }
    },
    {
      connection: redis as any,
      concurrency: 2, // Process 2 jobs at once
    }
  );

  worker.on('completed', (job) => {
    console.log(`[worker] Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[worker] Job ${job?.id} failed:`, err.message);
  });

  console.log('[worker] Background worker started');
} else {
  console.log('[worker] Worker already running, skipping initialization');
}

// Export a handler to keep Vercel happy
export async function GET() {
  return Response.json({ 
    message: 'Worker is running in background',
    status: process.env.WORKER_STARTED ? 'active' : 'inactive'
  });
}