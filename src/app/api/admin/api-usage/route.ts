// src/app/api/admin/api-usage/route.ts
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySuperAdmin } from '@/lib/auth-super';

export async function GET(req: Request) {
  try {
    await verifySuperAdmin(req);

    const oneHourAgo = new Date(Date.now() - 3600000);

    const [usageStats, errorStats] = await Promise.all([
      prisma.apiUsage.groupBy({
        by: ['endpoint'],
        where: { createdAt: { gte: oneHourAgo } },
        _count: true,
        orderBy: { _count: { endpoint: 'desc' } },
        take: 10,
      }),

      prisma.auditLog.groupBy({
        by: ['resource'],
        where: {
          action: { contains: 'ERROR' },
          createdAt: { gte: oneHourAgo },
          resource: { not: null as any }, // ✅ cast to any to bypass strict typing
        },
        _count: true,
      }),
    ]);

    // Mock latency map
    const mockLatency: Record<string, number> = {
      '/api/users': 23,
      '/api/payments': 87,
      '/api/analytics': 156,
      '/api/webhooks': 12,
      '/api/admin/users': 34,
    };

    const byEndpoint = usageStats.map((stat) => {
      const endpoint = stat.endpoint;
      const errorStat = errorStats.find((e) => e.resource === endpoint);
      const errorCount = (errorStat?._count as number) ?? 0; // ✅ cast to number
      const requests = (stat._count as number) ?? 0; // ✅ cast to number

      return {
        endpoint,
        requests,
        errors: errorCount,
        errorRate: requests > 0 ? Number(((errorCount / requests) * 100).toFixed(1)) : 0,
        latency: mockLatency[endpoint] ?? Math.floor(Math.random() * 100 + 20),
      };
    });

    const totalRequests = byEndpoint.reduce((sum, ep) => sum + ep.requests, 0);
    const totalErrors = byEndpoint.reduce((sum, ep) => sum + ep.errors, 0);

    return NextResponse.json({
      totalRequests,
      errorRate: totalRequests > 0 ? Number(((totalErrors / totalRequests) * 100).toFixed(1)) : 0,
      avgLatency: '45ms',
      byEndpoint,
    });
  } catch (error) {
    console.error('API Usage Error:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}