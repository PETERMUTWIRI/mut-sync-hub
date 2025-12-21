// src/app/api/admin/stream/route.ts
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

import { NextRequest, NextResponse } from 'next/server';
import { verifySuperAdmin } from '@/lib/auth-super';
import { redis } from '@/lib/redis';

type UpstashXReadResponse = [[string, [string, Record<string, string>][]]] | null;

export async function GET(req: NextRequest) {
  try {
    // Verify admin access first
    await verifySuperAdmin(req);

    const stream = new ReadableStream({
      async start(controller) {
        let lastId = '0';
        let isActive = true;

        const checkForUpdates = async () => {
          if (!isActive) return;

          try {
            // Read from Redis stream
            const response = await redis.xread(
              'stream:admin:owner',
              lastId,
              { blockMS: 5000, count: 10 }
            ) as UpstashXReadResponse;

            // Process entries if they exist
            if (response?.[0]) {
              const [, entries] = response[0];
              
              for (const entry of entries) {
                const [id, fields] = entry;
                
                // Skip if fields are malformed
                if (!fields || typeof fields !== 'object') {
                  console.warn(`[admin-stream] Skipping entry ${id}: fields is not an object`);
                  lastId = id; // Still advance to avoid reprocessing
                  continue;
                }

                // Safely parse event data with fallback
                let parsedData: unknown = null;
                try {
                  const rawData = fields.data;
                  if (!rawData || rawData === 'undefined') {
                    throw new Error('Event data is undefined or missing');
                  }
                  parsedData = JSON.parse(rawData);
                } catch (parseError) {
                  console.error(`[admin-stream] Skipping malformed event ${id}:`, {
                    error: parseError instanceof Error ? parseError.message : 'Parse failed',
                    rawData: fields.data,
                    fullFields: fields
                  });
                  lastId = id; // Advance past this bad entry
                  continue; // Skip to next entry instead of crashing stream
                }

                // Safely parse timestamp
                const rawTimestamp = fields.timestamp;
                const parsedTimestamp = rawTimestamp && !isNaN(Number(rawTimestamp)) 
                  ? parseInt(rawTimestamp) 
                  : Date.now();

                // Send valid event to client
                controller.enqueue(`data: ${JSON.stringify({
                  type: 'event',
                  id,
                  event: fields.event || 'unknown',
                  data: parsedData,
                  timestamp: parsedTimestamp
                })}\n\n`);
                
                lastId = id;
              }
            }

            // Send heartbeat comment to keep connection alive
            controller.enqueue(': heartbeat\n\n');
          } catch (error) {
            console.error('[admin-stream] Redis read error:', error);
            // Don't crash the entire stream on Redis errors, just log and retry
          }

          // Schedule next check if still active
          if (isActive) {
            setTimeout(checkForUpdates, 100);
          }
        };

        // Start the update loop
        checkForUpdates();

        // Clean up on disconnect
        req.signal.addEventListener('abort', () => {
          isActive = false;
          controller.close();
        });
      }
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (error) {
    console.error('[admin-stream] Auth error:', error);
    // Return proper error response for auth failures
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}