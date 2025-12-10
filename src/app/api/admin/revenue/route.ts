// src/app/api/admin/revenue/route.ts
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySuperAdmin } from '@/lib/auth-super';
import { any } from 'zod';

export async function GET(req: Request) {
  try {
    await verifySuperAdmin(req);
    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || '30d';

    const days = period === '24h' ? 1 : period === '7d' ? 7 : period === '30d' ? 30 : 365;

    const [total, mrrResult, churn, arpu, timeline, recentTx] = await Promise.all([
      // Total revenue
      prisma.payment.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true }
      }),
      
      // MRR (Monthly Recurring Revenue)
      prisma.payment.aggregate({
        where: { 
          status: 'COMPLETED',
          createdAt: { gte: new Date(Date.now() - 30 * 86400000) }
        },
        _sum: { amount: true }
      }),
      
      // Churn rate (simplified)
      calculateChurn(),
      
      // ARPU (Average Revenue Per User)
      calculateARPU(),
      
      // Timeline data (last N days)
      getRevenueTimeline(days),
      
      // Recent transactions
      prisma.payment.findMany({
        where: { status: 'COMPLETED' },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { 
          organization: { select: { name: true, subdomain: true } },
          userProfile: { select: { email: true } }
        }
      })
    ]);

    return NextResponse.json({
      total: total._sum.amount || 0,
      mrr: mrrResult._sum.amount || 0,
      churn,
      arpu,
      timeline,
      recentTransactions: recentTx
    });
  } catch (error) {
    console.error('[admin-revenue] GET:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

async function calculateChurn(): Promise<number> {
  // Simplified: (Cancellations / Total active subscriptions) * 100
  const totalSubscriptions = await prisma.subscription.count({ where: { status: 'ACTIVE' } });
  const cancelledThisMonth = await prisma.subscription.count({ 
    where: { 
      status: 'CANCELLED',
      startDate: { gte: new Date(Date.now() - 30 * 86400000) }
    } 
  });
  
  return totalSubscriptions > 0 ? (cancelledThisMonth / totalSubscriptions) * 100 : 0;
}

async function calculateARPU(): Promise<number> {
  // ARPU = Total Revenue / Total Active Organizations
  const totalRevenue = await prisma.payment.aggregate({
    where: { status: 'COMPLETED' },
    _sum: { amount: true }
  });
  
  const totalOrgs = await prisma.organization.count({ where: { status: 'ACTIVE' } });
  
  return totalOrgs > 0 ? Number(totalRevenue._sum.amount || 0) / totalOrgs : 0;
}

async function getRevenueTimeline(days: number) {
  const result = await prisma.$queryRaw<
    { date: string; revenue: number; transactions: number }[]
  >`
    SELECT 
      DATE("createdAt") as date,
      SUM("amount")::float as revenue,
      COUNT(*)::int as transactions
    FROM "Payment"
    WHERE "status" = 'COMPLETED'
      AND "createdAt" >= NOW() - INTERVAL '${days} days'
    GROUP BY DATE("createdAt")
    ORDER BY date ASC
  `;

  return result.map(row => ({
    date: row.date,
    revenue: row.revenue,
    transactions: row.transactions
  }));
}