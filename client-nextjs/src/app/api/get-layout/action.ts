'use server';

import { prisma } from '@/lib/prisma'; // ← singleton

export async function saveDashboardLayout(
  orgId: string,
  layout: any,
  mode: 'beginner' | 'power'
) {
  await prisma.userProfile.updateMany({
    where: { orgId },
    data: { dashboardLayout: layout, layoutMode: mode },
  });
  return { ok: true };
}