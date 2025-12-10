// src/app/api/seed-owner/route.ts
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const ownerEmail = process.env.OWNER_EMAIL;
    if (!ownerEmail) {
      return NextResponse.json({ 
        error: 'OWNER_EMAIL not configured',
        message: 'Set OWNER_EMAIL in Vercel environment variables'
      }, { status: 500 });
    }

    // Find owner profile (will exist after first login)
    const profile = await prisma.userProfile.findFirst({
      where: { email: ownerEmail }
    });

    if (!profile) {
      return NextResponse.json({ 
        error: 'Owner not found',
        message: 'Owner must sign in once before seeding',
        instructions: `Sign in with ${ownerEmail} first, then visit this endpoint again`
      }, { status: 404 });
    }

    // Promote to SUPER_ADMIN
    await prisma.userProfile.update({
      where: { id: profile.id },
      data: { role: 'SUPER_ADMIN' }
    });

    return NextResponse.json({ 
      success: true,
      email: ownerEmail,
      role: 'SUPER_ADMIN',
      message: 'Owner successfully promoted to SUPER_ADMIN'
    });
  } catch (error) {
    console.error('[seed-owner]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}