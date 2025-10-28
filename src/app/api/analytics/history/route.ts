export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionOrg } from '@/lib/session';

export async function GET(req: NextRequest) {
  const orgId = req.nextUrl.searchParams.get('orgId');
  const limit = Number(req.nextUrl.searchParams.get('limit') ?? 50);
  if (!orgId) return NextResponse.json({ error: 'Missing orgId' }, { status: 400 });
  const history = await prisma.analyticsReport.findMany({
    where: { orgId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
  return NextResponse.json(history);
}