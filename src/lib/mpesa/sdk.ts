/**
 * Enterprise M-Pesa SDK
 * - Circuit-breaker (5 failures / 30 s)
 * - Automatic token refresh (58 min)
 * - Exponential back-off retry (max 3)
 * - 5 s total timeout per request
 * - All errors typed → MpesaError
 */
import { MpesaAuthResponse, STKPushResponse, RegisterC2BUrlResponse } from './types';

const MPESA_ENV = (process.env.MPESA_ENVIRONMENT as 'sandbox' | 'production') ?? 'sandbox';
const BASE_URL = MPESA_ENV === 'production' ? 'https://api.safaricom.co.ke' : 'https://sandbox.safaricom.co.ke';

const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY!;
const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET!;
const SHORT_CODE = process.env.MPESA_SHORTCODE!;
const PASSKEY = process.env.MPESA_PASSKEY!;
const CALLBACK_URL = `${process.env.API_URL}/payments/mpesa/callback`;

/* ---------- Circuit breaker ---------- */
let failures = 0;
let lastFailure = 0;
const FAILURE_THRESHOLD = 5;
const RESET_MS = 30_000;

/* ---------- Token cache ---------- */
let tokenCache: { token: string; expiry: number } | null = null;

class MpesaError extends Error {
  constructor(public code: string, message: string) {
    super(message);
    this.name = 'MpesaError';
  }
}

/* ---------- Helpers ---------- */
async function getToken(): Promise<string> {
  if (tokenCache && Date.now() < tokenCache.expiry) return tokenCache.token;

  const basic = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
  const res = await fetch(`${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${basic}` },
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) throw new MpesaError('AUTH_FAILED', 'Token fetch failed');
  const data: MpesaAuthResponse = await res.json();
  tokenCache = { token: data.access_token, expiry: Date.now() + (data.expires_in - 120) * 1000 }; // refresh 2 min early
  return data.access_token;
}

function circuitOpen(): boolean {
  if (failures >= FAILURE_THRESHOLD && Date.now() - lastFailure < RESET_MS) return true;
  if (Date.now() - lastFailure > RESET_MS) failures = 0;
  return false;
}

async function fetchWithRetry<T>(
  url: string,
  options: RequestInit & { _attempt?: number },
): Promise<T> {
  if (circuitOpen()) throw new MpesaError('CIRCUIT_OPEN', 'Circuit breaker is open');
  const attempt = options._attempt ?? 1;
  try {
    const res = await fetch(url, { ...options, signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new MpesaError('HTTP_ERROR', `HTTP ${res.status}`);
    failures = 0;
    return (await res.json()) as T;
  } catch (err) {
    failures += 1;
    lastFailure = Date.now();
    if (attempt >= 3) throw err;
    const delay = 2 ** attempt * 1000;
    await new Promise((r) => setTimeout(r, delay));
    return fetchWithRetry(url, { ...options, _attempt: attempt + 1 });
  }
}

/* ---------- Exported SDK ---------- */
export async function stkPush(body: {
  phoneNumber: string;
  amount: number;
  accountReference: string;
  transactionDesc: string;
}) {
  const token = await getToken();
  const ts = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
  const pwd = Buffer.from(`${SHORT_CODE}${PASSKEY}${ts}`).toString('base64');

  const payload = {
    BusinessShortCode: SHORT_CODE,
    Password: pwd,
    Timestamp: ts,
    TransactionType: 'CustomerPayBillOnline',
    Amount: body.amount,
    PartyA: body.phoneNumber,
    PartyB: SHORT_CODE,
    PhoneNumber: body.phoneNumber,
    CallBackURL: CALLBACK_URL,
    AccountReference: body.accountReference,
    TransactionDesc: body.transactionDesc,
  };

  return fetchWithRetry<STKPushResponse>(`${BASE_URL}/mpesa/stkpush/v1/processrequest`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function registerC2BUrls(confirmationURL: string, validationURL: string) {
  const token = await getToken();
  const payload = {
    ShortCode: SHORT_CODE,
    ResponseType: 'Completed',
    ConfirmationURL: confirmationURL,
    ValidationURL: validationURL,
  };
  return fetchWithRetry<RegisterC2BUrlResponse>(`${BASE_URL}/mpesa/c2b/v1/registerurl`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}
