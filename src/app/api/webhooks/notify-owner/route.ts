// src/app/api/webhooks/notify-owner/route.ts
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
      console.error('[webhook:notify-owner] Invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const { event, data } = JSON.parse(body);
    
    // Validate payload
    if (!event) {
      console.error('[webhook:notify-owner] REJECTED: Missing event in payload');
      return NextResponse.json({ error: 'Missing event' }, { status: 400 });
    }
    
    if (data === undefined) {
      console.error('[webhook:notify-owner] REJECTED: data is undefined in webhook payload');
      return NextResponse.json({ error: 'Invalid data: undefined' }, { status: 400 });
    }

    await redis.xadd(`stream:admin:owner`, '*', {
      event,
      data: JSON.stringify(data), // Safe now because we validated
      timestamp: Date.now().toString()
    });

    return NextResponse.json({ 
      success: true, 
      event,
      message: 'Owner event queued'
    });
  } catch (error) {
    console.error('[webhook:notify-owner] Failed to process webhook:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

// Remove or secure the GET endpoint - it's not needed
export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}