export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/lib/stack';
import { prisma } from '@/lib/prisma';
import { enforceAnalyticsLimit } from '@/lib/billing';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const user = await stackServerApp.getUser({ or: 'throw', tokenStore: 'nextjs-cookie' });
    const profile = await prisma.userProfile.findUnique({
      where: { userId: user.id },
      include: { organization: true },
    });
    if (!profile) throw new Error('Profile not found');

    const { planId, billingInfo } = await req.json();
    if (!planId) throw new Error('planId required');

    const newPlan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!newPlan) throw new Error('Plan not found');

    await enforceAnalyticsLimit(profile.orgId, 'Plan-Upgrade');

    const now = new Date();
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate()); // 1 month

    const sub = await prisma.subscription.upsert({
      where: { orgId: profile.orgId },
      update: {
        plan: newPlan.name,
        status: 'ACTIVE',
        endDate,
        billingInfo: billingInfo ?? {},
      },
      create: {
        id: uuidv4(),
        orgId: profile.orgId,
        plan: newPlan.name,
        status: 'ACTIVE',
        startDate: now,
        endDate,
        billingInfo: billingInfo ?? {},
      },
    });

    await prisma.organization.update({
      where: { id: profile.orgId },
      data: { planId: newPlan.id },
    });

    return NextResponse.json({ ok: true, subscriptionId: sub.id });
  } catch (e: any) {
    console.error('[api/subscription/upgrade]', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}