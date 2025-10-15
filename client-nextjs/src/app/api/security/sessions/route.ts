import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const sessions = await prisma.session.findMany({ orderBy: { lastseen: 'desc' } });
  return NextResponse.json(sessions, { status: 200 });
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  await prisma.session.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}