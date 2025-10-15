'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { HiBell } from 'react-icons/hi';
import { motion } from 'framer-motion';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import dynamic from 'next/dynamic';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { ensureAndFetchUserProfile } from '@/app/api/get-user-role/action';




import { default as UsageProgressBar } from '@/components/user/UsageProgressBar';
import { default as PlanStatus } from '@/components/user/PlanStatus';
import { default as BillingCard } from '@/components/user/cards/BillingCard';
import { default as NotificationsCard } from '@/components/user/cards/NotificationsCard';
import { default as SupportCard } from '@/components/user/cards/SupportCard';
import { default as TeamCard } from '@/components/user/cards/TeamCard';
import { default as AnnouncementsCard } from '@/components/user/cards/AnnouncementsCard';
import { default as AnomalyDetectionCard } from '@/components/user/cards/AnomalyDetectionCard';
import { default as ForecastCard } from '@/components/user/cards/ForecastCard';
import { default as UserInsightsCard } from '@/components/user/cards/UserInsightsCard';
import { default as AIChatButton } from '@/components/user/AIChatButton';
import { default as QueryAnalytics } from '@/components/user/QueryAnalytics';
import { default as ScheduleAnalytics } from '@/components/user/ScheduleAnalytics';

const ResponsiveGridLayout = WidthProvider(Responsive);

// Default layouts for different user types
const defaultLayouts = {
  beginner: [
    { i: 'usage', x: 0, y: 0, w: 2, h: 2 },
    { i: 'plan', x: 2, y: 0, w: 2, h: 2 },
    { i: 'billing', x: 4, y: 0, w: 2, h: 2 },
    { i: 'notifications', x: 0, y: 2, w: 2, h: 2 },
    { i: 'query', x: 2, y: 2, w: 4, h: 4 },
  ],
  power: [
    { i: 'usage', x: 0, y: 0, w: 2, h: 2 },
    { i: 'query', x: 2, y: 0, w: 4, h: 4 },
    { i: 'schedule', x: 0, y: 4, w: 4, h: 4 },
    { i: 'notifications', x: 4, y: 0, w: 2, h: 2 },
    { i: 'billing', x: 4, y: 2, w: 2, h: 2 },
    // Temporarily disable trends to isolate issue
    // { i: 'trends', x: 0, y: 6, w: 2, h: 2 },
    { i: 'anomaly', x: 2, y: 6, w: 2, h: 2 },
    { i: 'forecast', x: 4, y: 6, w: 2, h: 2 },
    { i: 'insights', x: 0, y: 8, w: 2, h: 2 },
  ],
};

// Validate layout to ensure it contains valid widget keys
const validateLayout = (layout: any, mode: 'beginner' | 'power'): any => {
  const validKeys = defaultLayouts[mode].map(item => item.i);
  if (!Array.isArray(layout)) return defaultLayouts[mode];
  return layout.filter(item => validKeys.includes(item.i));
};

