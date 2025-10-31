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
      <div className="flex min-h-screen w-full bg-[#1E2A44] text-white font-inter">
        {/* Sidebar: self-managed collapse */}
        <aside className="shrink-0 flex flex-col h-screen bg-[#1E1E2F] text-gray-300">
          <DashboardSidebar
            displayName={user.displayName || (user as any).email || 'User'}
            handleLogout={() => { window.location.href = '/handler/sign-out'; }}
          />
        </aside>

        {/* Main content area */}
        <main className="flex-1 flex flex-col">
          <ProfileCompletionBanner />

          <div className="flex-1 p-8">
            <Suspense
              fallback={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2E7D7D]" />
                </div>
              }
            >
              {children}
            </Suspense>
          </div>
        </main>

        <Toaster position="top-right" />
      </div>
    </QueryClientProvider>
  );
}