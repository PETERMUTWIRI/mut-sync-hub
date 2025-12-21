// src/app/api/webhooks/notify-org/route.ts
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 10;

import { NextRequest, NextResponse } from 'next/server';
import { qstashReceiver } from '@/lib/qstash';
import { redis } from '@/lib/redis';

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get('upstash-signature') || '';
    const body = await req.text();
    
    if (!await qstashReceiver.verify({ signature, body })) {
      console.error('[webhook:notify-org] Invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const { orgId, event, data } = JSON.parse(body);
    
    // Validate payload
    if (!orgId) {
      console.error('[webhook:notify-org] REJECTED: Missing orgId');
      return NextResponse.json({ error: 'Missing orgId' }, { status: 400 });
    }
    
    if (!event) {
      console.error('[webhook:notify-org] REJECTED: Missing event');
      return NextResponse.json({ error: 'Missing event' }, { status: 400 });
    }
    
    if (data === undefined) {
      console.error('[webhook:notify-org] REJECTED: data is undefined');
      return NextResponse.json({ error: 'Invalid data: undefined' }, { status: 400 });
    }

    await redis.xadd(`stream:org:${orgId}`, '*', {
      event,
      data: JSON.stringify(data), // Safe now because we validated
      timestamp: Date.now().toString()
    });

    return NextResponse.json({ 
      success: true, 
      event, 
      orgId,
      message: 'Org event queued'
    });
  } catch (error) {
    console.error('[webhook:notify-org] Failed to process webhook:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

// Remove or secure the GET endpoint
export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}