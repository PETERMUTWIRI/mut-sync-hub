// src/app/api/admin/audit-logs/route.ts
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySuperAdmin } from '@/lib/auth-super';

export async function GET(req: Request) {
  try {
    await verifySuperAdmin(req);

    const logs = await prisma.auditLog.findMany({
      include: { userProfile: true, organization: true },
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    return NextResponse.json(logs);
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}