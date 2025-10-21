export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { stackServerApp } from '@/lib/stack';
import { getAnalyticsUsage } from '@/lib/analytics-usage'; // your existing helper

export async function GET(req: NextRequest) {
  try {
    /*  1.  get user via Stack (no old action)  */
    const user = await stackServerApp.getUser({ or: 'throw', tokenStore: 'nextjs-cookie' });
    const profile = await prisma.userProfile.findUnique({
      where: { userId: user.id },
      include: {
        organization: {
          include: {
            plan: true,
            payments: { orderBy: { createdAt: 'desc' }, take: 5 }, // real invoices
          },
        },
      },
    });
    if (!profile) throw new Error('Profile not found');

    const org = profile.organization;

    /*  2.  re-use your existing helpers  */
    const analyticsUsage = await getAnalyticsUsage(org.id); // { used, limit, remaining, locked }

    /*  3.  shape exactly what BillingCard expects  */
    const last = org.payments[0];
  // planExpiresAt and cardLast4 are not present on the Prisma Organization model by default
  const nextDate = (org as any).planExpiresAt ? new Date((org as any).planExpiresAt).toLocaleDateString() : 'Unlimited';
  const cardLast4 = (org as any).cardLast4 || '—';

    const usage = {
      limit: (org.plan?.features as any[])?.find((f: any) => f.name === 'Payment-Limit')?.limit ?? 0,
      count: org.payments.length,
    };

    const alert = usage.limit > 0 && usage.count >= usage.limit
      ? { message: 'Payment limit reached – upgrade to continue.', urgency: 'high' as const, actionUrl: '/billing' }
      : undefined;

    return NextResponse.json({
      lastInvoice: last
        ? `KSH ${Number(Number(last.amount as any) / 100).toLocaleString()} • ${last.mpesaReceiptNumber || '—'}`
        : 'No payments yet',
      nextPayment: nextDate,
      paymentMethod: cardLast4 ? `•••• ${cardLast4}` : 'M-Pesa',
      usage,
      alert,
      payments: org.payments, // full list for billing page later
      plan: org.plan, // full plan object for billing page later
    });
  } catch (e: any) {
    console.error('[api/billing]', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}