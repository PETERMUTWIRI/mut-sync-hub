// src/components/ProtectedRoute.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUser } from '@stackframe/stack';
import { motion } from 'framer-motion';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'user' | 'admin' | 'super_admin';
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const user = useUser({ or: 'redirect' });
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Show loading until we confirm user session
    if (user !== undefined) {
      setLoading(false);
    }
  }, [user]);

  // For admin routes, check role via API
  useEffect(() => {
    if (!user || loading) return;

    if (pathname?.startsWith('/admin-')) {
      // Verify admin access
      fetch('/api/org-profile', { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
          const role = data?.role?.toLowerCase();
          if (role !== 'super_admin' && role !== 'admin') {
            router.replace('/user-dashboard-main');
          }
        })
        .catch(() => router.replace('/sign-in'));
    }
  }, [user, loading, pathname, router]);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-cockpit-bg flex items-center justify-center"
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="mt-4 text-cyan-400 font-sans text-lg">Authorizing...</p>
        </div>
      </motion.div>
    );
  }

  if (!user) {
    router.replace('/sign-in');
    return null;
  }

  return <>{children}</>;
}