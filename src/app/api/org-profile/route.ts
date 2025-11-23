
// export const dynamic = 'force-dynamic';
// export const runtime = 'nodejs';

// import { NextRequest, NextResponse } from 'next/server';
// import { Prisma } from '@prisma/client';
// import { stackServerApp } from '@/lib/stack';
// import { v4 as uuidv4 } from 'uuid';
// import { prisma} from '@/lib/prisma';
// export async function GET(req: NextRequest) {
//   try {
//     const user = await stackServerApp.getUser({ or: 'throw', tokenStore: 'nextjs-cookie' });

//     let profile = await prisma.userProfile.findUnique({
//       where: { userId: user.id },
//       include: { organization: true },
//     });

//     if (!profile) {
//       let org = await prisma.organization.findFirst({});
//       if (!org) {
//         org = await prisma.organization.create({
//           data: {
//             id: uuidv4(),
//             name: `Org-${user.id.slice(0, 8)}`,
//             subdomain: `org-${user.id.slice(0, 8)}-${Date.now()}`,
//             planId: '088c6a32-7840-4188-bc1a-bdc0c6bee723',
//           },
//         });
//       }
//       profile = await prisma.userProfile.create({
//         data: {
//           id: uuidv4(),
//           userId: user.id,
//           orgId: org.id,
//           role: 'USER',
//           email: user.primaryEmail,
//           firstName: user.displayName?.split(' ')[0] ?? null,
//           lastName: user.displayName?.split(' ').slice(1).join(' ') ?? null,
//           isTechnical: false,
//           layoutMode: 'beginner',
//           dashboardLayout: Prisma.DbNull,
//           status: 'ACTIVE',
//           mfaEnabled: false,
//           failedLoginAttempts: 0,
//         },
//         include: { organization: true },
//       });
//     }

//     const planId = profile.organization.planId ?? '088c6a32-7840-4188-bc1a-bdc0c6bee723';
//     const plan = await prisma.plan.findUnique({ where: { id: planId } });

//     /* ------------  SUPER-SET RESPONSE  -------------------------------- */
//     return NextResponse.json({
//       /* ---  old get-user-role shape (drop-in replacement)  --- */
//       userId: user.id,
//       profileId: profile.id,
//       orgId: profile.orgId,
//       role: profile.role,
//       isTechnical: profile.isTechnical,
//       layoutMode: profile.layoutMode,
//       dashboardLayout: profile.dashboardLayout,

//       /* ---  human names & contact  --- */
//       firstName: profile.firstName,
//       lastName: profile.lastName,
//       email: profile.email,

//       /* ---  security / audit  --- */
//       status: profile.status,
//       mfaEnabled: profile.mfaEnabled,
//       failedLoginAttempts: profile.failedLoginAttempts,
//       lastLoginAt: profile.lastLoginAt,

//       /* ---  organisation  --- */
//       organization: profile.organization,
//       plan,

//       /* ---  feature flags (placeholder)  --- */
//       flags: profile.featureFlags ?? {},
//     });
//   } catch (e: any) {
//     console.error('[org-profile]', e);
//     return NextResponse.json({ error: e.message }, { status: 500 });
//   }
// }

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
// import { Prisma } from '@prisma/client';
// import { stackServerApp } from '@/lib/stack';
// import { v4 as uuidv4 } from 'uuid';
// import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    console.log('[org-profile] 🚨 Using synthetic profile (Neon bypass)');

    // 🚨 TEMPORARY: Hardcoded synthetic data
    const syntheticUserId = 'user_synth_456';
    const syntheticProfileId = 'profile_synth_1731187200001';
    const syntheticOrgId = 'org_synth_123';
    const syntheticPlanId = '088c6a32-7840-4188-bc1a-bdc0c6bee723';

    const syntheticResponse = {
      /* --- User & Profile --- */
      userId: syntheticUserId,
      profileId: syntheticProfileId,
      orgId: syntheticOrgId,
      role: 'USER' as const,
      isTechnical: false,
      layoutMode: 'beginner' as const,
      dashboardLayout: null,

      /* --- Personal Info --- */
      firstName: 'Dev',
      lastName: 'User',
      email: 'dev@mutsynchub.com',

      /* --- Security --- */
      status: 'ACTIVE' as const,
      mfaEnabled: false,
      failedLoginAttempts: 0,
      lastLoginAt: new Date().toISOString(),

      /* --- Organization --- */
      organization: {
        id: syntheticOrgId,
        name: 'Synthetic Org',
        subdomain: 'synthetic-org',
        planId: syntheticPlanId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },

      /* --- Plan --- */
      plan: {
        id: syntheticPlanId,
        name: 'Free',
        maxDatasources: 10,
        maxUsers: 5,
        features: JSON.stringify(['basic-analytics', 'csv-upload']),
        stripePriceId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },

      /* --- Feature Flags --- */
      flags: {},
    };

    return NextResponse.json(syntheticResponse);

  } catch (e: any) {
    console.error('[org-profile]', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}