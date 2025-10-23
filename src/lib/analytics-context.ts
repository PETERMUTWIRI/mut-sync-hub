// src/lib/analytics-context.ts
import { OrgProfile, UsageQuota, Plan, Flag } from '@/lib/types';
import { getAnalyticsUsage } from '@/lib/billing';
import { prisma } from '@/lib/prisma';
import axios from 'axios';

const FLAG_URL = process.env.NEXT_PUBLIC_FLAG_URL!;

export async function getAnalyticsContext(userId: string) {
  const profile = await prisma.userProfile.findUnique({
    where: { userId },
    include: { organization: { include: { plan: true } } },
  });
  if (!profile) throw new Error('No profile');

  const orgId = profile.orgId;
  const [usage, flags] = await Promise.all([
    getAnalyticsUsage(orgId),
    axios.get<Flag[]>(`${FLAG_URL}/flags`).then(r => r.data),
  ]);

  return {
    orgId,
    role: profile.role,
    firstName: profile.firstName,
    lastName: profile.lastName,
    email: profile.email,
    plan: profile.organization.plan,
    usage,
    flags: new Map(flags.map(f => [f.key, f.enabled] as [string, boolean])),
  };
}