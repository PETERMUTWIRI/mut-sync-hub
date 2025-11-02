export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

const RENDER_SOCKET = 'https://mutsynchub.onrender.com/socket.io'; // ← no space

export async function GET(req: NextRequest) {
  const target = new URL(RENDER_SOCKET);
  target.search = req.nextUrl.search;

  const res = await fetch(target, {
    headers: { 'x-api-key': 'dev-analytics-key-123' },
  });

  return new NextResponse(res.body, {
    status: res.status,
    headers: { 'Content-Type': 'text/plain' },
  });
}