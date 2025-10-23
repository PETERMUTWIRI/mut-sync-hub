'use server';
import { prisma } from '@/lib/prisma';
import { UsageQuota } from '@/lib/types';
import moment from 'moment';

export async function getAnalyticsUsageServer(orgId: string): Promise<UsageQuota> {
  const start = moment().startOf('month').toDate();
  const [exports, schedules] = await Promise.all([
    prisma.analyticsReport.count({ where: { orgId, createdAt: { gte: start }, type: 'EXPORT' } }),
    prisma.analyticsSchedule.count({ where: { orgId, createdAt: { gte: start } } }),
  ]);
  const plan = await prisma.organization.findUnique({ where: { id: orgId }, include: { plan: true } });
  const limit = (plan?.plan?.features as any[])?.find((f: any) => f.name === 'Analytics-Export')?.limit ?? 0;
  return { used: exports, limit, remaining: Math.max(0, limit - exports), locked: limit > 0 && exports >= limit };
}

export async function enforceAnalyticsLimitServer(orgId: string, feature: string) {
  const usage = await getAnalyticsUsageServer(orgId);
  if (usage.locked) throw new Error(`${feature} limit reached – upgrade to continue.`);
}