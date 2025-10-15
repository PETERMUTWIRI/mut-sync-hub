import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  await prisma.$transaction([
    prisma.session.deleteMany(),
    prisma.userProfile.updateMany({ data: { status: 'LOCKED' } }),
  ]);
  return NextResponse.json({ ok: true });
}
