// client-nextjs/src/app/api/support/tickets/route.ts
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrgProfileInternal } from '@/lib/org-profile';

export async function GET(req: NextRequest) {
  try {
    const { orgId, userId } = await getOrgProfileInternal();
    const user = await prisma.userProfile.findUnique({ 
      where: { userId },
      select: { email: true }
    });

    if (!user?.email) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const tickets = await prisma.supportTicket.findMany({
      where: { user_email: user.email, org_id: orgId },
      include: {
        SupportReply: {
          orderBy: { created_at: 'asc' }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    return NextResponse.json(tickets);
  } catch (error) {
    console.error('[support-tickets] GET:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}