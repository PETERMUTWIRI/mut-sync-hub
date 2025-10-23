import { prisma } from '@/lib/prisma';
import moment from 'moment';

interface Usage {
  used: number;
  limit: number;
  remaining: number;
  locked: boolean;
}

export async function getAnalyticsUsage(orgId: string): Promise<Usage> {
  const start = moment().startOf('month').toDate();
  // every PDF export or scheduled job counts as 1
  const exports = await prisma.analyticsReport.count({
    where: { orgId, createdAt: { gte: start }, type: 'EXPORT' },
  });
  const schedules = await prisma.analyticsSchedule.count({
    where: { orgId, createdAt: { gte: start } },
  });
  const used = exports + schedules;

  // read limit from plan
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    include: { plan: true },
  });
  const planId = org?.planId ?? '088c6a32-7840-4188-bc1a-bdc0c6bee723'; // free uuid
  const plan = await prisma.plan.findUnique({ where: { id: planId } });
  const limit = (plan?.features as any[])?.find((f: any) => f.name === 'Analytics-Export')?.limit ?? 0;

  return { used, limit, remaining: Math.max(0, limit - used), locked: limit > 0 && used >= limit };
}