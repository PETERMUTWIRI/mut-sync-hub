// src/app/api/admin/organizations/route.ts
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySuperAdmin } from '@/lib/auth-super';
import { NextRequest } from 'next/server';
import { Organization, Plan } from '@prisma/client';

interface OrganizationWithCounts extends Organization {
    _count: {
        userProfiles: number;
        payments: number;
        apiKeys: number;
    };
    plan: Plan | null;
}

interface OrganizationWithRevenue extends OrganizationWithCounts {
    totalRevenue: number;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
    try {
        await verifySuperAdmin(req);

        const organizations = await prisma.organization.findMany({
            include: {
                _count: {
                    select: { 
                        userProfiles: true, 
                        payments: true,
                        apiKeys: true
                    }
                },
                plan: true
            },
            orderBy: { createdAt: 'desc' },
            take: 100
        });

        // Calculate total revenue per org
        const orgsWithRevenue: OrganizationWithRevenue[] = await Promise.all(organizations.map(async (org) => {
            const revenue = await prisma.payment.aggregate({
                where: { orgId: org.id, status: 'COMPLETED' },
                _sum: { amount: true }
            });
            
            return {
                ...org,
                totalRevenue: revenue._sum.amount ? Number(revenue._sum.amount) : 0
            };
        }));

        return NextResponse.json(orgsWithRevenue);
    } catch (error) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
}