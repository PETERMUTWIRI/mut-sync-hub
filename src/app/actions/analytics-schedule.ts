// 'use server';
// import { prisma } from '@/lib/prisma';
// import { enforceAnalyticsLimit } from '@/lib/analytics-limit';

// export async function createScheduledReport(orgId: string, cron: string) {
//   await enforceAnalyticsLimit(orgId, 'Analytics-Schedule');
//   return await prisma.analyticsSchedule.create({
//     data: { orgId, frequency: cron, nextRun: new Date() }, // simplified – parse cron IRL
//   });
// }