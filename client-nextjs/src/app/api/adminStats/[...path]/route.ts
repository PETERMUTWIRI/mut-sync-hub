import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const BACKEND_BASE_URL = process.env.BACKEND_API_URL || 'http://localhost:4000/api';

async function proxyRequest(req: NextRequest, method: string) {
  const token = req.cookies.get('neon-auth-token')?.value;
  const { pathname, search } = req.nextUrl;
  // Remove '/api/adminStats' from the path and append to backend
  const backendPath = pathname.replace(/^\/api\/adminStats/, '/admin/stats');
  const url = `${BACKEND_BASE_URL}${backendPath}${search}`;

  let body;
  if (method !== 'GET' && method !== 'HEAD') {
    body = await req.text();
  }

  const res = await fetch(url, {
    method,
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': req.headers.get('content-type') || 'application/json',
    },
    body: body || undefined,
  });

  const responseBody = await res.text();
  return new NextResponse(responseBody, {
    status: res.status,
    headers: { 'Content-Type': res.headers.get('content-type') || 'application/json' },
  });
}

export async function GET(req: NextRequest) {
  return proxyRequest(req, 'GET');
}
export async function POST(req: NextRequest) {
  return proxyRequest(req, 'POST');
}
export async function PUT(req: NextRequest) {
  return proxyRequest(req, 'PUT');
}
export async function DELETE(req: NextRequest) {
  return proxyRequest(req, 'DELETE');
}
