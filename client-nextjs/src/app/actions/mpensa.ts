'use server';

import { PrismaClient } from '@prisma/client';
import moment from 'moment';
import { PLANS as CORE_PLANS, getPlanUuid } from '@/app/actions/plans';
import crypto from 'crypto';

const prisma = new PrismaClient();

/* ---------- ENV ---------- */
const MPESA_ENVIRONMENT = process.env.MPESA_ENVIRONMENT || 'sandbox';
const MPESA_CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY!;
const MPESA_CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET!;
const MPESA_PASSKEY = process.env.MPESA_PASSKEY!;
const MPESA_SHORTCODE = process.env.MPESA_SHORTCODE!;
const API_URL = process.env.API_URL!;
const MPESA_VALIDATION_URL = process.env.MPESA_VALIDATION_URL!;
const MPESA_CONFIRMATION_URL = process.env.MPESA_CONFIRMATION_URL!;

const baseUrl =
  MPESA_ENVIRONMENT === 'production'
    ? 'https://api.safaricom.co.ke'
    : 'https://sandbox.safaricom.co.ke';

/* ---------- TYPES ---------- */
interface STKPushRequest {
  amount: number;
  phoneNumber: string;
  accountReference: string;
  transactionDesc: string;
}

interface STKPushResponse {
  CheckoutRequestID: string;
  MerchantRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
}

interface MpesaAuthResponse { access_token: string; expires_in: number; }

interface MpesaCallbackPayload {
  Body: {
    stkCallback: {
      CheckoutRequestID: string;
      MerchantRequestID: string;
      ResultCode: number;
      ResultDesc: string;
      CallbackMetadata?: { Item: { Name: string; Value?: string | number }[] };
    };
  };
}

interface PaymentUsage { progress: number; limit: number; count: number; }

/* ---------- PLANS ---------- */
const PLANS = CORE_PLANS.map(p => ({
  ...p,
  features: p.features.some(f => f.name === 'Payments')
    ? p.features
    : [...p.features, { name: 'Payments', description: 'Monthly successful payments', limit: p.price === 0 ? 5 : p.price === 3000 ? 50 : p.price === 10000 ? 500 : 0 }],
}));

/* ---------- HELPERS ---------- */
let accessToken = '';
let tokenExpiry = new Date(0);

async function generateToken(): Promise<string> {
  if (accessToken && moment().isBefore(tokenExpiry)) return accessToken;
  const auth = Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString('base64');
  const r = await fetch(`${baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${auth}` },
  });
  if (!r.ok) throw new Error('M-Pesa auth failed');
  const d: MpesaAuthResponse = await r.json();
  accessToken = d.access_token;
  tokenExpiry = moment().add(58, 'minutes').toDate();
  return accessToken;
}

function genPassword(ts: string) {
  return Buffer.from(`${MPESA_SHORTCODE}${MPESA_PASSKEY}${ts}`).toString('base64');
}

function planByAmount(amount: number) { return PLANS.find(p => p.price === amount) ?? null; }

async function enforceLimits(orgId: string) {
  const org = await prisma.organization.findUnique({ where: { id: orgId }, include: { plan: true } });
  const planId = org?.planId || getPlanUuid('free');
  const plan = PLANS.find(p => getPlanUuid(p.id) === planId)!;
  const feat = plan.features.find(f => f.name === 'Payments');
  if (!feat?.limit) return;
  const start = moment().startOf('month').toDate();
  const used = await prisma.payment.count({
    where: { orgId, createdAt: { gte: start }, status: 'COMPLETED' },
  });
  if (used >= feat.limit) throw new Error('Payment limit reached for your plan. Please upgrade.');
}

