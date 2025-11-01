export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getPlanUuid } from '@/app/actions/plans';
import { PLANS } from '@/app/actions/plans';
import moment from 'moment';

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams;
  const userId = search.get('userId');
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

  // 1. fetch the user to get orgId
  const user = await prisma.userProfile.findUnique({ where: { id: userId }, select: { orgId: true } });
  if (!user?.orgId) return NextResponse.json({ progress: 0, limit: 0, count: 0 });

  // 2. fetch the organisation to get the plan
  const org = await prisma.organization.findUnique({ where: { id: user.orgId }, select: { planId: true } });
  const planId = org?.planId || getPlanUuid('free');
  const plan = PLANS.find((p) => getPlanUuid(p.id) === planId)!;
  const feat = plan.features.find((f) => f.name === 'Payments');
  const limit = feat?.limit ?? 0;
  const start = moment().startOf('month').toDate();
  const count = await prisma.payment.count({
    where: { orgId: user.orgId, createdAt: { gte: start }, status: 'COMPLETED' },
  });

  return NextResponse.json({
    progress: limit ? Math.min(count / limit, 1) : 0,
    limit,
    count,
  });
}