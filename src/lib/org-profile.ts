'use server';

// src/lib/org-profile.ts
import { prisma } from '@/lib/prisma';
import { stackServerApp } from '@/lib/stack';
import { Prisma, $Enums } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

export async function getOrgProfileInternal(): Promise<{
  userId: string;
  profileId: string;
  orgId: string;
  role: string;
  email: string | null;
  organization: {
    id: string;
    name: string;
    status: $Enums.OrgStatus;
    createdAt: Date;
    updatedAt: Date;
    subdomain: string;
    settings: Prisma.JsonValue | null;
    planId: string | null;
  };
  plan: Prisma.PlanGetPayload<true> | null;
}> {
  const user = await stackServerApp.getUser({ or: 'throw', tokenStore: 'nextjs-cookie' });

  let profile = await prisma.userProfile.findUnique({
    where: { userId: user.id },
    include: { organization: true },
  });

  if (!profile) {
    
    // ✅ CORRECT: Always create NEW organization for new user
    const org = await prisma.organization.create({
      data: {
        id: uuidv4(),
        name: `Org-${user.id.slice(0, 8)}`,
        subdomain: `org-${user.id.slice(0, 8)}-${Date.now()}`,
        planId: '088c6a32-7840-4188-bc1a-bdc0c6bee723',
      },
    });
    
    profile = await prisma.userProfile.create({
      data: {
        id: uuidv4(),
        userId: user.id,
        orgId: org.id, // ✅ User gets their OWN org
        role: 'USER',
        email: user.primaryEmail,
        firstName: user.displayName?.split(' ')[0] ?? null,
        lastName: user.displayName?.split(' ').slice(1).join(' ') ?? null,
        isTechnical: false,
        layoutMode: 'beginner',
        dashboardLayout: Prisma.DbNull,
        status: 'ACTIVE',
        mfaEnabled: false,
        failedLoginAttempts: 0,
      },
      include: { organization: true },
    });
  }

  return {
    userId: user.id,
    profileId: profile.id,
    orgId: profile.orgId,
    role: profile.role,
    email: user.primaryEmail,
    organization: profile.organization,
    plan: await prisma.plan.findUnique({
      where: { id: profile.organization.planId ?? '088c6a32-7840-4188-bc1a-bdc0c6bee723' }
    })
  };
}