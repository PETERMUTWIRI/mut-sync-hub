import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = headers().get('stripe-signature')!;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err) {
    return NextResponse.json({ error: 'Bad signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const orgId = session.client_reference_id!;
    const priceId = session.line_items!.data[0].price.id;

    // map price → plan
    const planMap: Record<string, string> = {
      'price_1OPrf1K7fLq2fQ5n1Y1fQ5n1': 'growth',   // \$29
      'price_1OPrf2K7fLq2fQ5n1Y1fQ5n2': 'scale',    // \$99
    };
    const planId = planMap[priceId] ?? 'free';

    // update organisation plan
    await prisma.organization.update({ where: { id: orgId }, data: { planId } });

    // reset usage counters (optional)
    await prisma.analyticsReport.deleteMany({ where: { orgId } });
    await prisma.analyticsSchedule.deleteMany({ where: { orgId } });

    // email “unlocked”
    await fetch('/api/email/unlocked', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orgId, plan: planId }),
    });
  }

  return NextResponse.json({ received: true });
}