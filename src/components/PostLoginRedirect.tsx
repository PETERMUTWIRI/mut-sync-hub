// src/components/PostLoginRedirect.tsx
'use client';

import { useRoleRedirect } from '@/context/useRoleRedirect';

export function PostLoginRedirect() {
  useRoleRedirect();
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F7FAFC] dark:bg-[#1E2A44]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2E7D7D] mx-auto"></div>
        <p className="mt-2 text-[#2E7D7D] text-lg font-semibold">Redirecting...</p>
      </div>
    </div>
  );
}