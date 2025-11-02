export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

const RENDER_SOCKET = 'https://mutsynchub.onrender.com/socket.io';

export async function GET(req: NextRequest) {
  const target = new URL(RENDER_SOCKET);
  target.search = req.nextUrl.search; // forward query string

  const res = await fetch(target, {
    headers: { 'x-api-key': 'dev-analytics-key-123' },
  });

  // forward exact body & status
  return new NextResponse(res.body, {
    status: res.status,
    headers: { 'Content-Type': 'text/plain' },
  });
}