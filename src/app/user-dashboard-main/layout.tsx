'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { ProfileCompletionBanner } from '@/components/profile-completion-banner';
import { useUser } from '@stackframe/stack';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Toaster } from 'react-hot-toast';

const DashboardSidebar = dynamic(() => import('@/components/user/DashboardSidebar'));

export default function UserDashboardLayout({ children }: { children: React.ReactNode }) {
  const user = useUser({ or: 'redirect' });
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen w-full bg-[#0B1020] text-white font-inter">
        {/* TOP NAVBAR (replaces sidebar) */}
        <DashboardSidebar
          displayName={user.displayName || (user as any).email || 'User'}
          handleLogout={() => { window.location.href = '/handler/sign-out'; }}
        />

        {/* MAIN CONTENT */}
        <main className="flex-1">
          <ProfileCompletionBanner />
          <div className="p-6 max-w-7xl mx-auto">
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400" /></div>}>
              {children}
            </Suspense>
          </div>
        </main>

        <Toaster position="top-right" />
      </div>
    </QueryClientProvider>
  );
}