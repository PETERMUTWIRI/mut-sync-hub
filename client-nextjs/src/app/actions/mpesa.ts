'use server';

import { prisma } from '@/lib/prisma';
import { stkPush, registerC2BUrls } from '@/lib/mpesa/sdk';
import { encrypt } from '@/lib/mpesa/crypto';
import { ipGuard, rateLimitGuard, verifySignature, cspHeader } from '@/lib/mpesa/security';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { PLANS, getPlanUuid } from '@/app/actions/plans';
import moment from 'moment';

/* ---------- Types ---------- */
type STKRequest = { amount: number; phoneNumber: string | null; accountReference: string; transactionDesc: string; };
interface STKResponse { CheckoutRequestID: string; MerchantRequestID: string; ResponseCode: string; ResponseDescription: string; CustomerMessage: string; }
interface Usage { progress: number; limit: number; count: number; }

/* ---------- Helpers ---------- */
function planByAmount(amount: number) { return PLANS.find(p => p.price === amount) ?? null; }

async function enforceLimit(orgId: string) {
  const org = await prisma.organization.findUnique({ where: { id: orgId }, include: { plan: true } });
  const planId = org?.planId || getPlanUuid('free');
  const plan = PLANS.find(p => getPlanUuid(p.id) === planId)!;
  const feat = plan.features.find(f => f.name === 'Payments');
  if (!feat?.limit) return;
  const start = moment().startOf('month').toDate();
  const used = await prisma.payment.count({ where: { orgId, createdAt: { gte: start }, status: 'COMPLETED' } });
  if (used >= feat.limit) throw new Error('Payment limit reached for your plan. Please upgrade.');
}

/* ---------- Server Actions ---------- */
export async function initiateSTKPush(userId: string, req: STKRequest): Promise<STKResponse & { usage?: Usage }> {
  await ipGuard();
  const user = await prisma.userProfile.findUnique({ where: { id: userId } });
  if (!user?.orgId) throw new Error('Org not found');
  await rateLimitGuard(user.orgId);
  await enforceLimit(user.orgId);
  const usage: Usage = await getPaymentUsage(user.orgId);

  const plan = planByAmount(req.amount);
  if (!plan) throw new Error('Invalid amount');
  if (!req.phoneNumber) throw new Error("Phone number required");
  const phone = req.phoneNumber.replace('+', '');
  if (!/^254\d{9}$/.test(phone)) throw new Error('Bad phone format');

  const res = await stkPush({ ...req, phoneNumber: phone });

  // Idempotency guard
  const exists = await prisma.payment.findFirst({ where: { userProfileId: userId, status: { notIn: ['FAILED', 'CANCELLED'] } } });
  if (exists) throw new Error('Active payment already exists');

  await prisma.payment.create({
    data: {
      userProfileId: userId,
      orgId: user.orgId,
      amount: req.amount,
      provider: 'MPESA',
      status: 'PENDING',
      phoneNumber: encrypt(phone),
      checkoutRequestId: res.CheckoutRequestID,
      merchantRequestId: res.MerchantRequestID,
      metadata: { accountReference: req.accountReference, transactionDesc: req.transactionDesc, planId: plan.id },
    },
  });
  console.log('PAYMENT_INITIATED', { userId, orgId: user.orgId, amount: req.amount, planId: plan.id, checkoutRequestId: res.CheckoutRequestID });
  return { ...res, usage };
}

