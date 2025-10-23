export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const userEmail = req.nextUrl.searchParams.get('userEmail');
  if (!userEmail) return NextResponse.json({ error: 'Missing userEmail' }, { status: 400 });

  const tickets = await prisma.supportTicket.findMany({
    where: { user_email: userEmail },
    orderBy: { created_at: 'desc' },
    include: { SupportReply: { orderBy: { created_at: 'asc' } } }, // ← exact relation name
  });
  return NextResponse.json(tickets);
}