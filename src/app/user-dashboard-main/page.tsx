// import DashboardClient from './DashboardClient';

// export default function Page() {
//   return <DashboardClient />;
// }

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  HiBell,
  HiChip,
  HiCurrencyDollar,
  HiCreditCard,
  HiExclamation,
  HiTrendingUp,
  HiLightBulb,
  HiLockClosed,
} from 'react-icons/hi';
import { motion } from 'framer-motion';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import dynamic from 'next/dynamic';
// import 'react-resizable/css/styles.css';
import { useOrgProfile } from '@/hooks/useOrgProfile';
import { toast } from 'react-hot-toast';

// const ResponsiveGridLayout = WidthProvider(Responsive);

/*  –––––––––––––––  LAZY CARDS  –––––––––––––––  */
const UsageProgressBar      = dynamic(() => import('@/components/user/UsageProgressBar').then((m) => m.default), { ssr: false });
const PlanStatus            = dynamic(() => import('@/components/user/PlanStatus').then((m) => m.default), { ssr: false });
const BillingCard           = dynamic(() => import('@/components/user/cards/BillingCard').then((m) => m.default), { ssr: false });
const NotificationsCard     = dynamic(() => import('@/components/user/cards/NotificationsCard').then((m) => m.default), { ssr: false });
const SupportCard           = dynamic(() => import('@/components/user/cards/SupportCard').then((m) => m.default), { ssr: false });
const TeamCard              = dynamic(() => import('@/components/user/cards/TeamCard').then((m) => m.default), { ssr: false });
const AnnouncementsCard     = dynamic(() => import('@/components/user/cards/AnnouncementsCard').then((m) => m.default), { ssr: false });
const AnomalyDetectionCard  = dynamic(() => import('@/components/user/cards/AnomalyDetectionCard').then((m) => m.default), { ssr: false });
const ForecastCard          = dynamic(() => import('@/components/user/cards/ForecastCard').then((m) => m.default), { ssr: false });
const UserInsightsCard      = dynamic(() => import('@/components/user/cards/UserInsightsCard').then((m) => m.default), { ssr: false });
const AIChatButton          = dynamic(() => import('@/components/user/AIChatButton').then((m) => m.default), { ssr: false });
const QueryAnalytics        = dynamic(() => import('@/components/user/QueryAnalytics').then((m) => m.default), { ssr: false });
const ScheduleAnalytics     = dynamic(() => import('@/components/user/ScheduleAnalytics').then((m) => m.default), { ssr: false });

type PlanTier = 'free' | 'pro' | 'enterprise';

/*  –––––––––––––––  DEFAULT LAYOUTS  –––––––––––––––  */
const defaultLayouts = {
  beginner: [
    { i: 'usage', x: 0, y: 0, w: 2, h: 2 },
    { i: 'plan',  x: 2, y: 0, w: 2, h: 2 },
    { i: 'billing', x: 4, y: 0, w: 2, h: 2 },
    { i: 'notifications', x: 0, y: 2, w: 2, h: 2 },
    { i: 'query', x: 2, y: 2, w: 4, h: 4 },
  ],
  power: [
    { i: 'usage', x: 0, y: 0, w: 2, h: 2 },
    { i: 'plan',  x: 2, y: 0, w: 2, h: 2 },
    { i: 'billing', x: 4, y: 0, w: 2, h: 2 },
    { i: 'query', x: 0, y: 2, w: 4, h: 4 },
    { i: 'schedule', x: 4, y: 2, w: 4, h: 4 },
    { i: 'notifications', x: 8, y: 0, w: 2, h: 2 },
    { i: 'anomaly', x: 0, y: 6, w: 2, h: 2 },
    { i: 'forecast', x: 2, y: 6, w: 2, h: 2 },
    { i: 'insights', x: 4, y: 6, w: 2, h: 2 },
  ],
};

const validateLayout = (layout: any, mode: 'beginner' | 'power'): any => {
  const validKeys = defaultLayouts[mode].map((item) => item.i);
  if (!Array.isArray(layout)) return defaultLayouts[mode];
  return layout.filter((item) => validKeys.includes(item.i));
};

/*  –––––––––––––––  AVAILABLE CARDS  –––––––––––––––  */
const DOCK_CARDS: {
  key: string;
  name: string;
  plan: PlanTier;
  icon: React.ReactNode; 
}[] = [
  { key: 'notifications', name: 'Notifications', plan: 'free', icon: <HiBell /> },
  { key: 'query', name: 'Query Analytics', plan: 'free', icon: <HiChip /> },
  { key: 'schedule', name: 'Schedule Analytics', plan: 'free', icon: <HiChip /> },
  { key: 'support', name: 'Support', plan: 'free', icon: <HiBell /> },
  { key: 'team', name: 'Team', plan: 'free', icon: <HiBell /> },
  { key: 'announcements', name: 'Announcements', plan: 'free', icon: <HiBell /> },
  { key: 'anomaly', name: 'Anomaly', plan: 'pro', icon: <HiExclamation /> },
  { key: 'forecast', name: 'Forecast', plan: 'pro', icon: <HiTrendingUp /> },
  { key: 'insights', name: 'Insights', plan: 'enterprise', icon: <HiLightBulb /> },
];

const STARTER_KEYS = ['usage', 'plan', 'billing'];

