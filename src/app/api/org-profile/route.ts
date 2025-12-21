// src/app/api/org-profile/route.ts
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { stackServerApp } from '@/lib/stack';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '@/lib/prisma';

// Helper to get default plan with trial info
async function getDefaultPlanWithTrial() {
  const plan = await prisma.plan.findFirst({ 
    where: { name: 'Free' },
    select: { id: true, trial_days: true }
  });
  
  return {
    id: plan?.id || '088c6a32-7840-4188-bc1a-bdc0c6bee723',
    trial_days: plan?.trial_days || 30
  };
}

export async function GET(req: NextRequest) {
  try {
    const user = await stackServerApp.getUser({ or: 'throw', tokenStore: 'nextjs-cookie' });

    let profile = await prisma.userProfile.findUnique({
      where: { userId: user.id },
      include: { organization: true },
    });

    // If profile doesn't exist, create it (new user signup)
    if (!profile) {
      const { id: defaultPlanId, trial_days } = await getDefaultPlanWithTrial();
      
      // Calculate trial end date if trial_days > 0
      const trialEndDate = trial_days > 0 
        ? new Date(Date.now() + trial_days * 24 * 60 * 60 * 1000) 
        : null;

      const org = await prisma.organization.create({
        data: {
          id: uuidv4(),
          name: `Org-${user.id.slice(0, 8)}`,
          subdomain: `org-${user.id.slice(0, 8)}-${Date.now()}`,
          planId: defaultPlanId,
          trial_end_date: trialEndDate,
        },
      });

      // CRITICAL: Auto-promote owner email to SUPER_ADMIN
      const isOwner = user.primaryEmail === process.env.OWNER_EMAIL;
      
      profile = await prisma.userProfile.create({
        data: {
          id: uuidv4(),
          userId: user.id,
          orgId: org.id,
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

    // Check if trial expired for non-owners
    const now = new Date();
    if (!profile.role.includes('ADMIN') && profile.organization.trial_end_date && profile.organization.trial_end_date < now) {
      // Trial expired - downgrade to free plan permanently
      await prisma.organization.update({
        where: { id: profile.organization.id },
        data: { 
          planId: (await getDefaultPlanWithTrial()).id,
          trial_end_date: null // Clear trial date after downgrade
        }
      });
      
      // Reload profile after downgrade
      profile = await prisma.userProfile.findUnique({
        where: { userId: user.id },
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

    const planId = profile.organization.planId;
    const plan = await prisma.plan.findUnique({ where: { id: planId } });

    // Return role info for redirect decisions
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
      organization: {
        ...profile.organization,
        trial_end_date: profile.organization.trial_end_date,
        trial_active: profile.organization.trial_end_date && profile.organization.trial_end_date > new Date(),
        trial_days_remaining: profile.organization.trial_end_date ? 
          Math.ceil((profile.organization.trial_end_date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0
      },
      plan,
      flags: profile.featureFlags ?? {},
      // Add redirect hint for frontend
      shouldRedirectAdmin: profile.role === 'SUPER_ADMIN'
    });
  } catch (e: any) {
    console.error('[org-profile]', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}