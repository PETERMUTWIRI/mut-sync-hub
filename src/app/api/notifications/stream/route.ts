// src/app/api/notifications/stream/route.ts
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

import { NextRequest, NextResponse } from 'next/server';
import { getOrgProfileInternal } from '@/lib/org-profile';
import { redis } from '@/lib/redis';

type UpstashXReadResponse = [[string, [string, Record<string, string>][]]] | null;

export async function GET(req: NextRequest) {
  try {
    const { orgId } = await getOrgProfileInternal();

    const stream = new ReadableStream({
      async start(controller) {
        controller.enqueue(': connected\n\n');
        
        let lastId = '0';
        let isActive = true;

        const checkForUpdates = async () => {
          if (!isActive) return;

          try {
            const response = await redis.xread(
              `stream:org:${orgId}`,
              lastId,
              { blockMS: 5000, count: 10 }
            ) as UpstashXReadResponse;

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
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}