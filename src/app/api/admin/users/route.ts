// src/app/api/admin/users/route.ts
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySuperAdmin } from '@/lib/auth-super';
import { broadcastToOwner } from '@/lib/admin-broadcast';
import { v4 as uuidv4 } from 'uuid';
import { redis } from '@/lib/redis';

export async function GET(req: Request) {
  try {
    await verifySuperAdmin(req);

    // Get ALL users with their organizations
    const users = await prisma.userProfile.findMany({
      include: {
        organization: {
          include: { plan: true },
        },
        _count: {
          select: { auditLogs: true, apiUsages: true }
        }
      },
      orderBy: { lastLoginAt: 'desc' },
      take: 100
    });

    const enhancedUsers = await Promise.all(users.map(async (u) => {
      const sessionKey = `session:${u.orgId}:${u.id}`;
      const session = await redis.hgetall(sessionKey);
      
      return {
        ...u,
        isOnline: !!session?.lastSeen && (Date.now() - parseInt(String(session.lastSeen))) < 300000,
        currentDevice: session?.device || null
      };
    }));

    return NextResponse.json(enhancedUsers);
  } catch (error) {
    console.error('[owner-users]', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    await verifySuperAdmin(req);
    const body = await req.json();

    // Owner can create users in ANY org
    const newUser = await prisma.userProfile.create({
      data: {
        id: uuidv4(),
        userId: body.userId || uuidv4(),
        orgId: body.orgId, // Owner chooses which org
        role: body.role || 'USER',
        email: body.email,
        firstName: body.firstName,
        lastName: body.lastName,
        status: 'ACTIVE',
        mfaEnabled: false,
        failedLoginAttempts: 0
      }
    });

    // Broadcast to owner
    await broadcastToOwner('user:new', newUser);

    return NextResponse.json(newUser);
  } catch (error) {
    console.error('[owner-user-create]', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}