// import { prisma } from '@/lib/prisma';
// import { stackServerApp } from '@/lib/stack';
// import { Prisma } from '@prisma/client';
// import { v4 as uuidv4 } from 'uuid';

// export async function getOrgProfileInternal() {
//   const user = await stackServerApp.getUser({ or: 'throw', tokenStore: 'nextjs-cookie' });

//   let profile = await prisma.userProfile.findUnique({
//     where: { userId: user.id },
//     include: { organization: true },
//   });

//   if (!profile) {
//     let org = await prisma.organization.findFirst({});
//     if (!org) {
//       org = await prisma.organization.create({
//         data: {
//           id: uuidv4(),
//           name: `Org-${user.id.slice(0, 8)}`,
//           subdomain: `org-${user.id.slice(0, 8)}-${Date.now()}`,
//           planId: '088c6a32-7840-4188-bc1a-bdc0c6bee723',
//         },
//       });
//     }
//     profile = await prisma.userProfile.create({
//       data: {
//         id: uuidv4(),
//         userId: user.id,
//         orgId: org.id,
//         role: 'USER',
//         email: user.primaryEmail,
//         firstName: user.displayName?.split(' ')[0] ?? null,
//         lastName: user.displayName?.split(' ').slice(1).join(' ') ?? null,
//         isTechnical: false,
//         layoutMode: 'beginner',
//         dashboardLayout: Prisma.DbNull,
//         status: 'ACTIVE',
//         mfaEnabled: false,
//         failedLoginAttempts: 0,
//       },
//       include: { organization: true },
//     });
//   }

//   return {
//     userId: user.id,
//     orgId: profile.orgId,
//     role: profile.role,
//     plan: profile.organization.planId,
//   };
// }

import { v4 as uuidv4 } from 'uuid';

export async function getOrgProfileInternal() {
  // Validate env vars are set
  if (!process.env.TEMP_ORG_ID || !process.env.TEMP_USER_ID) {
    throw new Error(
      'Missing TEMP_ORG_ID or TEMP_USER_ID in environment variables. ' +
      'Add them to Vercel: TEMP_ORG_ID=org_synth_123, TEMP_USER_ID=user_synth_456'
    );
  }

  console.log('[org-profile] 🚨 Using synthetic profile (Neon bypass)');

  return {
    userId: process.env.TEMP_USER_ID!,
    orgId: process.env.TEMP_ORG_ID!,
    role: 'USER' as const,
    plan: '088c6a32-7840-4188-bc1a-bdc0c6bee723', // Free plan ID
  };
}
