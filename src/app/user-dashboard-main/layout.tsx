'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { ProfileCompletionBanner } from '@/components/profile-completion-banner';
import { useUser } from '@stackframe/stack';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Toaster } from 'react-hot-toast';
import { AiOutlineMenu } from 'react-icons/ai';

const DashboardSidebar = dynamic(() => import('@/components/user/DashboardSidebar'));

export default function UserDashboardLayout({ children }: { children: React.ReactNode }) {
  const user = useUser({ or: 'redirect' });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {/* full-height flex container */}
      <div className="flex min-h-screen w-full bg-[#1E2A44] text-white font-inter">
        {/* sidebar: fixed width, full height, sticky */}
        <aside
          className={`shrink-0 bg-[#1E1E2F] text-gray-300 transition-all duration-300 ${
            sidebarOpen ? 'w-64' : 'w-16'
          }`}
        >
          <DashboardSidebar
            isSidebarOpen={sidebarOpen}
            displayName={user.displayName || (user as any).email || 'User'}
            handleLogout={() => { window.location.href = '/handler/sign-out'; }}
          />
        </aside>

        {/* main: fills remaining space, column flex */}
        <main className="flex-1 flex flex-col">
          <ProfileCompletionBanner />

          <header className="flex items-center justify-between p-4 border-b border-[#2E7D7D]/30">
            <button onClick={() => setSidebarOpen((s) => !s)} className="lg:hidden text-teal-400 hover:text-white">
              <AiOutlineMenu className="w-6 h-6" />
            </button>
            <div className="flex-1" />
            <span className="text-sm text-gray-300">Hello, {user.displayName || 'User'}</span>
          </header>

          {/* content: grows to push footer down, no artificial max-width */}
          <div className="flex-1 p-8">
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2E7D7D]"></div></div>}>
              {children}
            </Suspense>
          </div>
        </main>

        <Toaster position="top-right" />
      </div>
    </QueryClientProvider>
  );
}