/* ---------- EXPORTS ---------- */
export async function getPaymentUsage(orgId: string): Promise<PaymentUsage> {
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

export async function initiateSTKPush(userId: string, req: STKPushRequest) {
  const user = await prisma.userProfile.findUnique({ where: { id: userId } });
  const orgId = user?.orgId;
  if (!orgId) throw new Error('Organization not found');
  await enforceLimits(orgId);
  const usage = await getPaymentUsage(orgId);

  const plan = planByAmount(req.amount);
  if (!plan) throw new Error('Invalid amount');

  const phone = req.phoneNumber.replace('+', '');
  if (!/^254\d{9}$/.test(phone)) throw new Error('Bad phone format');

  const token = await generateToken();
  const ts = moment().format('YYYYMMDDHHmmss');
  const pwd = genPassword(ts);

  const body = {
    BusinessShortCode: MPESA_SHORTCODE,
    Password: pwd,
    Timestamp: ts,
    TransactionType: 'CustomerPayBillOnline',
    Amount: req.amount,
    PartyA: phone,
    PartyB: MPESA_SHORTCODE,
    PhoneNumber: phone,
    CallBackURL: `${API_URL}/payments/mpesa/callback`,
    AccountReference: req.accountReference,
    TransactionDesc: req.transactionDesc,
  };

  const r = await fetch(`${baseUrl}/mpesa/stkpush/v1/processrequest`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error('STK push failed');
  const data: STKPushResponse = await r.json();

  const exists = await prisma.payment.findFirst({
    where: { userProfileId: userId, status: { notIn: ['FAILED', 'CANCELLED'] } },
  });
  if (exists) throw new Error('Active payment already exists for this user');

  await prisma.payment.create({
    data: {
      userProfileId: userId,
      orgId,
      amount: req.amount,
      provider: 'MPESA',
      status: 'PENDING',
      phoneNumber: phone,
      checkoutRequestId: data.CheckoutRequestID,
      merchantRequestId: data.MerchantRequestID,
      metadata: { accountReference: req.accountReference, transactionDesc: req.transactionDesc, planId: plan.id },
    },
  });

  console.log('PAYMENT_INITIATED', { userId, orgId, amount: req.amount, planId: plan.id, phone, checkoutRequestId: data.CheckoutRequestID });
  return { ...data, usage };
}

export async function handleCallback(payload: MpesaCallbackPayload) {
  const cb = payload.Body.stkCallback;
  await prisma.mpesaCallback.create({
    data: {
      checkoutRequestId: cb.CheckoutRequestID,
      merchantRequestId: cb.MerchantRequestID,
      resultCode: cb.ResultCode.toString(),
      resultDesc: cb.ResultDesc,
      amount: Number(cb.CallbackMetadata?.Item.find(i => i.Name === 'Amount')?.Value || 0),
      mpesaReceiptNumber: String(cb.CallbackMetadata?.Item.find(i => i.Name === 'MpesaReceiptNumber')?.Value || ''),
      phoneNumber: String(cb.CallbackMetadata?.Item.find(i => i.Name === 'PhoneNumber')?.Value || ''),
      transactionDate: new Date(),
    },
  });

  console.log('PAYMENT_CALLBACK', { checkoutRequestId: cb.CheckoutRequestID, resultCode: cb.ResultCode });

  if (cb.ResultCode === 0) {
    const payment = await prisma.payment.findFirst({ where: { checkoutRequestId: cb.CheckoutRequestID, status: 'PENDING' } });
    const plan = payment ? planByAmount(Number(payment.amount)) : null;

    await prisma.payment.updateMany({
      where: { checkoutRequestId: cb.CheckoutRequestID, status: 'PENDING' },
      data: {
        status: 'COMPLETED',
        mpesaReceiptNumber: String(cb.CallbackMetadata?.Item.find(i => i.Name === 'MpesaReceiptNumber')?.Value || ''),
        updatedAt: new Date(),
      },
    });

    console.log('PAYMENT_COMPLETED', { userId: payment?.userProfileId, orgId: payment?.orgId, checkoutRequestId: cb.CheckoutRequestID });

    if (payment && plan) {
      await prisma.organization.update({ where: { id: payment.orgId }, data: { planId: plan.id } });
    }
  } else {
    await prisma.payment.updateMany({
      where: { checkoutRequestId: cb.CheckoutRequestID, status: 'PENDING' },
      data: { status: 'FAILED', errorMessage: cb.ResultDesc, updatedAt: new Date() },
    });
    console.log('PAYMENT_FAILED', { checkoutRequestId: cb.CheckoutRequestID, resultDesc: cb.ResultDesc });
  }
}

export async function retryFailedPayment(paymentId: string): Promise<void> {
  const p = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!p || p.status !== 'FAILED' || p.retryCount >= 3) throw new Error('Payment cannot be retried');

  const res = await initiateSTKPush(p.userProfileId, {
    amount: Number(p.amount),
    phoneNumber: p.phoneNumber,
    accountReference: (p.metadata as any).accountReference,
    transactionDesc: (p.metadata as any).transactionDesc,
  });

  await prisma.payment.update({
    where: { id: paymentId },
    data: {
      status: 'PENDING',
      checkoutRequestId: res.CheckoutRequestID,
      merchantRequestId: res.MerchantRequestID,
      retryCount: { increment: 1 },
      errorMessage: null,
      updatedAt: new Date(),
    },
  });

  console.log('PAYMENT_RETRY', { userId: p.userProfileId, orgId: p.orgId, paymentId, amount: p.amount, phoneNumber: p.phoneNumber, retryCount: p.retryCount + 1 });
}

export async function registerC2BUrl(): Promise<void> {
  const token = await generateToken();
  const body = {
    ShortCode: MPESA_SHORTCODE,
    ResponseType: 'Completed',
    ConfirmationURL: MPESA_CONFIRMATION_URL,
    ValidationURL: MPESA_VALIDATION_URL,
  };
  const r = await fetch(`${baseUrl}/mpesa/c2b/v1/registerurl`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error('C2B URL register failed');
  const data = await r.json();
  if (data.ResponseCode !== '0') throw new Error(data.ResponseDescription);
  console.log('C2B URLs registered');
}

export async function validateC2BPayment(payload: MpesaValidationRequest): Promise<void> {
  const amount = Number(payload.TransAmount);
  if (amount < 1) throw new Error('Invalid amount');
  await prisma.payment.create({
    data: {
      amount,
      provider: 'MPESA',
      status: 'PENDING',
      phoneNumber: payload.MSISDN,
      metadata: { BillRefNumber: payload.BillRefNumber, TransactionType: payload.TransactionType, InvoiceNumber: payload.InvoiceNumber },
    },
  });
}

export async function confirmC2BPayment(payload: { TransID: string; TransAmount: string; MSISDN: string; BillRefNumber: string }): Promise<void> {
  await prisma.payment.updateMany({
    where: { phoneNumber: payload.MSISDN, status: 'PENDING' },
    data: { status: 'COMPLETED', mpesaReceiptNumber: payload.TransID, updatedAt: new Date() },
  });
  console.log('C2B_PAYMENT_CONFIRMED', payload);
}
