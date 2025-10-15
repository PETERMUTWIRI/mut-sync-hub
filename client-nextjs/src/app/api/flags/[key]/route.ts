// src/app/api/flags/[key]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getOrgProfileInternal } from '@/lib/org-profile';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { key: string } }) {
  const { orgId } = await getOrgProfileInternal(req);
  const row = await prisma.feature_flags.findUnique({ where: { key_orgId: { key: params.key, orgId } } });
  if (!row) return NextResponse.json({ error: 'Flag not found' }, { status: 404 });
  return NextResponse.json(row);
}

export async function PUT(req: NextRequest, { params }: { params: { key: string } }) {
  const { orgId } = await getOrgProfileInternal(req);
  const body = await req.json();
  const flag = await prisma.feature_flags.upsert({
    where: { key_orgId: { key: params.key, orgId } },
    update: body,
    create: { key: params.key, orgId, ...body },
  });
  return NextResponse.json(flag);
}