// src/context/useRoleRedirect.tsx
"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUser } from '@stackframe/stack';
import { toast } from 'react-hot-toast';

// Cache interface for type safety
interface UserSessionCache {
  role: string;
  orgId: string;
  profileId: string;
  expiresAt: number;
}

// Internal fetch function (no circular dependencies)
const fetchOrgProfile = async () => {
  const res = await fetch('/api/org-profile', { credentials: 'include' });
  if (!res.ok) throw new Error(`Failed to fetch org profile: ${res.status}`);
  return res.json();
};

export const useRoleRedirect = () => {
  const user = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only run on auth pages
    const authPages = ['/sign-in', '/sign-up', '/auth/callback'];
    if (!pathname || !authPages.includes(pathname)) {
      console.log('useRoleRedirect: Skipping on non-auth page', pathname);
      return;
    }

    if (!user) {
      console.log('useRoleRedirect: No user, staying on', pathname);
      return;
    }

    let isMounted = true;

    const fetchRole = async () => {
      try {
        // 1. Check cache first
        const cachedRaw = localStorage.getItem('userSession');
        if (cachedRaw) {
          const cached = JSON.parse(cachedRaw) as UserSessionCache;
          if (cached.expiresAt > Date.now()) {
            const role = cached.role?.toLowerCase() || 'user';
            console.log('useRoleRedirect: Using cached role', role);
            
            if (isMounted) {
              // SUPER_ADMIN always goes to admin dashboard
              if (role === 'super_admin') {
                router.push('/admin-dashboard');
                toast.success('Welcome to Mission Control');
              } else if (role === 'admin') {
                router.push('/admin-dashboard');
                toast.success('Welcome to Admin Dashboard');
              } else {
                // REGULAR USER goes to their dashboard
                router.push('/user-dashboard-main');
                toast.success('Welcome to Analytics Engine');
              }
            }
            return;
          }
          // Cache expired, clear it
          localStorage.removeItem('userSession');
        }

        // 2. Fetch fresh from backend
        console.log('useRoleRedirect: Fetching fresh profile');
        const payload = await fetchOrgProfile();
        
        const { role = 'USER', orgId, profileId } = payload || {};
        const normalizedRole = (role || 'USER').toLowerCase();

        // 3. Cache the result
        const session: UserSessionCache = {
          role: normalizedRole,
          orgId,
          profileId,
          expiresAt: Date.now() + 60 * 60 * 1000, // 1 hour
        };
        localStorage.setItem('userSession', JSON.stringify(session));

        console.log('useRoleRedirect: Fresh role fetched', normalizedRole);

        if (isMounted) {
          // 4. Route based on role
          if (normalizedRole === 'super_admin') {
            router.push('/admin-dashboard');
            toast.success('Owner access granted');
          } else if (normalizedRole === 'admin') {
            router.push('/admin-dashboard');
            toast.success('Admin access granted');
          } else {
            router.push('/user-dashboard-main'); // ✅ CORRECT: User dashboard
            toast.success('Access granted');
          }
        }
      } catch (error) {
        console.error('useRoleRedirect: Failed to fetch role', error);
        if (isMounted) {
          // Fallback to safe route
          router.push('/user-dashboard-main');
          toast.error('Authentication issue, redirecting to dashboard');
        }
      }
    };

    fetchRole();

    return () => {
      isMounted = false;
    };
  }, [user, pathname, router]);
};

export default useRoleRedirect;