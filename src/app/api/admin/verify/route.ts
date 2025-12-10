// src/app/api/admin/verify/route.ts
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { verifySuperAdmin } from '@/lib/auth-super';

export async function GET(req: NextRequest) {
  try {
    await verifySuperAdmin(req);
    return NextResponse.json({ authorized: true });
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}