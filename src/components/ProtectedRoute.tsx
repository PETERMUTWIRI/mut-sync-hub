// src/components/ProtectedRoute.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUser } from '@stackframe/stack';
import { motion } from 'framer-motion';

// Cache interface for type safety
interface UserSessionCache {
  role: string;
  orgId: string;
  profileId: string;
  expiresAt: number;
}

// Fetches org profile (includes owner auto-promotion)
async function fetchOrgProfileClient() {
  const res = await fetch('/api/org-profile', { credentials: 'include' });
  if (!res.ok) throw new Error(`Failed to fetch org profile: ${res.status}`);
  return res.json();
}

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'user' | 'admin' | 'super_admin';
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const user = useUser({ or: 'redirect' });
  const router = useRouter();
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRole = async () => {
      if (!user) return;
      
      try {
        // Check cache first
        const cachedRaw = localStorage.getItem('userSession');
        if (cachedRaw) {
          const cached = JSON.parse(cachedRaw) as UserSessionCache;
          if (cached.expiresAt > Date.now()) {
            setRole(cached.role.toLowerCase());
            setIsOwner(cached.role === 'SUPER_ADMIN');
            setLoading(false);
            return;
          }
          localStorage.removeItem('userSession');
        }

        // Fetch fresh from backend (includes owner auto-promotion)
        const payload = await fetchOrgProfileClient();
        const fetchedRole = (payload?.role || 'USER').toLowerCase();
        const isSuperAdmin = fetchedRole === 'super_admin';
        
        setRole(fetchedRole);
        setIsOwner(isSuperAdmin);

        // Cache result
        const cache: UserSessionCache = {
          role: fetchedRole,
          orgId: payload.orgId,
          profileId: payload.profileId,
          expiresAt: Date.now() + 60 * 60 * 1000,
        };
        localStorage.setItem('userSession', JSON.stringify(cache));
      } catch (err) {
        console.error('ProtectedRoute: Failed to fetch role', err);
        setError('Failed to authenticate');
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, [user]);

  useEffect(() => {
    if (loading || !user || !role) return;
    // If owner (SUPER_ADMIN), allow access to everything
    if (isOwner) {
      // Redirect from user dashboard to admin dashboard
      if (pathname?.startsWith('/user-')) {
        router.replace('/admin-dashboard');
      }
      return; // Allow access to all routes
    }

    // Normal role-based access control
    if (requiredRole && role !== requiredRole) {
      if (role === 'admin') {
        router.replace('/admin-dashboard');
      } else if (role === 'user') {
        router.replace('/user-dashboard-main');
      } else {
        router.replace('/');
      }
    }
  }, [user, loading, role, requiredRole, router, isOwner, pathname]);
  // }, [user, loading, role, requiredRole, router, isOwner]);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-cockpit-bg flex items-center justify-center"
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="mt-4 text-cyan-400 font-sans text-lg">Authenticating...</p>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-cockpit-bg flex items-center justify-center"
      >
        <div className="text-center bg-cockpit-panel rounded-xl p-8 border border-gray-700">
          <p className="text-red-400 font-sans text-lg">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 bg-cyan-600 text-white px-6 py-2 rounded-lg font-sans hover:bg-cyan-500"
          >
            Return to Home
          </button>
        </div>
      </motion.div>
    );
  }

  return <>{children}</>;
}