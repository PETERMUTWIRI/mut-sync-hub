// src/app/admin-dashboard/layout.tsx
'use client';

import React from 'react';
import OwnerSidebar from '@/components/admin/OwnerSidebar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUser } from '@stackframe/stack'; // ✅ Added

const queryClient = new QueryClient();

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const user = useUser({ or: 'redirect' });

  const handleLogout = async () => {
    await user.signOut({
      redirectUrl: window.location.origin + '/', // Redirect to home
    });
  };

  return (
    <ProtectedRoute requiredRole="super_admin">
      <QueryClientProvider client={queryClient}>
        <div className="flex min-h-screen w-full bg-cockpit-bg">
          <OwnerSidebar handleLogout={handleLogout} /> {/* ✅ Added prop */}
          <main className="flex-1 p-8 overflow-y-auto">
            {children}
          </main>
        </div>
      </QueryClientProvider>
    </ProtectedRoute>
  );
}