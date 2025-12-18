// File: src/components/PostLoginRedirect.tsx
'use client';

import { useRoleRedirect } from '@/context/useRoleRedirect';
import { useEffect } from 'react';

export function PostLoginRedirect() {
  useRoleRedirect(); // Single source of truth

  // Clear the return_to parameter after auth
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('after_auth_return_to')) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-cockpit-bg">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-2xl font-bold text-cyan-400">Welcome Back</h2>
        <p className="text-gray-400 mt-2">Routing to your workspace...</p>
      </div>
    </div>
  );
}