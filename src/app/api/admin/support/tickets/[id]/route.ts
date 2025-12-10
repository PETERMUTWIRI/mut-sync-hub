// src/app/api/admin/support/tickets/[id]/route.ts
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySuperAdmin } from '@/lib/auth-super';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await verifySuperAdmin(req);
    const { status } = await req.json();

    const ticket = await prisma.supportTicket.update({
      where: { id: params.id },
      data: { status }
    });

    return NextResponse.json(ticket);
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await verifySuperAdmin(req);

    await prisma.supportTicket.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}