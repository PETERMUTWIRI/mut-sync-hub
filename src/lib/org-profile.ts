import { NextRequest } from 'next/server';


const INTERNAL_BASE = process.env.NEXT_INTERNAL_ANALYTICS_URL || 'http://localhost:3000';

export async function getOrgProfileInternal(req: NextRequest) {
  /* reuse the SAME user id that /api/org-profile already resolved */
  const res = await fetch(`${INTERNAL_BASE}/api/org-profile`, {
    headers: { cookie: req.headers.get('cookie')! },
  });
  if (!res.ok) throw new Error('Org fetch failed');
  const json = await res.json();          // { userId, orgId, role, plan, ... }
  return { userId: json.userId, orgId: json.orgId, role: json.role, plan: json.plan };
}