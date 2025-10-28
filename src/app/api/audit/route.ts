export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const INTERNAL_BASE = process.env.NEXT_INTERNAL_ANALYTICS_URL || 'http://localhost:3000';

async function getOrgProfileInternal(req: NextRequest) {
  const res = await fetch(`${INTERNAL_BASE}/api/org-profile`, {
    headers: { cookie: req.headers.get('cookie') ?? '' },
  });
  if (!res.ok) throw new Error(`Org fetch failed: ${res.status}`);
  return res.json(); // { userId, orgId, role, plan, ... }
}

export async function GET(req: NextRequest) {
  try {
    const { orgId } = await getOrgProfileInternal(req);

    const logs = await prisma.auditLog.findMany({
      where: { orgId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return NextResponse.json(logs);
  } catch (err: any) {
    console.error('[/api/audit] ', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}