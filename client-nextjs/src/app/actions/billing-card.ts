'use server';
import { prisma } from '@/lib/prisma';
import { getPaymentUsage } from '@/app/actions/mpesa';

export async function getBillingCardData() {
  /* orgId comes from RLS session (JWT cookie) → no param needed */
  const usage = await getPaymentUsage();          // uses orgId from RLS
  const invoices = await prisma.payment.findMany({
    where: { status: { in: ['COMPLETED', 'FAILED'] } },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: {
      id: true,
      amount: true,
      status: true,
      createdAt: true,
      mpesaReceiptNumber: true,
    },
  });

  const last = invoices[0];
  return {
    lastInvoice: last ? `KSH ${Number(last.amount).toLocaleString()} • ${last.mpesaReceiptNumber || '—'}` : 'No payments yet',
    nextPayment: usage.limit === 0 ? 'Unlimited' : `${usage.limit - usage.count} remaining this month`,
    paymentMethod: 'M-Pesa',
    usage,
    alert: usage.limit > 0 && usage.count >= usage.limit
      ? { message: 'Payment limit reached – upgrade to continue.', urgency: 'high' as const, actionUrl: '/billing' }
      : undefined,
  };
}
