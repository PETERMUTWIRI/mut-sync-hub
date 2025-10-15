'use client';
// components/ProtectedRoute.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useNeonUser } from '@/context/useNeonUser';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useNeonUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) return <div className="text-center text-gray-400">Loading...</div>;
  if (!isAuthenticated) return null;

  return <>{children}</>;
}
