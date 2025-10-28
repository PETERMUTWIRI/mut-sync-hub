/* src/lib/billing.ts – client-safe wrapper that talks to server API routes */
export async function getAnalyticsUsage(orgId: string) {
  const res = await fetch(`/api/billing/usage?orgId=${encodeURIComponent(orgId)}`, { cache: 'no-store' });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Failed to fetch analytics usage for ${orgId}`);
  }
  return res.json();
}

export async function enforceAnalyticsLimit(orgId: string, feature: string) {
  const res = await fetch(`/api/billing/enforce`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orgId, feature }),
    cache: 'no-store',
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Failed to enforce analytics limit for ${orgId}`);
  }
  return res.json();
}