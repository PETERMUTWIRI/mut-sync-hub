// src/app/auth/callback/page.tsx
'use client';

import { useRoleRedirect } from '@/context/useRoleRedirect';
import { PostLoginRedirect } from '@/components/PostLoginRedirect';

export const dynamic = 'force-static'; // Force static rendering

export default function AuthCallback() {
  useRoleRedirect();
  //auth
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7FAFC] dark:bg-[#1E2A44]">
      <PostLoginRedirect />
    </div>
  );
}