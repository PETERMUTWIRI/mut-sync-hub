// File: src/app/handler/oauth-callback/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@stackframe/stack';

export default function OAuthCallbackPage() {
  const user = useUser();
  const router = useRouter();
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    // If user is authenticated, redirect immediately
    if (user?.id) {
      router.push('/user-dashboard-main');
      return;
    }

    // If no user after 3 seconds, retry or show error
    if (retryCount < 5) {
      const timer = setTimeout(() => {
        setRetryCount(prev => prev + 1);
        // Force re-render to re-check user state
        router.refresh();
      }, 1000 * retryCount); // Exponential backoff: 0s, 1s, 2s, 3s, 4s

      return () => clearTimeout(timer);
    } else {
      // Max retries reached, redirect to sign-in
      router.push('/sign-in?error=oauth_timeout');
    }
  }, [user, router, retryCount]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-cockpit-bg">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-2xl font-bold text-cyan-400">Completing Sign In...</h2>
        <p className="text-gray-400 mt-2">Attempt {retryCount + 1} of 5</p>
      </div>
    </div>
  );
}