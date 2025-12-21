// src/app/api/org-profile/route.ts
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { stackServerApp } from '@/lib/stack';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '@/lib/prisma';
import { broadcastToOwner } from '@/lib/admin-broadcast'; // ✅ Added

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
  let userId: string | undefined;
  let orgId: string | undefined;

  try {
    const user = await stackServerApp.getUser({ or: 'throw', tokenStore: 'nextjs-cookie' });
    userId = user.id;

    let profile = await prisma.userProfile.findUnique({
      where: { userId: user.id },
      include: { organization: true },
    });

    // If profile doesn't exist, create it (new user signup)
    if (!profile) {
      const { id: defaultPlanId, trial_days } = await getDefaultPlanWithTrial();
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
      orgId = org.id;

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

      // ✅ SRE: Log new profile creation
      try {
        await broadcastToOwner('org:profile:created', {
          userId: user.id,
          orgId: org.id,
          email: user.primaryEmail,
          planId: defaultPlanId,
          trialEndDate,
          role: isOwner ? 'SUPER_ADMIN' : 'USER',
          isOwner
        });
      } catch (logError) {
        console.error('[org-profile] SRE log failed:', logError);
      }
    }

    // Guard: profile should never be null after creation
    if (!profile) {
      return NextResponse.json({ error: 'Profile creation failed' }, { status: 500 });
    }

    // Check if trial expired for non-owners
    const now = new Date();
    if (!profile.role.includes('ADMIN') && profile.organization.trial_end_date && profile.organization.trial_end_date < now) {
      const oldPlanId = profile.organization.planId;
      const newPlan = await getDefaultPlanWithTrial();
      
      // Trial expired - downgrade to free plan permanently
      await prisma.organization.update({
        where: { id: profile.organization.id },
        data: { 
          planId: newPlan.id,
          trial_end_date: null
        }
      });
      
      // ✅ SRE: Log trial expiration
      try {
        await broadcastToOwner('org:profile:trial-expired', {
          userId: user.id,
          orgId: profile.organization.id,
          email: user.primaryEmail,
          oldPlanId,
          newPlanId: newPlan.id,
          trialEndDate: profile.organization.trial_end_date
        });
      } catch (logError) {
        console.error('[org-profile] SRE log failed:', logError);
      }

      // Reload profile after downgrade
      profile = await prisma.userProfile.findUnique({
        where: { userId: user.id },
        include: { organization: true },
      });
    }

    // Guard again after potential reload
    if (!profile) {
      return NextResponse.json({ error: 'Profile reload failed' }, { status: 500 });
    }

    // Also update existing profile if owner logs in with old USER role
    if (user.primaryEmail === process.env.OWNER_EMAIL && profile.role !== 'SUPER_ADMIN') {
      const oldRole = profile.role;
      profile = await prisma.userProfile.update({
        where: { id: profile.id },
        data: { role: 'SUPER_ADMIN' },
        include: { organization: true },
      });

      // ✅ SRE: Log owner role upgrade
      try {
        await broadcastToOwner('org:profile:role-updated', {
          userId: user.id,
          orgId: profile.orgId,
          email: user.primaryEmail,
          oldRole,
          newRole: 'SUPER_ADMIN',
          reason: 'owner_login'
        });
      } catch (logError) {
        console.error('[org-profile] SRE log failed:', logError);
      }
    }

    const planId = profile.organization.planId ?? undefined;
    const plan = planId ? await prisma.plan.findUnique({ where: { id: planId } }) : null;

    // ✅ SRE: Log successful profile fetch
    try {
      await broadcastToOwner('org:profile:fetch-success', {
        userId: user.id,
        orgId: profile.orgId,
        email: user.primaryEmail,
        role: profile.role,
        planId,
        trialActive: profile.organization.trial_end_date && profile.organization.trial_end_date > new Date()
      });
    } catch (logError) {
      console.error('[org-profile] SRE log failed:', logError);
    }

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
      shouldRedirectAdmin: profile.role === 'SUPER_ADMIN'
    });
  } catch (e: any) {
    // ✅ SRE: Log error
    try {
      await broadcastToOwner('org:profile:error', {
        userId,
        orgId,
        error: e.message,
        stack: e.stack,
        timestamp: Date.now()
      });
    } catch (logError) {
      console.error('[org-profile] SRE log failed:', logError);
    }

    console.error('[org-profile]', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}