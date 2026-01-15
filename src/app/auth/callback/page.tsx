// src/app/auth/callback/page.tsx
import { redirect } from 'next/navigation';
import { stackServerApp } from '@/lib/stack';
import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';
import { Prisma } from '@prisma/client';
import { broadcastToOwner } from '@/lib/admin-broadcast';

type TrialInfo = {
  id: string;
  trial_days: number;
};

async function getDefaultPlanWithTrial(): Promise<TrialInfo> {
  try {
    const plan = await prisma.plan.findFirst({ 
      where: { name: 'Free' },
      select: { id: true, trial_days: true }
    });
    
    return {
      id: plan?.id || '088c6a32-7840-4188-bc1a-bdc0c6bee723',
      trial_days: plan?.trial_days || 30
    };
  } catch (error) {
    console.error('[auth-callback] Plan fetch failed:', error);
    return {
      id: '088c6a32-7840-4188-bc1a-bdc0c6bee723',
      trial_days: 30
    };
  }
}

function isProfileComplete(
  profile: any
): profile is { 
  id: string; 
  role: string; 
  organization: { 
    id: string; 
    planId: string | null; 
    trial_end_date: Date | null;
  };
} {
  return profile && 
         typeof profile === 'object' && 
         'organization' in profile && 
         profile.organization !== null;
}

export default async function AuthCallback() {
  try {
    // ✅ FIXED: Stack manages session internally - no cookie check needed
    const user = await stackServerApp.getUser();
    
    if (!user || !user.id) {
      console.error('[auth-callback] No authenticated user');
      redirect('/sign-in?error=auth_failed');
    }

    // ✅ Immediately fetch or create profile
    let profile = await prisma.userProfile.findUnique({
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

    // ✅ Profile creation with organization
    if (!profile) {
      try {
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
            trial_end_date: trialEndDate,
          }
        });

        const isOwner = user.primaryEmail === process.env.OWNER_EMAIL;
        
        profile = await prisma.userProfile.create({
          data: {
            id: uuidv4(),
            userId: user.id,
            orgId: org.id,
            role: isOwner ? 'SUPER_ADMIN' : 'USER',
            email: user.primaryEmail || '',
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

        // ✅ Async logging - non-blocking
        broadcastToOwner('org:profile:created', {
          userId: user.id,
          orgId: org.id,
          email: user.primaryEmail,
          planId,
          trialEndDate,
          role: profile.role,
        }).catch(err => console.error('[auth-callback] Log failed:', err));
      } catch (createError) {
        console.error('[auth-callback] Profile creation failed:', createError);
        redirect('/sign-in?error=profile_creation_failed');
      }
    }

    // ✅ Guard: Verify complete profile
    if (!isProfileComplete(profile)) {
      console.error('[auth-callback] Incomplete profile data');
      redirect('/sign-in?error=invalid_profile');
    }

    // After guard, profile is guaranteed to be non-null
    const validProfile = profile;

    // ✅ Trial expiration handling
    const now = new Date();
    if (!validProfile.role?.includes('ADMIN') && 
        validProfile.organization.trial_end_date && 
        validProfile.organization.trial_end_date < now) {
      
      try {
        const { id: freePlanId } = await getDefaultPlanWithTrial();
        
        await prisma.organization.update({
          where: { id: validProfile.organization.id },
          data: { 
            planId: freePlanId,
            trial_end_date: null
          }
        });
        
        // ✅ Reload updated profile
        const reloadedProfile = await prisma.userProfile.findUnique({
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
        if (reloadedProfile) {
          profile = reloadedProfile;
        }
      } catch (trialError) {
        console.error('[auth-callback] Trial handling failed:', trialError);
      }
    }

    // ✅ Owner role upgrade
    if (user.primaryEmail === process.env.OWNER_EMAIL && profile.role !== 'SUPER_ADMIN') {
      try {
        const updatedProfile = await prisma.userProfile.update({
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

        profile = updatedProfile;

        broadcastToOwner('org:profile:role-upgraded', {
          userId: user.id,
          orgId: profile.orgId,
          email: user.primaryEmail,
          newRole: 'SUPER_ADMIN',
        }).catch(err => console.error('[auth-callback] Log failed:', err));
      } catch (updateError) {
        console.error('[auth-callback] Owner role update failed:', updateError);
      }
    }

    // ✅ Intelligent role-based redirect
    const role = profile.role.toLowerCase();
    if (role === 'super_admin') {
      redirect('/admin-dashboard');
    } else {
      redirect('/user-dashboard-main');
    }
    
  } catch (error) {
    // ✅ Distinguish between redirect errors and real errors
    if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
      throw error; // Let Next.js handle redirects
    }
    
    console.error('[auth-callback] Fatal error:', error);
    redirect('/sign-in?error=auth_callback_failed');
  }
}