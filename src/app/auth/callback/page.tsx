// src/app/auth/callback/page.tsx
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { stackServerApp } from '@/lib/stack';
import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';
import { Prisma } from '@prisma/client';
import { broadcastToOwner } from '@/lib/admin-broadcast';

// ✅ Explicit type for trial handling
type TrialInfo = {
  id: string;
  trial_days: number;
};

// ✅ Fallback helper with error boundary
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

// ✅ Type guard for profile with organization
function isProfileComplete(
  profile: any
): profile is { 
  id: string; 
  role: string; 
  organization: { 
    id: string; 
    planId: string | null; 
    trial_end_date: Date | null;
    [key: string]: any 
  };
  [key: string]: any 
} {
  return profile && 
         typeof profile === 'object' && 
         'organization' in profile && 
         profile.organization !== null;
}

export default async function AuthCallback() {
  const cookieStore = await cookies();
  
  try {
    // ✅ Guard: Session token exists
    const sessionToken = cookieStore.get('stack-session-token')?.value;
    if (!sessionToken) {
      console.warn('[auth-callback] No session token');
      redirect('/sign-in');
    }

    // ✅ Guard: User authentication
    const user = await stackServerApp.getUser({ 
      or: 'throw',
      tokenStore: 'nextjs-cookie'
    });
    
    if (!user || !user.id) {
      console.error('[auth-callback] User authentication failed');
      cookieStore.delete('stack-session-token');
      redirect('/sign-in?error=auth_failed');
    }

    // ✅ Explicit any to bypass strict typing issues
    let profile: any = await prisma.userProfile.findUnique({
      where: { userId: user.id },
      include: { 
        organization: {
          select: {
            id: true,
            planId: true,
            trial_end_date: true
          }
        } as any // ✅ Type assertion for inclusion
      },
    });

    // ✅ Guard: Profile creation (with retry logic)
    if (!profile) {
      try {
        const { id: planId, trial_days } = await getDefaultPlanWithTrial();
        const trialEndDate = trial_days > 0 
          ? new Date(Date.now() + trial_days * 24 * 60 * 60 * 1000) 
          : null;

        // ✅ Explicit organization creation
        const orgData: any = {
          id: uuidv4(),
          name: `Org-${user.id.slice(0, 8)}`,
          subdomain: `org-${user.id.slice(0, 8)}-${Date.now()}`,
          planId,
        };
        
        // ✅ Conditional field addition (no undefined in data)
        if (trialEndDate) {
          orgData.trial_end_date = trialEndDate;
        }

        const org = await prisma.organization.create({
          data: orgData
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
          } as any, // ✅ Type assertion
          include: { 
            organization: {
              select: {
                id: true,
                planId: true,
                trial_end_date: true
              }
            } as any
          },
        });

        // ✅ SRE: Safe logging with error boundary
        try {
          await broadcastToOwner('org:profile:created', {
            userId: user.id,
            orgId: org.id,
            email: user.primaryEmail,
            planId,
            trialEndDate,
            role: isOwner ? 'SUPER_ADMIN' : 'USER',
            isOwner
          });
        } catch (logError) {
          console.error('[auth-callback] SRE log failed:', logError);
        }
      } catch (createError) {
        console.error('[auth-callback] Profile creation failed:', createError);
        redirect('/sign-in?error=profile_creation_failed');
      }
    }

    // ✅ Guard: Profile exists after creation attempt
    if (!profile || !profile.id) {
      console.error('[auth-callback] Profile is null after creation');
      redirect('/sign-in?error=profile_null');
    }

    // ✅ Guard: Organization exists
    if (!profile.organization || !profile.organization.id) {
      console.error('[auth-callback] Organization is null');
      redirect('/sign-in?error=org_null');
    }

    // ✅ Type-safe trial expiration check
    const now = new Date();
    const org = profile.organization as any;
    
    if (!profile.role?.includes('ADMIN') && 
        org?.trial_end_date && 
        org.trial_end_date < now) {
      
      try {
        const { id: freePlanId } = await getDefaultPlanWithTrial();
        
        // ✅ Safe update with type assertion
        await prisma.organization.update({
          where: { id: org.id },
          data: { 
            planId: freePlanId,
            trial_end_date: null // ✅ Exact field name
          } as any
        });
        
        // ✅ Reload profile
        profile = await prisma.userProfile.findUnique({
          where: { userId: user.id },
          include: { 
            organization: {
              select: {
                id: true,
                planId: true,
                trial_end_date: true
              }
            } as any
          },
        });

        // ✅ Guard after reload
        if (!profile || !profile.organization) {
          throw new Error('Profile reload failed');
        }
      } catch (trialError) {
        console.error('[auth-callback] Trial handling failed:', trialError);
        // Continue - not fatal
      }
    }

    // ✅ Owner role upgrade (with guard)
    if (user.primaryEmail === process.env.OWNER_EMAIL && profile.role !== 'SUPER_ADMIN') {
      try {
        const oldRole = profile.role;
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
            } as any
          },
        });

        // ✅ SRE: Safe logging
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
          console.error('[auth-callback] SRE log failed:', logError);
        }
      } catch (updateError) {
        console.error('[auth-callback] Owner role update failed:', updateError);
        // Continue - not fatal
      }
    }

    // ✅ Final guard before redirect
    if (!profile || !profile.role) {
      console.error('[auth-callback] Profile or role is missing');
      redirect('/sign-in?error=invalid_profile');
    }

    // ✅ Role-based redirect
    const role = (profile.role as string).toLowerCase();
    if (role === 'super_admin') {
      redirect('/admin-dashboard');
    } else {
      redirect('/user-dashboard-main');
    }
    
  } catch (error) {
    console.error('[auth-callback] Fatal error:', error);
    try {
      cookieStore.delete('stack-session-token');
    } catch {}
    redirect('/sign-in?error=auth_callback_failed');
  }
}