export default function UserDashboard() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPlans, setShowPlans] = useState(false);
  const [layoutMode, setLayoutMode] = useState<'beginner' | 'power'>('beginner');
  const [layouts, setLayouts] = useState(defaultLayouts.beginner);
  const queryClient = useQueryClient();

  const plans = [
    { title: 'Starter', packages: ['Basic Analytics', 'Email Support'], price: 500 },
    { title: 'Pro', packages: ['Advanced Analytics', 'Priority Support', 'Team Access'], price: 2000 },
    { title: 'Enterprise', packages: ['Custom Integrations', 'Dedicated Manager', 'Unlimited Users'], price: 10000 },
  ];

  // Fetch user profile with layout
  const { data: userProfile, error: profileError } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const cachedSession = localStorage.getItem('userSession');
      if (cachedSession) {
        const parsed = JSON.parse(cachedSession);
        if (parsed.expiresAt && parsed.expiresAt > Date.now()) {
          console.log('UserDashboard: Loaded user profile from cache', parsed);
          return parsed;
        }
        localStorage.removeItem('userSession');
      }
      console.log('UserDashboard: Fetching user profile');
      const profile = await ensureAndFetchUserProfile();
      localStorage.setItem('userSession', JSON.stringify({
        ...profile,
        expiresAt: Date.now() + 60 * 60 * 1000,
      }));
      return profile;
    },
    retry: false,
  });

  const saveLayoutMutation = useMutation({
    mutationFn: async (newLayout: any) => {
      console.log('UserDashboard: Saving layout for orgId:', orgId, 'layout:', newLayout);
      const res = await fetch('/api/user/layouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgId, layout: newLayout, mode: layoutMode }),
      });
      if (!res.ok) throw new Error('Failed to save layout');
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['userProfile'] }),
  });

  useEffect(() => {
    if (profileError) {
      console.error('UserDashboard: Profile fetch error', profileError);
      setError('Failed to load user profile');
      setLoading(false);
    } else if (userProfile) {
      console.log('UserDashboard: Profile loaded', userProfile);
      setRole(userProfile.role?.toLowerCase() || 'user');
      setOrgId(userProfile.orgId);
      setLayoutMode(userProfile.isTechnical ? 'power' : 'beginner');
      const validatedLayout = validateLayout(userProfile.dashboardLayout, userProfile.isTechnical ? 'power' : 'beginner');
      setLayouts(validatedLayout || defaultLayouts[userProfile.isTechnical ? 'power' : 'beginner']);
      setLoading(false);
    }
  }, [userProfile, profileError]);

  useEffect(() => {
    if (!loading && role && role !== 'user' && role !== 'admin') {
      console.log('UserDashboard: Unauthorized role, redirecting', role);
      router.push('/unauthorized');
    }
  }, [role, loading, router]);

  const handleLayoutChange = (newLayout: any) => {
    const validatedLayout = validateLayout(newLayout, layoutMode);
    setLayouts(validatedLayout);
    saveLayoutMutation.mutate(validatedLayout);
  };

  const handleUpgradeClick = () => setShowPlans(true);
  const handleClosePlans = () => setShowPlans(false);
  const handlePlanSelect = (plan: { title: string; packages: string[]; price: number }) => {
    router.push(`/payment?plan=${plan.title}`);
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-[#1E2A44] flex items-center justify-center w-full"
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2E7D7D] mx-auto"></div>
          <p className="mt-4 text-gray-300 font-inter text-lg">Loading Dashboard...</p>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-[#1E2A44] flex items-center justify-center w-full"
      >
        <div className="text-center bg-[#2E7D7D]/10 rounded-xl p-8 border border-[#2E7D7D]/30">
          <p className="text-red-400 font-inter text-lg">{error}</p>
          <Button
            onClick={() => router.push('/')}
            className="mt-4 bg-[#2E7D7D] text-white px-6 py-2 rounded-lg hover:bg-[#2E7D7D]/80"
          >
            Return to Home
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="bg-[#1E2A44] text-gray-100 font-inter w-full min-h-screen">
      <header className="flex items-center justify-between px-8 py-4 bg-[#1E2A44] border-b border-[#2E7D7D]/30 shadow-lg w-full">
        <div className="flex items-center gap-4">
          <Input
            type="text"
            placeholder="Ask AI or search..."
            className="bg-[#2E7D7D]/20 border-[#2E7D7D] text-gray-100 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D7D] w-64"
          />
          <Select value={layoutMode} onValueChange={(value: 'beginner' | 'power') => setLayoutMode(value)}>
            <SelectTrigger className="bg-[#2E7D7D]/20 border-[#2E7D7D] text-gray-100">
              <SelectValue placeholder="Layout Mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="power">Power User</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-6">
          <HiBell className="text-[#2E7D7D] text-xl animate-pulse" />
          <div className="w-8 h-8 rounded-full bg-[#2E7D7D] flex items-center justify-center text-white font-bold">
            {userProfile?.name?.[0] || 'U'}
          </div>
        </div>
      </header>

      {showPlans && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60"
        >
          <div className="bg-[#2E7D7D]/10 rounded-2xl shadow-2xl p-8 w-full max-w-md mx-auto relative border border-[#2E7D7D]/30">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-200 text-2xl" onClick={handleClosePlans}>
              &times;
            </button>
            <h2 className="text-3xl font-extrabold text-[#2E7D7D] mb-6 text-center">Choose Your Plan</h2>
            <div className="flex flex-col gap-6">
              {plans.map((plan) => (
                <div
                  key={plan.title}
                  className="border border-[#2E7D7D]/30 rounded-xl p-6 flex flex-col gap-2 hover:shadow-xl hover:border-[#2E7D7D] transition-all cursor-pointer"
                  onClick={() => handlePlanSelect(plan)}
                >
                  <div className="text-2xl font-bold text-gray-100 mb-2">{plan.title}</div>
                  <ul className="mb-2">
                    {plan.packages.map((pkg) => (
                      <li key={pkg} className="text-gray-300 text-base">{pkg}</li>
                    ))}
                  </ul>
                  <div className="text-xl font-extrabold text-[#2E7D7D]">KES {plan.price.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      <main className="p-6 max-w-7xl mx-auto w-full">
        <ResponsiveGridLayout
          className="layout"
          layouts={{ lg: layouts }}
          breakpoints={{ lg: 1200, md: 996, sm: 768 }}
          cols={{ lg: 12, md: 10, sm: 6 }}
          rowHeight={100}
          onLayoutChange={handleLayoutChange}
          isDraggable
          isResizable
        >
          <div key="usage" className="bg-[#2E7D7D]/10 rounded-xl shadow-lg p-6 border border-[#2E7D7D]/30">
            <UsageProgressBar />
          </div>
          <div key="plan" className="bg-[#2E7D7D]/10 rounded-xl shadow-lg p-6 border border-[#2E7D7D]/30">
            <PlanStatus />
          </div>
          <div key="billing" className="bg-[#2E7D7D]/10 rounded-xl shadow-lg p-6 border border-[#2E7D7D]/30">
            <BillingCard />
          </div>
          <div key="notifications" className="bg-[#2E7D7D]/10 rounded-xl shadow-lg p-6 border border-[#2E7D7D]/30">
            <NotificationsCard />
          </div>
          <div key="query" className="bg-[#2E7D7D]/10 rounded-xl shadow-lg p-6 border border-[#2E7D7D]/30">
            <QueryAnalytics />
          </div>
          <div key="schedule" className="bg-[#2E7D7D]/10 rounded-xl shadow-lg p-6 border border-[#2E7D7D]/30">
            <ScheduleAnalytics />
          </div>
          {/* Temporarily commented to isolate issue */}
          <div key="trends" className="bg-[#2E7D7D]/10 rounded-xl shadow-lg p-6 border border-[#2E7D7D]/30">
            <UsageProgressBar/>
          </div>
          <div key="anomaly" className="bg-[#2E7D7D]/10 rounded-xl shadow-lg p-6 border border-[#2E7D7D]/30">
            <AnomalyDetectionCard />
          </div>
          <div key="forecast" className="bg-[#2E7D7D]/10 rounded-xl shadow-lg p-6 border border-[#2E7D7D]/30">
            <ForecastCard />
          </div>
          <div key="insights" className="bg-[#2E7D7D]/10 rounded-xl shadow-lg p-6 border border-[#2E7D7D]/30">
            <UserInsightsCard />
          </div>
        </ResponsiveGridLayout>
      </main>
      <AIChatButton />
    </div>
  );
}