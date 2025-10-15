// src/context/useRoleRedirect.tsx
"use client";
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUser } from '@stackframe/stack';
import { toast } from 'react-hot-toast';
import { ensureAndFetchUserProfile } from '@/app/api/get-user-role/action';

export const useRoleRedirect = () => {
  const user = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== '/sign-in' && pathname !== '/auth/callback') {
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
        const cachedSession = localStorage.getItem('userSession');
        if (cachedSession) {
          const parsed = JSON.parse(cachedSession);
          if (parsed.expiresAt && parsed.expiresAt > Date.now()) {
            const role = parsed.role?.toLowerCase() || 'user';
            console.log('useRoleRedirect: Role from cache', role);
            if (isMounted) {
              router.push(role === 'admin' ? '/admin-dashboard' : '/resources');
              toast.success(`Redirecting to ${role} dashboard`);
            }
            return;
          }
          localStorage.removeItem('userSession');
        }

        console.log('useRoleRedirect: Fetching role for user', user.id);
        const { role, orgId, isTechnical } = await ensureAndFetchUserProfile();
        const fetchedRole = role.toLowerCase() || 'user';
        console.log('useRoleRedirect: Role fetched', fetchedRole);
        localStorage.setItem('userSession', JSON.stringify({
          role: fetchedRole,
          orgId,
          isTechnical,
          expiresAt: Date.now() + 60 * 60 * 1000,
        }));
        if (isMounted) {
          router.push(fetchedRole === 'admin' ? '/admin-dashboard' : '/resources');
          toast.success(`Redirecting to ${fetchedRole} dashboard`);
        }
      } catch (error) {
        console.error('useRoleRedirect: Failed to fetch role', error);
        if (isMounted) {
          router.push('/resources');
          toast.error('Failed to fetch role, redirecting to resources');
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