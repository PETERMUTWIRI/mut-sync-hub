// src/lib/org-profile-client.ts
'use client';

/**
 * Fetches org profile from client components
 */
export async function getOrgProfile() {
  const res = await fetch('/api/org-profile', {
    credentials: 'include',
    headers: { 'Accept': 'application/json' }
  });
  
  if (!res.ok) {
    throw new Error(`Failed to fetch org profile: HTTP ${res.status}`);
  }
  
  return res.json();
}