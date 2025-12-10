// src/app/api/notifications/route.ts
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrgProfileInternal } from '@/lib/org-profile';
import { broadcastToOrg, broadcastToOwner } from '@/lib/admin-broadcast';

export async function GET(req: NextRequest) {
  try {
    const { orgId } = await getOrgProfileInternal();
    const notifs = await prisma.notification.findMany({
      where: { orgId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return NextResponse.json(notifs);
  } catch (err) {
    console.error('[notifications] GET:', err);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { orgId } = await getOrgProfileInternal();
    const { id } = await req.json();
    
    await prisma.notification.updateMany({
      where: { id, orgId },
      data: { status: 'READ', readAt: new Date() },
    });
    
    await broadcastToOrg(orgId, 'notification:read', { id });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[notifications] PATCH:', err);
    return NextResponse.json({ error: 'Failed to mark as read' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { orgId } = await getOrgProfileInternal();
    await prisma.notification.updateMany({
      where: { orgId },
      data: { status: 'READ', readAt: new Date() },
    });
    
    await broadcastToOrg(orgId, 'notification:readAll', {});
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[notifications] PUT:', err);
    return NextResponse.json({ error: 'Failed to mark all as read' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { orgId } = await getOrgProfileInternal();
    await prisma.notification.deleteMany({ where: { orgId } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[notifications] DELETE:', err);
    return NextResponse.json({ error: 'Failed to delete notifications' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orgId, title, message, type = 'INFO', isOrgWide = true, userId } = body;
    
    // Get full profile for audit trail
    const { profileId, orgId: creatorOrgId } = await getOrgProfileInternal();

    // Security: prevent cross-org notification creation
    if (orgId !== creatorOrgId) {
      return NextResponse.json({ 
        error: 'Cross-org notifications forbidden',
        details: `Cannot create notification for org ${orgId} when authenticated in ${creatorOrgId}`
      }, { status: 403 });
    }

    const notif = await prisma.notification.create({
      data: {
        orgId,
        title,
        message,
        type,
        isOrgWide,
        userId,
        status: 'UNREAD',
        createdBy: profileId, // Correct audit trail
      },
    });

    // Broadcast to users (org stream) and owner (global stream)
    await broadcastToOrg(orgId, 'notification:new', notif);
    await broadcastToOwner('notification:new', {
      ...notif,
      orgId,
      broadcastType: 'user_notification'
    });

    return NextResponse.json(notif);
  } catch (err) {
    console.error('[notifications] POST:', err);
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
  }
}