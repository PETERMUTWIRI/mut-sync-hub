import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/lib/stack';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const user = await stackServerApp.getUser({ or: 'throw', tokenStore: 'nextjs-cookie' });
    const profile = await prisma.userProfile.findUnique({
      where: { userId: user.id },
      include: { organization: { include: { plan: true, subscription: true } } },
    });
    if (!profile) throw new Error('Profile not found');

    const sub = profile.organization.subscription;
    const plan = profile.organization.plan;

    return NextResponse.json({
      title: plan?.name ?? 'Free',
      features: (plan?.features as any[])?.map((f: any) => f.name) ?? ['Basic Analytics'],
      expiresAt: sub?.endDate ? sub.endDate.toISOString() : null,
      subscriptionId: sub?.id ?? null,
      status: sub?.status ?? 'ACTIVE',
    });
  } catch (e: any) {
    console.error('[api/subscription]', e);
    return NextResponse.json({ title: 'Free', features: ['Basic Analytics'], expiresAt: null, subscriptionId: null, status: 'ACTIVE' }, { status: 200 });
  }
}