export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { getAnalyticsUsage } from '@/lib/analytics-usage';
import { stackServerApp } from '@/lib/stack';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const user = await stackServerApp.getUser({ or: 'throw', tokenStore: 'nextjs-cookie' });
    const profile = await prisma.userProfile.findUnique({ where: { userId: user.id } });
    if (!profile) throw new Error('Profile not found');

    const usage = await getAnalyticsUsage(profile.orgId);
    return NextResponse.json(usage);
  } catch (e: any) {
    console.error('[api/usage]', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}