export default function UserDashboard() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: orgProfile, error: profileError, isLoading } = useOrgProfile();

  const [activeKeys, setActiveKeys] = useState<string[]>(STARTER_KEYS);
  const [layoutMode, setLayoutMode] = useState<'beginner' | 'power'>('beginner');
  const [showPlans, setShowPlans] = useState(false);

  /*  map profile → old variables  */
  useEffect(() => {
    if (profileError) {
      console.error('UserDashboard: Profile fetch error', profileError);
      return;
    }
    if (!orgProfile) return;
    setLayoutMode(orgProfile.isTechnical ? 'power' : 'beginner');
    const validated = validateLayout(orgProfile.dashboardLayout as any, orgProfile.isTechnical ? 'power' : 'beginner');
    setActiveKeys((keys) => [...new Set([...keys, ...validated.map((i: any) => i.i)])]);
  }, [orgProfile, profileError]);

  /*  auth guard  */
  useEffect(() => {
    const role = orgProfile?.role?.toLowerCase();
    if (!isLoading && role && role !== 'user' && role !== 'admin') router.push('/unauthorized');
  }, [orgProfile, isLoading, router]);

  /*  layout save stub  */
  const saveLayoutMutation = useMutation({
    mutationFn: async (newLayout: any) => {
      console.log('Saving layout', newLayout);
      return Promise.resolve();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['org-profile'] }),
  });

  const handleLayoutChange = (newLayout: any) => {
   if (!Array.isArray(newLayout)) return;          // ← guard 1
   const validated = validateLayout(newLayout, layoutMode);
   if (!Array.isArray(validated)) return;         // ← guard 2
   saveLayoutMutation.mutate(validated);
  };



  const handlePlanSelect = (plan: { title: string; packages: string[]; price: number }) => {
    router.push(`/payment?plan=${plan.title}`);
  };

  /*  skeleton  */
  if (isLoading)
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-[#1E2A44] flex items-center justify-center w-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2E7D7D] mx-auto"></div>
          <p className="mt-4 text-gray-300 font-inter text-lg">Loading Dashboard...</p>
        </div>
      </motion.div>
    );

  if (profileError)
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-[#1E2A44] flex items-center justify-center w-full">
        <div className="text-center bg-[#2E7D7D]/10 rounded-xl p-8 border border-[#2E7D7D]/30">
          <p className="text-red-400 font-inter text-lg">Failed to load profile</p>
          <Button onClick={() => location.reload()} className="mt-4 bg-[#2E7D7D] text-white px-6 py-2 rounded-lg hover:bg-[#2E7D7D]/80">
            Retry
          </Button>
        </div>
      </motion.div>
    );

    /*  ----  NEW RENDER  ----  */
  const cardDefs = [
    /* ---------- Tier-0  must-see  ---------- */
    { key: 'usage', plan: 'free' },
    { key: 'plan', plan: 'free' },
    { key: 'billing', plan: 'free' },
    /* ---------- Tier-1  analytics  ---------- */
    { key: 'query', plan: 'free' },
    { key: 'schedule', plan: 'free' },
    { key: 'notifications', plan: 'free' },
    /* ---------- Tier-2  intelligence  ---------- */
    { key: 'anomaly', plan: 'pro' },
    { key: 'forecast', plan: 'pro' },
    { key: 'insights', plan: 'enterprise' },
  ] as const;

  const planOrder: Record<PlanTier, number> = { free: 0, pro: 1, enterprise: 2 };
  const userPlanLevel = planOrder[orgProfile?.plan?.title?.toLowerCase() as PlanTier] ?? 0;

  return (
    <div className="min-h-screen bg-[#0B1020] text-gray-100 font-inter">
      {/* -------------- HEADER -------------- */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-[#0B1020]/80 backdrop-blur-xl border-b border-white/10"
      >
        <div className="flex items-center gap-4">
          <Input
            type="text"
            placeholder="Ask AI or search…"
            className="w-64 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
          <Select value={layoutMode} onValueChange={(v) => setLayoutMode(v as any)}>
            <SelectTrigger className="bg-white/5 border border-white/10 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="power">Power User</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-4">
          <HiBell className="w-5 h-5 text-gray-400 hover:text-white transition" />
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center font-bold text-sm">
            {orgProfile?.firstName?.[0] || orgProfile?.email?.[0] || 'U'}
          </div>
        </div>
      </motion.header>

      {/* -------------- MAIN GRID -------------- */}
      <main className="p-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cardDefs.map(({ key, plan }, idx) => {
          const locked = planOrder[plan] > userPlanLevel;

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="group relative bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md
                         hover:border-cyan-400/50 transition-all duration-300 overflow-hidden"
            >
              {/* animated border glow */}
              <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

              {/* card content */}
              <div className="relative">
                {key === 'usage' && <UsageProgressBar />}
                {key === 'plan' && <PlanStatus />}
                {key === 'billing' && <BillingCard />}
                {key === 'notifications' && <NotificationsCard />}
                {key === 'query' && <QueryAnalytics />}
                {key === 'schedule' && <ScheduleAnalytics />}
                {key === 'anomaly' && <AnomalyDetectionCard />}
                {key === 'forecast' && <ForecastCard />}
                {key === 'insights' && <UserInsightsCard />}
              </div>

              {/* lock overlay */}
              {locked && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-2xl">
                  <div className="text-center">
                    <div className="text-xs text-gray-300 mb-1">Plan Locked</div>
                    <div className="text-xs text-gray-400 mb-3">{plan} required</div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs border-cyan-400 text-cyan-400 hover:bg-cyan-400/10"
                      onClick={() => router.push('/payment')}
                    >
                      Upgrade →
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </main>

      {/* -------------- FLOATING AI CHAT -------------- */}
      <AIChatButton />

      {/* -------------- GLOBAL STYLES -------------- */}
      <style jsx global>{`
        body {
          background: #0b1020;
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(16px);
        }
      `}</style>
    </div>
  );
}