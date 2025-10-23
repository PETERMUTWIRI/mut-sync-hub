"use server";

import { PrismaClient, Prisma } from '@prisma/client';
import { stackServerApp } from '@/lib/stack';
import { v4 as uuidv4 } from 'uuid';
import { neon } from '@neondatabase/serverless';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();
const sql = neon(process.env.DATABASE_URL!);

export async function ensureAndFetchUserProfile() {
  const cookieStore = cookies();
  const user = await stackServerApp.getUser({ or: 'throw', tokenStore: 'nextjs-cookie' });
  const userId = user.id;

  // RLS helper
  await sql`SELECT set_config('session.jwt', ${JSON.stringify({ user_id: userId })}, true)`;

  // 1.  fetch existing profile (include new fields)
  let profile = await prisma.userProfile.findUnique({
    where: { userId },
    select: {
      id: true,
      role: true,
      orgId: true,
      isTechnical: true,
      dashboardLayout: true,
      layoutMode: true,
      firstName: true, // ← new
      lastName: true,  // ← new
      email: true,     // ← new
    },
  });

  // 2.  auto-create org + profile if missing
  if (!profile) {
    let org = await prisma.organization.findFirst({ select: { id: true } });
    if (!org) {
      const orgId = uuidv4();
      await prisma.organization.create({
        data: {
          id: orgId,
          name: `Org-${userId.slice(0, 8)}`,
          subdomain: `org-${userId.slice(0, 8)}-${Date.now()}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      org = { id: orgId };
    }

    profile = await prisma.userProfile.create({
      data: {
        id: uuidv4(),
        userId,
        orgId: org.id,
        role: 'USER',
        status: 'ACTIVE',
        mfaEnabled: false,
        failedLoginAttempts: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        isTechnical: false,
        layoutMode: 'beginner',
        dashboardLayout: Prisma.DbNull,
      },
      select: {
        id: true,
        role: true,
        orgId: true,
        isTechnical: true,
        dashboardLayout: true,
        layoutMode: true,
        firstName: true, // ← new
        lastName: true,  // ← new
        email: true,     // ← new
      },
    });
  }

  // 3.  return everything downstream code needs
  return {
    userId,
    profileId: profile.id,
    role: profile.role || 'USER',
    orgId: profile.orgId,
    isTechnical: profile.isTechnical || false,
    dashboardLayout: profile.dashboardLayout || null,
    layoutMode: profile.layoutMode || 'beginner',
    firstName: profile.firstName || null, // ← new
    lastName: profile.lastName || null,   // ← new
    email: profile.email || null,         // ← new
  };
}
