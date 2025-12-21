// src/app/api/admin/stream/route.ts
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

import { NextRequest, NextResponse } from 'next/server';
import { verifySuperAdmin } from '@/lib/auth-super';
import { redis } from '@/lib/redis';

// Helper to convert Redis flat array to object
function convertRedisFieldsToObject(fields: any): Record<string, any> {
  // Already an object? Return as-is
  if (!Array.isArray(fields)) return fields;
  
  // Convert flat array [key1, val1, key2, val2] to object
  const obj: Record<string, any> = {};
  for (let i = 0; i < fields.length; i += 2) {
    const key = fields[i];
    const value = fields[i + 1];
    if (key !== undefined) {
      obj[key] = value;
    }
  }
  return obj;
}

// Define Upstash response type (can be either format)
type UpstashXReadResponse = [[string, [string, any][]]] | null;

export async function GET(req: NextRequest) {
  try {
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
            if (response?.[0] && Array.isArray(response[0])) {
              const [, entries] = response[0];
              
              for (const entry of entries) {
                if (!Array.isArray(entry) || entry.length < 2) continue;
                
                const [id, rawFields] = entry;
                
                // Convert flat array to object if needed
                const fields = convertRedisFieldsToObject(rawFields);
                
                // Skip if conversion failed or fields are malformed
                if (!fields || typeof fields !== 'object') {
                  console.warn(`[admin-stream] Skipping entry ${id}: invalid fields structure`);
                  lastId = id;
                  continue;
                }

                // Safely access fields
                const rawData = fields.data;
                const eventName = fields.event;
                const rawTimestamp = fields.timestamp;

                // Validate data exists
                if (rawData === undefined) {
                  console.error(`[admin-stream] Skipping entry ${id}: data field is undefined`, {
                    fields,
                    eventName,
                    rawTimestamp
                  });
                  lastId = id;
                  continue;
                }

                // Parse the JSON data
                let parsedData: unknown;
                try {
                  // Handle case where data is already an object (some Redis clients parse it)
                  if (typeof rawData === 'object' && rawData !== null) {
                    parsedData = rawData;
                  } else {
                    // Data should be a JSON string
                    parsedData = JSON.parse(rawData);
                  }
                } catch (parseError) {
                  console.error(`[admin-stream] Skipping malformed data in event ${id}:`, {
                    error: parseError instanceof Error ? parseError.message : 'Parse failed',
                    rawData,
                    event: eventName
                  });
                  lastId = id;
                  continue;
                }

                // Safely parse timestamp
                const parsedTimestamp = rawTimestamp && !isNaN(Number(rawTimestamp)) 
                  ? parseInt(rawTimestamp) 
                  : Date.now();

                // Send valid event to client
                controller.enqueue(`data: ${JSON.stringify({
                  type: 'event',
                  id,
                  event: eventName || 'unknown',
                  data: parsedData,
                  timestamp: parsedTimestamp
                })}\n\n`);
                
                lastId = id;
              }
            }

            // Send heartbeat to keep connection alive
            controller.enqueue(': heartbeat\n\n');
          } catch (error) {
            console.error('[admin-stream] Redis read error:', error);
            // Don't crash the stream on Redis errors
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
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}