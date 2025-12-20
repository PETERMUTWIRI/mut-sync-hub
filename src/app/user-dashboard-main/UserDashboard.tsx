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
import { Responsive, WidthProvider } from 'react-grid-layout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import dynamic from 'next/dynamic';
import 'react-grid-layout/css/styles.css';
// import 'react-resizable/css/styles.css';
import { useOrgProfile } from '@/hooks/useOrgProfile';
import { toast } from 'react-hot-toast';

const ResponsiveGridLayout = WidthProvider(Responsive);

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

  const planOrder: Record<PlanTier, number> = { free: 0, pro: 1, enterprise: 2 };
  const userPlanTier: PlanTier = (orgProfile?.plan?.title?.toLowerCase() as PlanTier) || 'free';

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

  /*  ----  RENDER  ----  */
  return (
    <div className="bg-[#1E2A44] text-gray-100 font-inter w-full min-h-screen">
      <header className="flex items-center justify-between px-8 py-4 bg-[#1E2A44] border-b border-[#2E7D7D]/30 shadow-lg w-full">
        <div className="flex items-center gap-4">
          <Input type="text" placeholder="Ask AI or search..." className="bg-[#2E7D7D]/20 border-[#2E7D7D] text-gray-100 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D7D] w-64" />
          <Select value={layoutMode} onValueChange={(value) => setLayoutMode(value as any)}>
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
          <HiBell size={24} className="text-gray-300 hover:text-white" />
          <div className="w-8 h-8 rounded-full bg-[#2E7D7D] flex items-center justify-center text-white font-bold">
            {orgProfile?.firstName?.[0] || orgProfile?.email?.[0] || 'U'}
          </div>
        </div>
      </header>

      {showPlans && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-[#2E7D7D]/10 rounded-2xl shadow-2xl p-8 w-full max-w-md mx-auto relative border border-[#2E7D7D]/30">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-200 text-2xl" onClick={() => setShowPlans(false)}>
              &times;
            </button>
            <h2 className="text-3xl font-extrabold text-[#2E7D7D] mb-6 text-center">Choose Your Plan</h2>
            <div className="flex flex-col gap-6">
              {[
                { title: 'Starter', packages: ['Basic Analytics', 'Email Support'], price: 500 },
                { title: 'Pro', packages: ['Advanced Analytics', 'Priority Support', 'Team Access'], price: 2000 },
                { title: 'Enterprise', packages: ['Custom Integrations', 'Dedicated Manager', 'Unlimited Users'], price: 10000 },
              ].map((plan) => (
                <div
                  key={plan.title}
                  className="border border-[#2E7D7D]/30 rounded-xl p-6 flex flex-col gap-2 hover:shadow-xl hover:border-[#2E7D7D] transition-all cursor-pointer"
                  onClick={() => handlePlanSelect(plan)}
                >
                  <div className="text-2xl font-bold text-gray-100 mb-2">{plan.title}</div>
                  <ul className="mb-2">
                    {plan.packages.map((pkg) => (
                      <li key={pkg} className="text-gray-300 text-base">
                        {pkg}
                      </li>
                    ))}
                  </ul>
                  <div className="text-xl font-extrabold text-[#2E7D7D]">KES {plan.price.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      <main className="p-6 max-w-7xl mx-auto w-full grid grid-cols-12 gap-6">
        {/*  ----  DROP ZONE (grid)  ----  */}
        <section
          id="drop-zone"
          className="col-span-12 min-h-[600px] rounded-xl border-2 border-dashed border-[#2E7D7D]/40 bg-[#1E2A44]/30 relative transition"
          onDragEnter={() => document.getElementById('drop-zone')?.classList.add('drop-active')}
          onDragLeave={() => document.getElementById('drop-zone')?.classList.remove('drop-active')}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            document.getElementById('drop-zone')?.classList.remove('drop-active');
            e.preventDefault();
            const key = e.dataTransfer.getData('cardKey');
            const card = DOCK_CARDS.find((c) => c.key === key);
            if (!card) return;
            if (!activeKeys.includes(key)) setActiveKeys((keys) => [...keys, key]);
          }}
        >
          {activeKeys.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">Drag cards here to build your dashboard</div>
          )}

          <ResponsiveGridLayout
            className="layout"
            layouts={{ lg: activeKeys.length? activeKeys.map((k, i) => ({ i: k, x: (i * 2) % 12, y: Math.floor(i / 6) * 2, w: 2, h: 2 })): [] }}
            breakpoints={{ lg: 1200, md: 996, sm: 768 }}
            cols={{ lg: 12, md: 10, sm: 6 }}
            rowHeight={100}
            onLayoutChange={handleLayoutChange}
            isDraggable
            isResizable
          >
            {activeKeys.map((key) => {
              const card = DOCK_CARDS.find((c) => c.key === key);
              if (!card) return null;
              const locked = planOrder[card.plan as PlanTier] > (orgProfile?.plan?.title ? planOrder[orgProfile.plan.title.toLowerCase() as PlanTier] : 0);

              return (
                <div key={key} className="glass-card relative">
                  {key === 'usage' && <UsageProgressBar />}
                  {key === 'plan' && <PlanStatus />}
                  {key === 'billing' && <BillingCard />}
                  {key === 'notifications' && <NotificationsCard />}
                  {key === 'query' && <QueryAnalytics />}
                  {key === 'schedule' && <ScheduleAnalytics />}
                  {key === 'anomaly' && <AnomalyDetectionCard />}
                  {key === 'forecast' && <ForecastCard />}
                  {key === 'insights' && <UserInsightsCard />}

                  {locked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-xl">
                      <div className="text-center">
                        <div className="text-xs font-inter text-gray-300 mb-1">Plan Locked</div>
                        <div className="text-xs font-inter text-gray-400 mb-2">{card.plan} required</div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs border-[#2E7D7D] text-[#2E7D7D] hover:bg-[#2E7D7D]/20"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push('/payment');
                          }}
                        >
                          Upgrade →
                        </Button>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => setActiveKeys((keys) => keys.filter((k) => k !== key))}
                    className="absolute top-1 right-1 text-gray-400 hover:text-white text-xs"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </ResponsiveGridLayout>
        </section>

        {/*  ----  DOCK (now under the grid)  ----  */}
        <aside className="col-span-12 mt-6">
          <h3 className="text-sm font-semibold text-gray-300 mb-4">Available Cards</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {DOCK_CARDS.map((card) => {
              const locked = planOrder[card.plan as PlanTier] > (orgProfile?.plan?.title ? planOrder[orgProfile.plan.title.toLowerCase() as PlanTier] : 0);
              return (
                <div
                  key={card.key}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('cardKey', card.key);
                    /*  normal-size ghost  */
                    const ghost = e.currentTarget.cloneNode(true) as HTMLElement;
                    ghost.style.transform = 'scale(1)';
                    ghost.style.opacity = '0.8';
                    document.body.appendChild(ghost);
                    e.dataTransfer.setDragImage(ghost, 0, 0);
                    setTimeout(() => document.body.removeChild(ghost), 0);
                  }}
                  className={`flex items-center gap-2 p-2 rounded-lg border transition
                    ${locked ? 'border-red-500/30 bg-red-500/10 opacity-60' : 'border-[#2E7D7D]/40 bg-[#2E7D7D]/10 hover:bg-[#2E7D7D]/20 cursor-move'}`}
                >
                  <div className="text-sm">{card.icon}</div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{card.name}</div>
                    <div className="text-xs text-gray-400">{card.plan}</div>
                  </div>
                  {locked && <HiLockClosed className="text-red-400 text-xs" />}
                </div>
              );
            })}
          </div>
        </aside>
      </main>

      <AIChatButton />

    </div>
  );
}