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
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const { event, data } = JSON.parse(body);
    
    await redis.xadd(`stream:admin:owner`, '*', {
      event,
      data: JSON.stringify(data),
      timestamp: Date.now().toString()
    });

    return NextResponse.json({ 
      success: true, 
      event,
      message: 'Owner event queued'
    });
  } catch (error) {
    console.error('[webhook:notify-owner]', error);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Owner notification webhook' });
}