// File: src/context/useRoleRedirect.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUser } from '@stackframe/stack';
import { toast } from 'react-hot-toast';

interface UserSessionCache {
  role: string;
  orgId: string;
  profileId: string;
  expiresAt: number;
}

export const useRoleRedirect = () => {
  const user = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    // Only run on auth pages
    const authPages = ['/sign-in', '/sign-up', '/handler/oauth-callback'];
    if (!pathname || !authPages.includes(pathname)) {
      setIsLoading(false);
      return;
    }

    // ⭐ CRITICAL: Wait for user to be FULLY authenticated
    if (!user || !user.id) {
      console.log('Waiting for user session...');
      // Keep loading state, don't proceed
      return;
    }

    let isMounted = true;

    const fetchRole = async () => {
      setIsLoading(true);
      
      try {
        // Check cache first
        const cachedRaw = localStorage.getItem('userSession');
        if (cachedRaw) {
          const cached = JSON.parse(cachedRaw) as UserSessionCache;
          if (cached.expiresAt > Date.now()) {
            const role = cached.role?.toLowerCase() || 'user';
            if (isMounted) {
              routeUser(role);
              setIsLoading(false);
            }
            return;
          }
          localStorage.removeItem('userSession');
        }

        // Wait for cookie to be set after OAuth
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second

        const res = await fetch('/api/org-profile', {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });

        if (res.status === 401 && retryCount < 3) {
          console.log(`Retry ${retryCount + 1}/3: Session not ready`);
          setRetryCount(prev => prev + 1);
          setTimeout(() => {
            if (isMounted) fetchRole();
          }, 1000);
          return;
        }

        if (!res.ok) throw new Error(`Failed: ${res.status}`);

        const payload = await res.json();
        const { role = 'USER', orgId, profileId } = payload || {};
        const normalizedRole = (role || 'USER').toLowerCase();

        // Cache the result
        const session: UserSessionCache = {
          role: normalizedRole,
          orgId,
          profileId,
          expiresAt: Date.now() + 60 * 60 * 1000,
        };
        localStorage.setItem('userSession', JSON.stringify(session));

        if (isMounted) {
          routeUser(normalizedRole);
        }
      } catch (error) {
        console.error('useRoleRedirect error:', error);
        if (isMounted) {
          toast.error('Authentication error, redirecting...');
          router.push('/user-dashboard-main');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    const routeUser = (role: string) => {
      if (role === 'super_admin' || role === 'admin') {
        router.push('/admin-dashboard');
        toast.success('Welcome to Mission Control');
      } else {
        router.push('/user-dashboard-main');
        toast.success('Welcome to Analytics Engine');
      }
    };

    // Reset retry count when user changes
    setRetryCount(0);
    fetchRole();

    return () => {
      isMounted = false;
    };
  }, [user, pathname, router, retryCount]);

  return { isLoading };
};