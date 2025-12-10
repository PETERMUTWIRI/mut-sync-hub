// src/app/admin-dashboard/layout.tsx
'use client';

import React from 'react';
import OwnerSidebar from '@/components/admin/OwnerSidebar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRole="admin">
      <QueryClientProvider client={queryClient}>
        <div className="flex min-h-screen w-full bg-cockpit-bg">
          <OwnerSidebar />
          <main className="flex-1 p-8 overflow-y-auto">
            {children}
          </main>
        </div>
      </QueryClientProvider>
    </ProtectedRoute>
  );
}