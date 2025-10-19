// middleware.ts
import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

/* ---- tiny Edge-safe base64 decode ---- */
function base64Decode(str: string) {
  return typeof Buffer !== 'undefined'
    ? Buffer.from(str, 'base64').toString()
    : atob(str); // Edge runtime
}

export async function middleware(req: NextRequest) {
  if (!req.nextUrl.pathname.startsWith('/app')) return NextResponse.next();

  const stackJWT = req.cookies.get('stack-session')?.value;
  if (!stackJWT) return NextResponse.redirect(new URL('/sign-in', req.url));

  try {
    const payload = JSON.parse(base64Decode(stackJWT.split('.')[1]));
    const email = payload.email;

    const { data } = await supabase
      .from('mfa_factors')
      .select('verified')
      .eq('email', email)
      .single();

    if (!data?.verified) {
      return NextResponse.redirect(new URL('/mfa/setup', req.url));
    }
  } catch {
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/app/:path*'],
};