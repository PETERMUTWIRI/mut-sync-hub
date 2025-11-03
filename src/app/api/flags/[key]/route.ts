export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
// src/app/api/flags/[key]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getOrgProfileInternal } from '@/lib/org-profile';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { key: string } }) {
  const { orgId } = await getOrgProfileInternal();
  const row = await prisma.feature_flags.findUnique({ where: { key_org_id: { key: params.key, org_id: orgId } } });
  if (!row) return NextResponse.json({ error: 'Flag not found' }, { status: 404 });
  return NextResponse.json(row);
}

export async function PUT(req: NextRequest, { params }: { params: { key: string } }) {
  const { orgId } = await getOrgProfileInternal();
  const body = await req.json();
  const flag = await prisma.feature_flags.upsert({
  where: { key_org_id: { key: params.key, org_id: orgId } },
    update: body,
    create: { key: params.key, orgId, ...body },
  });
  return NextResponse.json(flag);
}