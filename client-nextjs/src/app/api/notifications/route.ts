// src/app/api/notifications/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const INTERNAL_BASE = process.env.NEXT_INTERNAL_ANALYTICS_URL || 'http://localhost:3000';

async function getOrgProfileInternal(req: NextRequest) {
  const res = await fetch(`${INTERNAL_BASE}/api/org-profile`, {
    headers: { cookie: req.headers.get('cookie') ?? '' },
  });
  if (!res.ok) throw new Error(`Org fetch failed: ${res.status}`);
  return res.json(); // { userId, orgId, role, plan, ... }
}

/* ---------- existing reads ---------- */
export async function GET(req: NextRequest) {
  try {
    const { orgId } = await getOrgProfileInternal(req);
    const notifs = await prisma.notification.findMany({
      where: { orgId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return NextResponse.json(notifs);
  } catch (err: any) {
    console.error('[/api/notifications] GET:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { orgId } = await getOrgProfileInternal(req);
    const { id } = await req.json();
    await prisma.notification.updateMany({
      where: { id, orgId },
      data: { status: 'READ', readAt: new Date() },
    });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('[/api/notifications] PATCH:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { orgId } = await getOrgProfileInternal(req);
    await prisma.notification.updateMany({
      where: { orgId },
      data: { status: 'READ', readAt: new Date() },
    });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('[/api/notifications] PUT:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { orgId } = await getOrgProfileInternal(req);
    await prisma.notification.deleteMany({ where: { orgId } });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('[/api/notifications] DELETE:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/* ---------- server-only insert ---------- */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orgId, title, message, type = 'INFO', isOrgWide = true, userId } = body;
    // we still need a createdBy – use the caller’s profileId
    const { userId: profileId } = await getOrgProfileInternal(req);

    const notif = await prisma.notification.create({
      data: {
        orgId,
        title,
        message,
        type,
        isOrgWide,
        userId,
        status: 'UNREAD',
        createdBy: profileId,
      },
    });

    // real-time push
    const { DataGateway } = await import('@/lib/websocket');
    await DataGateway.broadcastToOrg(orgId, 'notification:new', notif);

    return NextResponse.json(notif);
  } catch (err: any) {
    console.error('[/api/notifications] POST:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}