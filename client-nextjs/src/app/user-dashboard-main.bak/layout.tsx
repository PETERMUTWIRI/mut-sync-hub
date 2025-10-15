'use client';

import { useUser } from '@stackframe/stack';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';

// Dynamic import for DashboardSidebar
const DashboardSidebar = dynamic(() => import('@/components/user/DashboardSidebar'), { ssr: false });

export default function UserDashboardLayout({ children }: { children: React.ReactNode }) {
  const user = useUser({ or: 'redirect' });
  const isSidebarOpen = true; // Hardcode for now to avoid useState; reintroduce if needed

  return (
    <div className="flex min-h-screen w-full bg-[#1E2A44] text-white font-inter">
      <DashboardSidebar className="flex-shrink-0" onToggle={() => {}} />
      <motion.main
        initial={{ marginLeft: '260px' }} // Match hardcoded isSidebarOpen
        animate={{ marginLeft: '260px' }}
        transition={{ duration: 0.3 }}
        className="flex-1 p-8 w-full max-w-7xl mx-auto"
      >
        <Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2E7D7D] mx-auto"></div>
              <p className="mt-4 text-gray-300 font-inter text-lg">Loading...</p>
            </div>
          }
        >
          {children}
        </Suspense>
      </motion.main>
      <Toaster position="top-right" />
    </div>
  );
}