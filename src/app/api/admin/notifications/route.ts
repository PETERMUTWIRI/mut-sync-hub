// src/app/api/admin/notifications/route.ts
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { verifySuperAdmin } from '@/lib/auth-super';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    await verifySuperAdmin(req);
    
    // Global view: all notifications across platform with joins
    const notifications = await prisma.notification.findMany({
      include: {
        organization: { select: { name: true, subdomain: true } },
        userProfile: { select: { email: true, firstName: true, lastName: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('[admin-notifications] GET:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await verifySuperAdmin(req);
    const { id } = await req.json();
    
    await prisma.notification.updateMany({
      where: { id },
      data: { status: 'READ', readAt: new Date() },
    });
    
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[admin-notifications] PATCH:', err);
    return NextResponse.json({ error: 'Failed to mark as read' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await verifySuperAdmin(req);
    
    await prisma.notification.updateMany({
      data: { status: 'READ', readAt: new Date() },
    });
    
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[admin-notifications] PUT:', err);
    return NextResponse.json({ error: 'Failed to mark all as read' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await verifySuperAdmin(req);
    
    await prisma.notification.deleteMany({});
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[admin-notifications] DELETE:', err);
    return NextResponse.json({ error: 'Failed to delete notifications' }, { status: 500 });
  }
}