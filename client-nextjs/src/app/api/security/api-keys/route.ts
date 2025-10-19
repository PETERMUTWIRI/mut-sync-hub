// src/app/api/security/api-keys/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';

export async function GET() {
  const keys = await prisma.apiKey.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(keys);
}

export async function POST(req: Request) {
  const { name, scopes, orgId } = await req.json(); // orgId required
  const fullKey = 'sk_' + randomUUID().replace(/-/g, '');
  const key = await prisma.apiKey.create({
    data: { key: fullKey, name, key_preview: fullKey.slice(-8), scopes, orgId },
  });
  return NextResponse.json({ ...key, key: fullKey }); // return full key once
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  await prisma.apiKey.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}