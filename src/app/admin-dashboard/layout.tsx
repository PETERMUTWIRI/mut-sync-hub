'use client';

import React from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import ProtectedRoute from '@/components/ProtectedRoute'; // Use the same ProtectedRoute

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRole="admin">
      <div className="flex min-h-screen w-full bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800">
        <AdminSidebar />
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}