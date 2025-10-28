
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@stackframe/stack';
import { motion } from 'framer-motion';
// Client-side helper: call the secure API route instead of importing server helper
async function fetchOrgProfileClient() {
  const res = await fetch('/api/org-profile');
  if (!res.ok) throw new Error('Failed to fetch org profile');
  return res.json();
}

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'user' | 'admin';
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const user = useUser({ or: 'redirect' });
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRole = async () => {
      if (!user) return;
      try {
        const cachedSession = localStorage.getItem('userSession');
        if (cachedSession) {
          const parsed = JSON.parse(cachedSession);
          if (parsed.expiresAt && parsed.expiresAt > Date.now()) {
            setRole(parsed.role?.toLowerCase() || 'user');
            setLoading(false);
            return;
          }
          localStorage.removeItem('userSession');
        }

        const payload = await fetchOrgProfileClient();
        const fetchedRole = (payload?.role || 'USER').toLowerCase();
        setRole(fetchedRole);
        localStorage.setItem('userSession', JSON.stringify({
          role: fetchedRole,
          orgId: payload?.orgId,
          expiresAt: Date.now() + 60 * 60 * 1000,
        }));
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
    if (requiredRole && role !== requiredRole) {
      if (role === 'admin') {
        router.replace('/admin-dashboard');
      } else if (role === 'user') {
        router.replace('/resources');
      } else {
        router.replace('/');
      }
    }
  }, [user, loading, role, requiredRole, router]);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-slate-950 flex items-center justify-center"
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto"></div>
          <p className="mt-4 text-gray-300 font-sans text-lg">Authenticating...</p>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-slate-950 flex items-center justify-center"
      >
        <div className="text-center bg-gray-800 rounded-lg p-8 border border-gray-700">
          <p className="text-red-400 font-sans text-lg">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 bg-cyan-600 text-white hover:bg-cyan-700 px-6 py-2 rounded-lg font-sans"
          >
            Return to Home
          </button>
        </div>
      </motion.div>
    );
  }

  return <>{children}</>;
}