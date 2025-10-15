'use server';
import { prisma } from '@/lib/prisma';

export async function getRawOrgProfile(userId: string) {
  const profile = await prisma.userProfile.findUnique({
    where: { userId },
    include: { organization: true },
  });
  if (!profile) throw new Error('Profile not found');

  const plan = await prisma.plan.findUnique({
    where: { id: profile.organization.planId ?? '088c6a32-7840-4188-bc1a-bdc0c6bee723' },
  });

  return {
    orgId: profile.orgId,
    role: profile.role,
    plan,
  };
}