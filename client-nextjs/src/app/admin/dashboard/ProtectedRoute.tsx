'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any | null>(null);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/org-profile', { credentials: 'include' });
        if (!res.ok) {
          // Not authenticated
          if (mounted) {
            setProfile(null);
            setLoading(false);
            router.replace('/login');
          }
          return;
        }
        const json = await res.json();
        if (mounted) {
          setProfile(json);
          setLoading(false);
          // If role exists and is not admin, redirect to resources
          const role = (json?.role || 'USER').toLowerCase();
          if (role !== 'admin') router.replace('/');
        }
      } catch (err) {
        if (mounted) {
          setProfile(null);
          setLoading(false);
          router.replace('/login');
        }
      }
    };

    fetchProfile();
    return () => { mounted = false; };
  }, [router]);

  if (loading) return <div className="text-center text-gray-400">Loading...</div>;
  if (!profile) return null;

  return <>{children}</>;
}
