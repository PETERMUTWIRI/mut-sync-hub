export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
// src/app/api/mfa/enrol/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import * as speakeasy from 'speakeasy';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  /* 1.  who is logged in via Stack? */
  const stackJWT = cookies().get('stack-session')?.value;
  if (!stackJWT) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const payload = JSON.parse(atob(stackJWT.split('.')[1]));
  const email = payload.email as string;

  /* 2.  idempotent insert / fetch secret */
  const { data: existing } = await supabase
    .from('mfa_factors')
    .select('secret,verified')
    .eq('email', email)
    .single();

  let secret = existing?.secret;
  if (!secret) {
    const generated = speakeasy.generateSecret({ name: `YourApp (${email})` });
    secret = generated.base32;
    await supabase.from('mfa_factors').insert({ email, secret });
  }

  /* 3.  build otpauth url for QR */
  const url = speakeasy.otpauthURL({
    secret,
    label: email,
    issuer: 'YourApp',
    encoding: 'base32',
  });

  return NextResponse.json({ secret, url });
}