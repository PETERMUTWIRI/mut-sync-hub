// src/app/auth/callback/page.tsx
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { stackServerApp } from '@/lib/stack';
import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';
import { Prisma } from '@prisma/client';

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

export default async function AuthCallback() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('stack-session-token')?.value;
  
  if (!sessionToken) {
    redirect('/sign-in');
  }

  try {
    const user = await stackServerApp.getUser({ 
      or: 'throw',
      tokenStore: 'nextjs-cookie'
    });
    
    if (!user) throw new Error('Invalid session');

    // ✅ FIXED: Include organization in query
    let profile = await prisma.userProfile.findUnique({
      where: { userId: user.id },
      include: { 
        organization: {
          select: {
            id: true,
            planId: true,
            trial_end_date: true // ✅ Explicitly select this field
          }
        }
      },
    });

    // Create profile if doesn't exist
    if (!profile) {
      const { id: planId, trial_days } = await getDefaultPlanWithTrial();
      const trialEndDate = trial_days > 0 
        ? new Date(Date.now() + trial_days * 24 * 60 * 60 * 1000) 
        : null;

      const org = await prisma.organization.create({
        data: {
          id: uuidv4(),
          name: `Org-${user.id.slice(0, 8)}`,
          subdomain: `org-${user.id.slice(0, 8)}-${Date.now()}`,
          planId,
          trial_end_date: trialEndDate, // ✅ Use exact field name
        },
      });

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
        include: {
          organization: {
            select: {
              id: true,
              planId: true,
              trial_end_date: true
            }
          }
        },
      });
    }

    // ✅ FIXED: Handle trial expiration
    const now = new Date();
    if (!profile.role.includes('ADMIN') && 
        profile.organization?.trial_end_date && 
        profile.organization.trial_end_date < now) {
      const { id: freePlanId } = await getDefaultPlanWithTrial();
      
      await prisma.organization.update({
        where: { id: profile.organization.id },
        data: { 
          planId: freePlanId,
          trial_end_date: null // ✅ Use exact field name
        }
      });
      
      // Reload profile
      profile = await prisma.userProfile.findUnique({
        where: { userId: user.id },
        include: {
          organization: {
            select: {
              id: true,
              planId: true,
              trial_end_date: true
            }
          }
        },
      });
    }

    // ✅ FIXED: Update owner role
    if (user.primaryEmail === process.env.OWNER_EMAIL && profile.role !== 'SUPER_ADMIN') {
      profile = await prisma.userProfile.update({
        where: { id: profile.id },
        data: { role: 'SUPER_ADMIN' },
        include: {
          organization: {
            select: {
              id: true,
              planId: true,
              trial_end_date: true
            }
          }
        },
      });
    }

    // ✅ FIXED: Null check for profile
    if (!profile) {
      throw new Error('Profile creation failed');
    }

    // ✅ FIXED: Null check for organization
    if (!profile.organization) {
      throw new Error('Organization not found');
    }

    // Role-based redirect
    const role = profile.role.toLowerCase();
    if (role === 'super_admin') {
      redirect('/admin-dashboard');
    } else {
      redirect('/user-dashboard-main');
    }
    
  } catch (error) {
    console.error('Auth callback error:', error);
    cookieStore.delete('stack-session-token');
    redirect('/sign-in?error=authentication_failed');
  }
}