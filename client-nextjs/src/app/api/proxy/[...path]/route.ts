export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_BASE_URL = process.env.BACKEND_API_URL?.replace(/\/$/, '') || 'http://localhost:5000';

// Headers that should not be proxied
const EXCLUDED_HEADERS = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailers',
  'transfer-encoding',
  'upgrade',
  'host',
]);

async function proxyRequest(req: NextRequest, method: string) {
  try {
    // Get the access token from request headers
  // Expect the client to send the token in the x-stack-access-token header
  const accessToken = req.headers.get('x-stack-access-token') || '';

    // keep backend routes aligned with Nest global prefix (/api)
    const urlPath = req.nextUrl.pathname.replace(/^\/api\/proxy/, '');
    const url = `${BACKEND_BASE_URL}/api${urlPath}${req.nextUrl.search || ''}`;

    // Prepare headers
    const headers: Record<string, string> = {
      'x-stack-access-token': accessToken || '',
      'content-type': req.headers.get('content-type') || 'application/json',
    };

    // Copy other relevant headers
    req.headers.forEach((value, key) => {
      const lowercaseKey = key.toLowerCase();
      if (!EXCLUDED_HEADERS.has(lowercaseKey)) {
        headers[lowercaseKey] = value;
      }
    });

    // Prepare body for non-GET/HEAD requests
    let body: any = undefined;
    if (method !== 'GET' && method !== 'HEAD') {
      const contentType = req.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        try {
          body = JSON.stringify(await req.json());
        } catch {
          const text = await req.text();
          body = text.length > 0 ? text : undefined;
        }
      } else {
        const arrayBuffer = await req.arrayBuffer();
        body = arrayBuffer.byteLength > 0 ? Buffer.from(arrayBuffer) : undefined;
      }
    }

    // Forward the request to the backend
    const response = await fetch(url, {
      method,
      headers,
      body,
    });

    // Prepare response headers
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      if (!EXCLUDED_HEADERS.has(key.toLowerCase())) {
        responseHeaders[key] = value;
      }
    });

    // Handle the response based on content type
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      const jsonData = await response.json();
      return NextResponse.json(jsonData, {
        status: response.status,
        headers: responseHeaders,
      });
    } else {
      const arrayBuffer = await response.arrayBuffer();
      return new NextResponse(arrayBuffer, {
        status: response.status,
        headers: responseHeaders,
      });
    }
  } catch (error) {
    console.error('Proxy request error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) { return proxyRequest(req, 'GET'); }
export async function POST(req: NextRequest) { return proxyRequest(req, 'POST'); }
export async function PUT(req: NextRequest) { return proxyRequest(req, 'PUT'); }
export async function PATCH(req: NextRequest) { return proxyRequest(req, 'PATCH'); }
export async function DELETE(req: NextRequest) { return proxyRequest(req, 'DELETE'); }
