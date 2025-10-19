// src/app/api/notifications/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ensureAndFetchUserProfile } from '@/app/api/get-user-role/action';

/* ---------- existing reads ---------- */
export async function GET(req: NextRequest) {
  const user = await ensureAndFetchUserProfile();
  const notifs = await prisma.notification.findMany({
    where: { orgId: user.orgId },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
  return Response.json(notifs);
}

export async function PATCH(req: NextRequest) {
  const user = await ensureAndFetchUserProfile();
  const { id } = await req.json();
  await prisma.notification.updateMany({
    where: { id, orgId: user.orgId },
    data: { status: 'READ', readAt: new Date() },
  });
  return Response.json({ ok: true });
}

export async function PUT(req: NextRequest) {
  const user = await ensureAndFetchUserProfile();
  await prisma.notification.updateMany({
    where: { orgId: user.orgId },
    data: { status: 'READ', readAt: new Date() },
  });
  return Response.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const user = await ensureAndFetchUserProfile();
  await prisma.notification.deleteMany({ where: { orgId: user.orgId } });
  return Response.json({ ok: true });
}

/* ---------- NEW: server-only insert ---------- */
export async function POST(req: NextRequest) {
  // we trust the caller (our own server-action) – no extra auth
  const body = await req.json();
  const { orgId, title, message, type = 'INFO', isOrgWide = true, userId } = body;
  const user = await ensureAndFetchUserProfile();

  const notif = await prisma.notification.create({
    data: ({
      orgId,
      title,
      message,
      type,
      isOrgWide,
      userId,
      status: 'UNREAD',
      createdBy: user.profileId || 'system',
    } as any),
  });

  // real-time push (your existing DataGateway)
  const { DataGateway } = await import('@/lib/websocket');
  await DataGateway.broadcastToOrg(orgId, 'notification:new', notif);

  return Response.json(notif);
}