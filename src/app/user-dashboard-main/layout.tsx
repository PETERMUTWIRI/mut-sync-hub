// src/app/user-dashboard-main/layout.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { ProfileCompletionBanner } from '@/components/profile-completion-banner';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Toaster } from 'react-hot-toast';
import { useOrgProfile } from '@/hooks/useOrgProfile';
import { useEnterpriseLogout } from '@/lib/auth/use-enterprise-logout';

const DashboardSidebar = dynamic(() => 
  import('@/components/user/DashboardSidebar').then((mod) => mod.default)
);

export default function UserDashboardLayout({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const { data: orgProfile, isLoading } = useOrgProfile();
  const enterpriseLogout = useEnterpriseLogout();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400" />
    </div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen w-full bg-[#0B1020] text-white font-inter">
        <DashboardSidebar
          displayName={orgProfile?.firstName?.[0]}
          handleLogout={enterpriseLogout}
        />
        <main className="flex-1">
          <ProfileCompletionBanner />
          <div className="p-6 max-w-7xl mx-auto">
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400" />
            </div>}>
              {children}
            </Suspense>
          </div>
        </main>
        <Toaster position="top-right" />
      </div>
    </QueryClientProvider>
  );
}