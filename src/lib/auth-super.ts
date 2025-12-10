// src/lib/auth-super.ts
import { stackServerApp } from '@/lib/stack';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Verifies user is THE platform owner (hardcoded email or role)
 */
export async function verifySuperAdmin(request: Request) {
  const user = await stackServerApp.getUser({ or: 'throw', tokenStore: 'nextjs-cookie' });
  
  // God-mode check: hardcode your email or use special role
  const SUPER_ADMIN_EMAILS = [
    process.env.OWNER_EMAIL,
    'owner@yourplatform.com' // Add your email here
  ];

  if (!user.primaryEmail || !SUPER_ADMIN_EMAILS.includes(user.primaryEmail)) {
    throw new Error('UNAUTHORIZED: Super admin access required');
  }

  return { user };
}