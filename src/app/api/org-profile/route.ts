// src/app/api/org-profile/route.ts
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { stackServerApp } from '@/lib/stack';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
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

      // CRITICAL: Auto-promote owner email to SUPER_ADMIN
      const isOwner = user.primaryEmail === process.env.OWNER_EMAIL;
      
      profile = await prisma.userProfile.create({
        data: {
          id: uuidv4(),
          userId: user.id,
          orgId: org.id, // ✅ User gets their OWN org
          role: isOwner ? 'SUPER_ADMIN' : 'USER',
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

    // Also update existing profile if owner logs in with old USER role
    if (user.primaryEmail === process.env.OWNER_EMAIL && profile.role !== 'SUPER_ADMIN') {
      profile = await prisma.userProfile.update({
        where: { id: profile.id },
        data: { role: 'SUPER_ADMIN' },
        include: { organization: true },
      });
    }

    const planId = profile.organization.planId ?? '088c6a32-7840-4188-bc1a-bdc0c6bee723';
    const plan = await prisma.plan.findUnique({ where: { id: planId } });

    return NextResponse.json({
      userId: user.id,
      profileId: profile.id,
      orgId: profile.orgId,
      role: profile.role,
      isTechnical: profile.isTechnical,
      layoutMode: profile.layoutMode,
      dashboardLayout: profile.dashboardLayout,
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      status: profile.status,
      mfaEnabled: profile.mfaEnabled,
      failedLoginAttempts: profile.failedLoginAttempts,
      lastLoginAt: profile.lastLoginAt,
      organization: profile.organization,
      plan,
      flags: profile.featureFlags ?? {},
    });
  } catch (e: any) {
    console.error('[org-profile]', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}