export async function handleCallback(form: FormData) {
  await ipGuard();
  const raw = form.get('payload') as string;
  const sig = (await headers()).get('x-mpesa-signature') || '';
  if (!verifySignature(raw, sig)) throw new Error('Bad signature');

  const payload = JSON.parse(raw);
  const cb = payload.Body.stkCallback;

  await prisma.mpesaCallback.create({
    data: {
      checkoutRequestId: cb.CheckoutRequestID,
      merchantRequestId: cb.MerchantRequestID,
      resultCode: cb.ResultCode.toString(),
      resultDesc: cb.ResultDesc,
      amount: Number(cb.CallbackMetadata?.Item.find((i: any) => i.Name === 'Amount')?.Value || 0),
      mpesaReceiptNumber: String(cb.CallbackMetadata?.Item.find((i: any) => i.Name === 'MpesaReceiptNumber')?.Value || ''),
      phoneNumber: String(cb.CallbackMetadata?.Item.find((i: any) => i.Name === 'PhoneNumber')?.Value || ''),
      transactionDate: new Date(),
    },
  });

  if (cb.ResultCode === 0) {
    const payment = await prisma.payment.findFirst({ where: { checkoutRequestId: cb.CheckoutRequestID, status: 'PENDING' } });
    const plan = payment ? planByAmount(Number(payment.amount)) : null;
    await prisma.payment.updateMany({
      where: { checkoutRequestId: cb.CheckoutRequestID, status: 'PENDING' },
      data: { status: 'COMPLETED', mpesaReceiptNumber: String(cb.CallbackMetadata?.Item.find((i: any) => i.Name === 'MpesaReceiptNumber')?.Value || ''), updatedAt: new Date() },
    });
    if (payment && plan) {
      await prisma.organization.update({ where: { id: payment.orgId }, data: { planId: plan.id } });
    }
  } else {
    await prisma.payment.updateMany({
      where: { checkoutRequestId: cb.CheckoutRequestID, status: 'PENDING' },
      data: { status: 'FAILED', errorMessage: cb.ResultDesc, updatedAt: new Date() },
    });
  }
  revalidatePath('/billing');
}

export async function getPaymentUsage(orgId: string): Promise<Usage> {
  const org = await prisma.organization.findUnique({ where: { id: orgId }, include: { plan: true } });
  const planId = org?.planId || getPlanUuid('free');
  const plan = PLANS.find(p => getPlanUuid(p.id) === planId)!;
  const feat = plan.features.find(f => f.name === 'Payments');
  const limit = feat?.limit ?? 0;
  if (!limit) return { progress: 0, limit: 0, count: 0 };
  const start = moment().startOf('month').toDate();
  const count = await prisma.payment.count({ where: { orgId, createdAt: { gte: start }, status: 'COMPLETED' } });
  return { progress: Math.min(count / limit, 1), limit, count };
}

export async function retryFailedPayment(paymentId: string): Promise<void> {
  const p = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!p || p.status !== 'FAILED' || p.retryCount >= 3) throw new Error('Cannot retry');
  const res = await initiateSTKPush(p.userProfileId, {
    amount: Number(p.amount),
    phoneNumber: p.phoneNumber,
    accountReference: (p.metadata as any).accountReference,
    transactionDesc: (p.metadata as any).transactionDesc,
  });
  await prisma.payment.update({
    where: { id: paymentId },
    data: { status: 'PENDING', checkoutRequestId: res.CheckoutRequestID, merchantRequestId: res.MerchantRequestID, retryCount: { increment: 1 }, errorMessage: null, updatedAt: new Date() },
  });
}

export async function registerC2BUrl(): Promise<void> {
  const confirmationURL = `${process.env.API_URL}/payments/mpesa/c2b/confirm`;
  const validationURL = `${process.env.API_URL}/payments/mpesa/c2b/validate`;
  await registerC2BUrls(confirmationURL, validationURL);
}




/* ---------- safe C2B confirmation ---------- */
export async function confirmC2BPayment(payload: { TransID: string; TransAmount: string; MSISDN: string; BillRefNumber: string }) {
  await prisma.payment.updateMany({
    where: { phoneNumber: payload.MSISDN, status: 'PENDING' }, // <-- only fields that exist in model
    data: { status: 'COMPLETED', mpesaReceiptNumber: payload.TransID, updatedAt: new Date() },
  });
  console.log('C2B_PAYMENT_CONFIRMED', payload);
}
// Swap sandbox → production credentials
// Add Stripe / Apple Pay alongside M-Pesa
// GDPR export / delete commands
// Grafana alerts for circuit-breaker
