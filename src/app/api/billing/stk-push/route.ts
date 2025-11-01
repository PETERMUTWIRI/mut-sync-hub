// export const dynamic = 'force-dynamic';
// export const runtime = 'nodejs';

// import { NextRequest, NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
// import { PLANS, getPlanUuid } from '@/app/actions/plans';
// import { encrypt } from '@/lib/mpesa/crypto';
// import { ipGuard, rateLimitGuard } from '@/lib/mpesa/security';
// import moment from 'moment';

// type STKRequest = {
//   amount: number;
//   phoneNumber: string | null;
//   accountReference: string;
//   transactionDesc: string;
// };

// function planByAmount(amount: number) {
//   return PLANS.find((p) => p.price === amount) ?? null;
// }

// async function enforceLimit(orgId: string) {
//   const org = await prisma.organization.findUnique({
//     where: { id: orgId },
//     include: { plan: true },
//   });
//   const planId = org?.planId || getPlanUuid('free');
//   const plan = PLANS.find((p) => getPlanUuid(p.id) === planId)!;
//   const feat = plan.features.find((f) => f.name === 'Payments');
//   if (!feat?.limit) return;
//   const start = moment().startOf('month').toDate();
//   const used = await prisma.payment.count({
//     where: { orgId, createdAt: { gte: start }, status: 'COMPLETED' },
//   });
//   if (used >= feat.limit)
//     throw new Error('Payment limit reached for your plan. Please upgrade.');
// }

// /* ----------  LAZY SDK – env vars touched only at runtime  ---------- */
// async function stkPushWrapper(args: any) {
//   if (!process.env.MPESA_PASSKEY) throw new Error('MPESA_PASSKEY not set');
//   // @ts-ignore – dynamic import avoids top-level crash
//   const { stkPush } = await import('@/lib/mpesa/sdk');
//   return stkPush(args);
// }

// export async function POST(req: NextRequest) {
//   try {
//     const { userId, amount, phoneNumber, accountReference, transactionDesc }: STKRequest & { userId: string } =
//       await req.json();

//     await ipGuard();
//     const user = await prisma.userProfile.findUnique({ where: { id: userId } });
//     if (!user?.orgId) return NextResponse.json({ error: 'Org not found' }, { status: 404 });
//     await rateLimitGuard(user.orgId);
//     await enforceLimit(user.orgId);

//     const plan = planByAmount(amount);
//     if (!plan) return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
//     if (!phoneNumber) return NextResponse.json({ error: 'Phone number required' }, { status: 400 });

//     const phone = phoneNumber.replace('+', '');
//     if (!/^254\d{9}$/.test(phone))
//       return NextResponse.json({ error: 'Bad phone format' }, { status: 400 });

//     const res = await stkPushWrapper({
//       amount,
//       phoneNumber: phone,
//       accountReference,
//       transactionDesc,
//     });

//     // idempotency guard
//     const exists = await prisma.payment.findFirst({
//       where: { userProfileId: userId, status: { notIn: ['FAILED', 'CANCELLED'] } },
//     });
//     if (exists)
//       return NextResponse.json({ error: 'Active payment already exists' }, { status: 409 });

//     await prisma.payment.create({
//       data: {
//         userProfileId: userId,
//         orgId: user.orgId,
//         amount,
//         provider: 'MPESA',
//         status: 'PENDING',
//         phoneNumber: encrypt(phone),
//         checkoutRequestId: res.CheckoutRequestID,
//         merchantRequestId: res.MerchantRequestID,
//         metadata: {
//           accountReference,
//           transactionDesc,
//           planId: plan.id,
//         },
//       },
//     });

//     return NextResponse.json(res);
//   } catch (err: any) {
//     return NextResponse.json({ error: err.message }, { status: 400 });
//   }
// }