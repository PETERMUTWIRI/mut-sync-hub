import { headers } from 'next/headers';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import crypto from 'crypto';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 req/min per org
  analytics: true,
});

const ALLOWED_IPS = (process.env.MPESA_IP_ALLOWLIST || '').split(',').map(ip => ip.trim());

export async function ipGuard(): Promise<void> {
  const ip = (await headers()).get('x-forwarded-for')?.split(',')[0] || 'unknown';
  if (ALLOWED_IPS.length && !ALLOWED_IPS.includes(ip)) {
    throw new Error('IP not allowed');
  }
}

export async function rateLimitGuard(orgId: string): Promise<void> {
  const { success } = await ratelimit.limit(orgId);
  if (!success) throw new Error('Rate limit exceeded');
}

export function signRequest(body: string, secret = process.env.MPESA_HMAC_SECRET!): string {
  return crypto.createHmac('sha256', secret).update(body).digest('hex');
}

export function verifySignature(body: string, sig: string): boolean {
  return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(signRequest(body)));
}

export const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://sandbox.safaricom.co.ke https://api.safaricom.co.ke;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data:;
  connect-src 'self' https://sandbox.safaricom.co.ke https://api.safaricom.co.ke;
`.replace(/\s{2,}/g, ' ').trim();
