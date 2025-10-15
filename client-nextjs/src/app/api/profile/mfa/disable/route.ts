import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST() {
  const stackJWT = cookies().get('stack-session')?.value;
  if (!stackJWT) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const email = JSON.parse(atob(stackJWT.split('.')[1])).email;
  await supabase.from('mfa_factors').delete().eq('email', email);

  return NextResponse.json({ ok: true });
}