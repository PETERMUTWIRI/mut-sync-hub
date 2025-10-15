// middleware.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function middleware(req: NextRequest) {
  // protect /app/*
  if (!req.nextUrl.pathname.startsWith('/app')) return NextResponse.next();

  const stackJWT = req.cookies.get('stack-session')?.value;
  if (!stackJWT) return NextResponse.redirect(new URL('/sign-in', req.url));

  const email = JSON.parse(atob(stackJWT.split('.')[1])).email;
  const { data } = await supabase
    .from('mfa_factors')
    .select('verified')
    .eq('email', email)
    .single();

  if (!data?.verified) {
    return NextResponse.redirect(new URL('/mfa/setup', req.url));
  }
  return NextResponse.next();
}