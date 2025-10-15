import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import * as speakeasy from 'speakeasy';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { code } = await req.json();
  const stackJWT = cookies().get('stack-session')?.value;
  if (!stackJWT) return NextResponse.json({ valid: false }, { status: 401 });

  const email = JSON.parse(atob(stackJWT.split('.')[1])).email;

  const { data } = await supabase
    .from('mfa_factors')
    .select('secret')
    .eq('email', email)
    .single();

  if (!data) return NextResponse.json({ valid: false });

  const valid = speakeasy.totp.verify({ secret: data.secret, token: code, encoding: 'base32', window: 1 });
  if (valid) await supabase.from('mfa_factors').update({ verified: true }).eq('email', email);

  return NextResponse.json({ valid });
}