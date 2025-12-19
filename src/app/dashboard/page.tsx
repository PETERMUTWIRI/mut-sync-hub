// src/app/dashboard/page.tsx (Server Component)
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { stackServerApp } from '@/lib/stack';
import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';
import { Prisma } from '@prisma/client';

export default async function DashboardEntry() {
  // 1. AWAIT cookies (it's a Promise)
  const cookieStore = await cookies();
  
  // 2. Get Stack Auth session token
  const sessionToken = cookieStore.get('stack-session-token')?.value;
  if (!sessionToken) {
    redirect('/sign-in?redirectTo=/dashboard');
  }

  try {
    // 3. Get user from Stack Auth (correct API for server components)
    // Alternative using stackServerApp.getUser directly
        const user = await stackServerApp.getUser({ 
            or: 'throw',
            tokenStore: 'nextjs-cookie' // Let it handle the cookie automatically
        });
    
    if (!user) throw new Error('Invalid session');

    // 4. Fetch or CREATE userProfile (source of truth)
    let profile = await prisma.userProfile.findUnique({
      where: { userId: user.id },
      include: { organization: true },
    });

    // CRITICAL: Create profile if doesn't exist (first-time dashboard access)
    if (!profile) {
      // Create new organization for user
      const org = await prisma.organization.create({
        data: {
          id: uuidv4(),
          name: `Org-${user.id.slice(0, 8)}`,
          subdomain: `org-${user.id.slice(0, 8)}-${Date.now()}`,
          planId: '088c6a32-7840-4188-bc1a-bdc0c6bee723',
        },
      });

      // Auto-promote owner
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

    // 5. Update owner role if needed (safety check)
    if (user.primaryEmail === process.env.OWNER_EMAIL && profile.role !== 'SUPER_ADMIN') {
      profile = await prisma.userProfile.update({
        where: { id: profile.id },
        data: { role: 'SUPER_ADMIN' },
        include: { organization: true },
      });
    }

    // 6. Role-based redirect
    const role = profile.role.toLowerCase();
    if (role === 'super_admin') {
      redirect('/admin-dashboard');
    } else {
      redirect('/user-dashboard-main');
    }
    
  } catch (error) {
    console.error('Dashboard entry error:', error);
    redirect('/sign-in?redirectTo=/dashboard');
  }
}