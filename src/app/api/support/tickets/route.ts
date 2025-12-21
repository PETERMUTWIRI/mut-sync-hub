// src/app/api/support/tickets/route.ts
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { stackServerApp } from '@/lib/stack';
import { z } from 'zod';

// Create ticket schema
const createTicketSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(10).max(5000),
  priority: z.enum(['low', 'medium', 'high']).default('medium')
});

// Priority mapping to match Prisma enum
const PRIORITY_MAP = {
  'low': 'LOW',
  'medium': 'MEDIUM', 
  'high': 'HIGH'
} as const;

// Helper to generate readable ticket number
function generateTicketNumber() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substr(2, 6).toUpperCase();
  return `TKT_${timestamp}_${random}`;
}

export async function POST(req: NextRequest) {
  try {
    const user = await stackServerApp.getUser({ or: 'throw', tokenStore: 'nextjs-cookie' });
    
    const body = await req.json();
    const { title, description, priority } = createTicketSchema.parse(body);

    if (!user.primaryEmail) {
      return NextResponse.json({ error: 'Email not found in profile' }, { status: 400 });
    }

    const profile = await prisma.userProfile.findUnique({
      where: { userId: user.id },
      select: { orgId: true }
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // ✅ FIXED: Provide ticket_number
    const ticket = await prisma.supportTicket.create({
      data: {
        ticket_number: generateTicketNumber(), // <-- REQUIRED FIELD
        title,
        description,
        priority: PRIORITY_MAP[priority],
        status: 'OPEN',
        user_email: user.primaryEmail,
        org_id: profile.orgId,
      },
      include: {
        organization: { select: { name: true } }
      }
    });

    const { broadcastSupportTicket } = await import('@/lib/admin-broadcast');
    await broadcastSupportTicket(ticket);

    return NextResponse.json({ 
      success: true, 
      ticketId: ticket.id, 
      ticket_number: ticket.ticket_number,
      message: 'Ticket created successfully' 
    });

  } catch (error) {
    console.error('[support:tickets] POST error:', error);
    return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await stackServerApp.getUser({ or: 'throw', tokenStore: 'nextjs-cookie' });
    
    const profile = await prisma.userProfile.findUnique({
      where: { userId: user.id },
      select: { orgId: true }
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const tickets = await prisma.supportTicket.findMany({
      where: { org_id: profile.orgId },
      include: {
        SupportReply: {
          orderBy: { created_at: 'asc' },
          select: {
            id: true,
            author_email: true,
            body: true,
            created_at: true,
            read: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    return NextResponse.json(tickets);
  } catch (error) {
    console.error('[support:tickets] GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 });
  }
}