// src/app/api/debug/session/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('stack-session-token');
  const allCookies = cookieStore.getAll();

  return NextResponse.json({
    hasSessionToken: !!sessionToken,
    sessionTokenValue: sessionToken?.value,
    allCookies: allCookies.map(c => ({ name: c.name, value: c.value.slice(0, 10) + '...' })),
    timestamp: new Date().toISOString()
  });
}