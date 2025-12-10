// src/app/api/admin/metrics/route.ts
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { verifySuperAdmin } from '@/lib/auth-super';
import { broadcastToOwner } from '@/lib/admin-broadcast';
import { redis } from '@/lib/redis';
// Helper functions for metrics
export async function GET(req: Request) {
  try {
    await verifySuperAdmin(req);

    // Query ALL organizations - NO orgId filter
    const [totalUsers, revenueToday, apiUsage, systemHealth] = await Promise.all([
      // All users across platform
      prisma.userProfile.count(),
      
      // All revenue across platform
      prisma.payment.aggregate({
        where: { 
          status: 'COMPLETED',
          createdAt: { gte: new Date(Date.now() - 86400000) }
        },
        _sum: { amount: true },
        _count: true
      }),

      // All API usage
      prisma.apiUsage.groupBy({
        by: ['endpoint'],
        where: { createdAt: { gte: new Date(Date.now() - 3600000) }},
        _count: true
      }),

      // System health (your checks)
      getSystemHealth()
    ]);

    const data = {
      timestamp: Date.now(),
      users: {
        total: totalUsers,
        online: await getAllActiveSessions(),
        growth: await calculatePlatformGrowth('users')
      },
      revenue: {
        day: revenueToday._sum.amount || 0,
        transactions: revenueToday._count,
        mrr: await calculateMRR(),
        growth: await calculatePlatformGrowth('revenue')
      },
      api: {
        requests: apiUsage.reduce((acc, s) => acc + s._count, 0),
        errorRate: await getGlobalErrorRate()
      },
      system: systemHealth,
      // Add top orgs for overview
      topOrganizations: await getTopOrganizations(5)
    };

    // Broadcast to owner dashboard
    await broadcastToOwner('metrics:update', data);

    return NextResponse.json(data);
  } catch (error) {
    console.error('[owner-metrics]', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

// Helper functions (query everything, no orgId)
async function getAllActiveSessions() {
  const keys = await redis.keys('session:*');
  return keys.length;
}

async function calculateMRR() {
  const result = await prisma.payment.aggregate({
    where: { status: 'COMPLETED' },
    _sum: { amount: true }
  });
  return result._sum.amount || 0;
}

async function getTopOrganizations(limit: number) {
  return prisma.organization.findMany({
    include: {
      _count: { select: { userProfiles: true, payments: true } },
      plan: true
    },
    orderBy: { payments: { _count: 'desc' } },
    take: limit
  });
}
// Add these helper functions at the bottom of the file

async function calculatePlatformGrowth(type: 'users' | 'revenue'): Promise<string> {
  const now = new Date();
  const lastPeriod = new Date(now.getTime() - (type === 'users' ? 604800000 : 2592000000)); // 7 days for users, 30 days for revenue

  if (type === 'users') {
    const [current, previous] = await Promise.all([
      prisma.userProfile.count(),
      prisma.userProfile.count({
        where: { createdAt: { lt: lastPeriod } }
      })
    ]);
    
    const growth = ((current - previous) / Math.max(previous, 1)) * 100;
    return `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%`;
  }

  // Revenue growth
  const [current, previous] = await Promise.all([
    prisma.payment.aggregate({
      where: { status: 'COMPLETED', createdAt: { gte: lastPeriod } },
      _sum: { amount: true }
    }),
    prisma.payment.aggregate({
      where: { status: 'COMPLETED', createdAt: { lt: lastPeriod } },
      _sum: { amount: true }
    })
  ]);

  const currentRev = current._sum.amount || new Prisma.Decimal(0);
  const previousRev = previous._sum.amount || new Prisma.Decimal(1);
  const growth = currentRev.sub(previousRev).div(previousRev).mul(100).toNumber();
  
  return `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%`;
}

async function getGlobalErrorRate(): Promise<string> {
  const oneHourAgo = new Date(Date.now() - 3600000);
  
  const [errors, total] = await Promise.all([
    prisma.auditLog.count({
      where: {
        action: { contains: 'ERROR' },
        createdAt: { gte: oneHourAgo }
      }
    }),
    prisma.apiUsage.count({
      where: { createdAt: { gte: oneHourAgo } }
    })
  ]);

  const rate = total > 0 ? (errors / total) * 100 : 0;
  return rate.toFixed(2); // Returns "0.02" which becomes "0.02% errors"
}

async function getSystemHealth() {
  const checks = await Promise.allSettled([
    redis.ping(),
    prisma.$queryRaw`SELECT 1`,
  ]);

  return {
    status: checks.every(c => c.status === 'fulfilled') ? 'OPERATIONAL' : 'DEGRADED',
    services: [
      { 
        service: 'redis', 
        status: checks[0].status === 'fulfilled' ? 'OPERATIONAL' : 'OUTAGE', 
        latency: '2ms', 
        lastChecked: new Date() 
      },
      { 
        service: 'database', 
        status: checks[1].status === 'fulfilled' ? 'OPERATIONAL' : 'OUTAGE', 
        latency: '45ms', 
        lastChecked: new Date() 
      },
    ]
  };
}

// Helper for MRR calculation
// async function calculateMRR() {
//   const result = await prisma.payment.aggregate({
//     where: { status: 'COMPLETED' },
//     _sum: { amount: true }
//   });
//   return result._sum.amount || new Prisma.Decimal(0);
// }