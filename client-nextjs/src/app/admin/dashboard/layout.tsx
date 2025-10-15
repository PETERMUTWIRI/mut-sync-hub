import React from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminProtectedRoute from './ProtectedRoute';

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <AdminProtectedRoute>
          {children}
        </AdminProtectedRoute>
      </main>
    </div>
  );
}
