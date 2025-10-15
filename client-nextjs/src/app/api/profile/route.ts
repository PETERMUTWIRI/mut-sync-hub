import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/lib/stack';
import { prisma } from '@/lib/prisma';

/* GET  – return full row ------------------------------------- */
export async function GET(req: NextRequest) {
  const user = await stackServerApp.getUser({ or: 'throw', tokenStore: 'nextjs-cookie' });
  const profile = await prisma.userProfile.findUnique({
    where: { userId: user.id },
    include: { organization: true },
  });
  if (!profile) throw new Error('Profile not found');
  return NextResponse.json(profile);
}

/* PATCH – update names & email ------------------------------- */
export async function PATCH(req: NextRequest) {
  const user = await stackServerApp.getUser({ or: 'throw', tokenStore: 'nextjs-cookie' });
  const { firstName, lastName, email } = await req.json();
  await prisma.userProfile.update({
    where: { userId: user.id },
    data: { firstName, lastName, email },
  });
  return NextResponse.json({ ok: true });
}