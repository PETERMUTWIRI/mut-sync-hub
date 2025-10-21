export const dynamic = 'force-dynamic';
// src/app/api/mfa/verify/route.ts
import { NextResponse } from 'next/server';
import * as speakeasy from 'speakeasy';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function POST(req: Request) {
  const { code } = await req.json();
  const stackJWT = req.headers
    .get('cookie')
    ?.split('; ')
    .find(c => c.startsWith('stack-session='))
    ?.split('=')[1];

  if (!stackJWT) return NextResponse.json({ valid: false }, { status: 401 });

  const email = JSON.parse(atob(stackJWT.split('.')[1])).email;

  const { data } = await supabase
    .from('mfa_factors')
    .select('secret, verified')
    .eq('email', email)
    .single();

  if (!data) return NextResponse.json({ valid: false });

  const valid = speakeasy.totp.verify({
    secret: data.secret,
    encoding: 'base32',
    token: code,
    window: 1,
  });

  if (valid && !data.verified) {
    await supabase.from('mfa_factors').update({ verified: true }).eq('email', email);
  }

  return NextResponse.json({ valid });
}