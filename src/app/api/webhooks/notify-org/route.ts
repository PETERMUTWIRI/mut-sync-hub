// src/app/api/webhooks/notify-org/route.ts
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 10;

import { NextRequest, NextResponse } from 'next/server';
import { qstashReceiver } from '@/lib/qstash';
import { redis } from '@/lib/redis';

export async function POST(req: NextRequest) {
  try {
    // Verify QStash signature (free tier: 10K verifications/month)
    const signature = req.headers.get('upstash-signature') || '';
    const body = await req.text();
    
    if (!await qstashReceiver.verify({ signature, body })) {
      return NextResponse.json({ error: 'Invalid QStash signature' }, { status: 401 });
    }

    const { orgId, event, data } = JSON.parse(body);

    // Store event (already done, but idempotent for safety)
    await redis.xadd(`stream:org:${orgId}`, '*', {
      event,
      data: JSON.stringify(data),
      timestamp: Date.now().toString()
    });

    // The SSE connection will be woken up by this write
    // Frontend listens to /api/notifications/stream
    
    return NextResponse.json({ 
      success: true, 
      event, 
      orgId,
      message: 'Event queued for SSE delivery'
    });
  } catch (error) {
    console.error('[webhook:notify-org]', error);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Org notification webhook' });
}