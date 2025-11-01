export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams;
  const userId = search.get('userId');
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

  const invoices = await prisma.payment.findMany({
    where: { userProfileId: userId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      createdAt: true,
      amount: true,
      status: true,
      mpesaReceiptNumber: true,
      checkoutRequestId: true,
    },
  });

  return NextResponse.json(
    invoices.map((i) => ({
      id: i.id,
      date: i.createdAt.toISOString(),
      amount: i.amount,
      status: i.status,
      receipt: i.mpesaReceiptNumber || '',
      checkoutRequestId: i.checkoutRequestId,
    }))
  );
}