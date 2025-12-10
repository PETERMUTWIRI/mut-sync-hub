// src/app/api/admin/stream/route.ts
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

import { NextRequest, NextResponse } from 'next/server';
import { verifySuperAdmin } from '@/lib/auth-super';
import { redis } from '@/lib/redis';

// Define Upstash response type
type UpstashXReadResponse = [[string, [string, Record<string, string>][]]] | null;

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
            const response = await redis.xread(
              'stream:admin:owner',
              lastId,
              { blockMS: 5000, count: 10 }
            ) as UpstashXReadResponse; // ✅ Type assertion

            if (response && Array.isArray(response) && Array.isArray(response[0])) {
              const [, entries] = response[0];
              
              if (Array.isArray(entries)) {
                for (const [id, fields] of entries) {
                  lastId = id;
                  controller.enqueue(`data: ${JSON.stringify({
                    type: 'event',
                    id,
                    event: fields.event,
                    data: JSON.parse(fields.data),
                    timestamp: parseInt(fields.timestamp)
                  })}\n\n`);
                }
              }
            }

            controller.enqueue(': heartbeat\n\n');
          } catch (error) {
            console.error('[admin-stream] error:', error);
            controller.error(error);
          }

          if (isActive) setTimeout(checkForUpdates, 100);
        };

        checkForUpdates();

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
    console.error('[admin-stream] auth error:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}