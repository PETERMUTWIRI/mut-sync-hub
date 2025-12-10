// src/app/api/admin/support/tickets/route.ts
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySuperAdmin } from '@/lib/auth-super';
import { broadcastSupportReply } from '@/lib/admin-broadcast';
import { z } from 'zod';

// Validation schema
const replySchema = z.object({
  ticketId: z.string().uuid(),
  message: z.string().min(1).max(5000)
});

export async function GET(req: NextRequest) {
  try {
    await verifySuperAdmin(req);

    const tickets = await prisma.supportTicket.findMany({
      include: {
        SupportReply: {
          orderBy: { created_at: 'asc' }
        },
        organization: {
          select: { 
            id: true, 
            name: true, 
            subdomain: true,
            planId: true 
          }
        }
      },
      orderBy: { created_at: 'desc' },
      take: 100
    });

    return NextResponse.json(tickets);
  } catch (error) {
    console.error('[admin-support] GET:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await verifySuperAdmin(req);
    
    const body = await req.json();
    const { ticketId, message } = replySchema.parse(body);

    // Get ticket
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: { organization: true }
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Create reply in transaction
    const reply = await prisma.$transaction(async (tx) => {
      const newReply = await tx.supportReply.create({
        data: {
          ticket_id: ticketId,
          author_email: process.env.OWNER_EMAIL || 'owner@system',
          body: message,
          read: false // ← This will work after schema update
        }
      });

      await tx.supportTicket.update({
        where: { id: ticketId },
        data: { 
          status: 'pending',
          updated_at: new Date() 
        }
      });

      // Create notification for user
      await tx.notification.create({
        data: {
          orgId: ticket.org_id!,
          title: 'Owner Replied to Your Ticket',
          message: `${message.substring(0, 100)}${message.length > 100 ? '...' : ''}`,
          type: 'SUPPORT',
          isOrgWide: false,
          userId: ticket.user_email,
          status: 'UNREAD',
          createdBy: 'owner',
          metadata: { ticketId, replyId: newReply.id }
        }
      });

      return newReply;
    });

    // Broadcast to user
    await broadcastSupportReply(reply, ticket);
    
    return NextResponse.json({ success: true, reply });
  } catch (error) {
    console.error('[admin-support] POST:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid input', 
        details: error.issues // ← FIXED
      }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to send reply' }, { status: 500 });
  }
}