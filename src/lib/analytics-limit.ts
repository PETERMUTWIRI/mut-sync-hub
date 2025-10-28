
'use server';
import { getAnalyticsUsage } from './analytics-usage';

export async function enforceAnalyticsLimit(orgId: string, feature: string) {
  const usage = await getAnalyticsUsage(orgId);
  if (usage.locked) throw new Error(`${feature} limit reached – upgrade to continue.`);
}