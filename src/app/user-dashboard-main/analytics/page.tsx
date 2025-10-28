'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useUser } from '@stackframe/stack';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { format, subDays } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, BarChart3, PieChart as PieChartIcon, Calendar, Bell, Download, Clock, Plus, Sparkles, Zap, AlertTriangle,
  Filter, ChevronRight, ShoppingCart, Store, HeartPulse, Factory, Bot, History, Play, X
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ProgressCircle } from '@/components/ui/progress-circle';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { LiveIndicator } from '@/components/data-source/live-indicator';
import { useDrillDown } from '@/lib/useDrillDown';
import { useOrgProfile } from '@/hooks/useOrgProfile';
import { enforceAnalyticsLimit } from '@/lib/billing';
import { buildReportPDF } from "@/lib/buildReportPDF";
import { PDFDocument, rgb } from "pdf-lib";
import { Loader2 } from 'lucide-react';

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */
type Industry = 'supermarket' | 'retail' | 'healthcare' | 'manufacturing';
type AnalyticType = 'eda' | 'forecast' | 'basket' | 'market-dynamics' | 'supply-chain' | 'customer-insights' | 'operational-efficiency' | 'risk-assessment' | 'sustainability';

/* ------------------------------------------------------------------ */
/* Service layer – talks to Python container                          */
/* ------------------------------------------------------------------ */
const analyticsAPI = {
  live: (orgId: string) => Promise.resolve({}),
  trend: (orgId: string) => Promise.resolve({}),
  run: (orgId: string, analytic: AnalyticType, body: any) =>
    fetch('/api/analytics/run', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orgId, analytic, ...body }) }).then(r => r.json()),
  schedules: (orgId: string) => fetch(`/api/analytics/schedules?orgId=${orgId}`).then(r => r.json()),
  history: (orgId: string, limit = 50) => fetch(`/api/analytics/history?orgId=${orgId}&limit=${limit}`).then(r => r.json()),
  ai: (orgId: string, question: string, report: any) => fetch('/api/analytics/ai', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orgId, question, report }) }).then(r => r.json()),
  latest: (orgId: string) => fetch(`/analytics/report/latest?orgId=${orgId}`, { headers: { "x-api-key": process.env.NEXT_PUBLIC_ANALYTICS_KEY ?? "dev-analytics-key-123" } }).then(r => r.ok ? r.json() : null),
};
/* ------------------------------------------------------------------ */
/* Hooks                                                              */
/* ------------------------------------------------------------------ */
function useLiveData(orgId: string) {
  return useQuery({ queryKey: ['analytics-live', orgId], queryFn: () => analyticsAPI.live(orgId), refetchInterval: 5000, enabled: !!orgId });
}
function useTrendData(orgId: string) {
  return useQuery({ queryKey: ['analytics-trend', orgId], queryFn: () => analyticsAPI.trend(orgId), enabled: !!orgId });
}
function useSchedules(orgId: string) {
  return useQuery({ queryKey: ['analytics-schedules', orgId], queryFn: () => analyticsAPI.schedules(orgId), enabled: !!orgId });
}
function useHistory(orgId: string) {
  return useQuery({ queryKey: ['analytics-history', orgId], queryFn: () => analyticsAPI.history(orgId), enabled: !!orgId });
}
function useLatestReport(orgId: string) {
  return useQuery({ queryKey: ['analytics-latest', orgId], queryFn: () => analyticsAPI.latest(orgId), enabled: !!orgId });
}


/* ------------------------------------------------------------------ */
/* Main Page – SUPERMARKET FIRST                                      */
/* ------------------------------------------------------------------ */
export default function AnalyticsPage() {
  const { t } = useTranslation();
  const user = useUser({ or: 'redirect' });
  const qc = useQueryClient();
  const { data: ctx } = useOrgProfile();
  const orgId = ctx?.orgId ?? '';

  // Industry picker – supermarket default
  const [industry, setIndustry] = useState<Industry>('supermarket');
  const [activeAnalytic, setActiveAnalytic] = useState<AnalyticType>('eda');

  // Data states
  const { data: live } = useLiveData(orgId);
  const { data: trend } = useTrendData(orgId);
  const { data: schedules } = useSchedules(orgId);
  const { data: history } = useHistory(orgId);
  const { data: latest } = useQuery({
    queryKey: ['analytics-latest', orgId],
    queryFn: () => analyticsAPI.latest(orgId),
    enabled: !!orgId,
  });

  // Drill-down state
  const drill = useDrillDown((trend as any[]) ?? []);

  // AI chat state
  const [question, setQuestion] = useState('');
  const [aiReply, setAiReply] = useState<{ text: string; chart?: any } | null>(null);

  // Schedule modal
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [cron, setCron] = useState('0 8 * * MON');

  // Run analytic mutation
  const runMut = useMutation({
     mutationFn: (analytic: AnalyticType) => analyticsAPI.run(orgId, analytic, {}),
     onSuccess: (data, variables) => {
        qc.setQueryData(['analytics-results', orgId, variables], data);

       
        qc.setQueryData(['analytics-results', orgId, 'supermarket_kpis'], data.supermarket_kpis);

        toast.success(`${variables} ready`);
        qc.invalidateQueries({ queryKey: ['analytics-history', orgId] });
     },
    onError: () => toast.error('Analytic failed'),
  });

  // Schedule creator mutation
  const createSchedMut = useMutation({
    mutationFn: async (freq: 'daily' | 'weekly' | 'monthly' | string) => {
      await enforceAnalyticsLimit(orgId, 'Analytics-Schedule');
      const res = await fetch('/api/analytics/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgId, frequency: freq, analytics: ['eda', 'basket', 'forecast'] }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['analytics-schedules', orgId] });
      toast.success('Schedule created');
      setShowScheduleModal(false);
      setCron(''); // reset custom field
    },
   onError: (e: any) => toast.error(e.message),
  });

  // AI ask mutation
  const askAIMut = useMutation({
    mutationFn: async (q: string) => {
      const report = qc.getQueryData(['analytics-results', orgId, activeAnalytic]) as any;
      return analyticsAPI.ai(orgId, q, report || { daily_sales: 0 });
    },
    onSuccess: setAiReply,
  });

  // Auto-run EDA on mount
  useEffect(() => {
    if (!orgId) return;
    runMut.mutate('eda');
  }, [orgId]);

  // Industry icon helper
  const industryIcons: Record<Industry, React.ReactNode> = {
    supermarket: <ShoppingCart className="w-4 h-4" />,
    retail: <Store className="w-4 h-4" />,
    healthcare: <HeartPulse className="w-4 h-4" />,
    manufacturing: <Factory className="w-4 h-4" />,
  };

  // Render helpers
 // line ~148  –  change variable name
const analyticResults = qc.getQueryData(['analytics-results', orgId, activeAnalytic]) as any;

  const supermarketKPIs = analyticResults?.supermarket_kpis;

  const renderSupermarketKPIs = () =>
    !supermarketKPIs ? null : (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white/5 border border-white/10 rounded-xl p-4">
          <CardContent>
            <p className="text-xs text-gray-400">Stock on hand</p>
            <p className="text-xl font-bold">{supermarketKPIs.stock_on_hand ?? 0}</p>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border border-white/10 rounded-xl p-4">
          <CardContent>
            <p className="text-xs text-gray-400">Expiring ≤7 d</p>
            <p className="text-xl font-bold text-amber-400">{supermarketKPIs.expiring_next_7_days ?? 0}</p>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border border-white/10 rounded-xl p-4">
          <CardContent>
            <p className="text-xs text-gray-400">Promo lift</p>
            <p className="text-xl font-bold">{supermarketKPIs.promo_lift_pct ?? 0}%</p>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border border-white/10 rounded-xl p-4">
          <CardContent>
            <p className="text-xs text-gray-400">Shrinkage</p>
            <p className="text-xl font-bold text-red-400">{supermarketKPIs.shrinkage_pct ?? 0}%</p>
          </CardContent>
        </Card>
      </div>
    );

  const renderChart = (type: 'bar' | 'line' | 'pie', data: any[]) => {
    if (!data.length) return <p className="text-sm text-gray-400">No data</p>;
    switch (type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} onClick={(e) => e && drill.drill({ key: 'date', value: e.activeLabel ?? '' })}>
              <CartesianGrid stroke="#2E7D7D" strokeOpacity={0.3} />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: '#1E2A44', border: '1px solid #2E7D7D' }} />
              <Bar dataKey="sales" fill="#10b981" cursor="pointer" />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid stroke="#444" />
              <XAxis dataKey="label" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: '#1E2A44', border: '1px solid #666' }} />
              <Line type="monotone" dataKey="value" stroke="#A3BFFA" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8b5cf6" label>
                {data.map((_, i) => (
                  <Cell key={`cell-${i}`} fill={`#8b5cf6${Math.round((i / data.length) * 255).toString(16).padStart(2, '0')}`} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  // Drill breadcrumb
  const Breadcrumb = () =>
    drill.stack.length > 0 ? (
      <div className="flex items-center gap-2 text-sm text-gray-300 mb-4">
        <Button variant="ghost" size="sm" onClick={drill.pop}>
          ← Back
        </Button>
        {drill.stack.map((s, i) => (
          <span key={i} className="flex items-center gap-1">
            <ChevronRight className="w-4 h-4" />
            <span className="text-teal-400">{s.key} = {s.value}</span>
          </span>
        ))}
      </div>
    ) : null;

  // Schedule popover
    const SchedulePopover = () => {
    const { createSchedMut, cron, setCron, setShowScheduleModal } = useScheduleMut(); // ← tiny wrapper below
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button className="bg-gradient-to-r from-teal-500 to-cyan-400 text-white">
            <Plus className="w-4 h-4 mr-2" /> Schedule
          </Button>
        </PopoverTrigger>
        <PopoverContent className="bg-[#1E2A44] border border-white/10 rounded-2xl p-4 w-80">
          <h3 className="text-lg font-semibold mb-4">Schedule Reports</h3>

          {/* Frequency buttons – highlight + spin */}
          <div className="grid grid-cols-3 gap-2">
            {(['daily', 'weekly', 'monthly'] as const).map((f) => (
              <Button
               key={f}
                variant={createSchedMut.variables === f ? 'default' : 'outline'}
                onClick={() => createSchedMut.mutate(f)}
                  disabled={createSchedMut.isPending}
              >
                {createSchedMut.isPending && createSchedMut.variables === f ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                f
                )}
              </Button>
           ))}
          </div>

         {/* Custom cron */}
         <Input
           value={cron}
           onChange={(e) => setCron(e.target.value)}
           placeholder="0 8 * * MON"
           className="mt-4 bg-black/30 border-white/20"
         />

          {/* Save – real value + spin */}
          <Button
             className="mt-2 w-full"
             onClick={() => createSchedMut.mutate(cron || 'daily')}
             disabled={createSchedMut.isPending}
           >
           {createSchedMut.isPending ? (
             <Loader2 className="w-4 h-4 animate-spin" />
           ) : (
              'Save Cron'
           )}
          </Button>

          {/* Error banner */}
          {createSchedMut.isError && (
           <p className="text-xs text-red-400 mt-2">{createSchedMut.error.message}</p>
         )}
        </PopoverContent>
      </Popover>
    );
  };

  /* tiny hook wrapper – keeps parent component clean */
  function useScheduleMut() {
    const qc = useQueryClient();
    const orgId = useOrgProfile().data?.orgId ?? '';
    const [cron, setCron] = useState('');
    const [showScheduleModal, setShowScheduleModal] = useState(false);

    const createSchedMut = useMutation({
      mutationFn: async (freq: 'daily' | 'weekly' | 'monthly' | string) => {
       await enforceAnalyticsLimit(orgId, 'Analytics-Schedule');
       const res = await fetch('/api/analytics/schedules', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orgId, frequency: freq, analytics: ['eda', 'basket', 'forecast'] }),
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      },
     onSuccess: () => {
       qc.invalidateQueries({ queryKey: ['analytics-schedules', orgId] });
       toast.success('Schedule created');
       setShowScheduleModal(false);
        setCron('');
      },
      onError: (e: any) => toast.error(e.message),
    });

    return { createSchedMut, cron, setCron, setShowScheduleModal };
  }

  // History drawer
  const HistoryDrawer = () => {
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState<any>(null);
    return (
      <>
        <Button onClick={() => setOpen(true)} variant="outline">
          <History className="w-4 h-4 mr-2" /> History
        </Button>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed right-0 top-0 h-full w-96 bg-[#0B1120] border-l border-white/10 p-6 overflow-y-auto z-50"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Report History</h3>
                <Button variant="ghost" onClick={() => setOpen(false)}>×</Button>
              </div>
              {history?.length ? (
                history?.map((r: any) => (
                 <Card key={r.id} className="mb-4 cursor-pointer hover:bg-white/10" onClick={() => setSelected(r)}>
                    <CardContent className="pt-4">
                      <p className="font-medium">{r.type} report</p>
                      <p className="text-xs text-gray-400">{format(new Date(r.lastRun), 'PPp')}</p>
                     </CardContent>
                 </Card>
                ))
              ) : (
             <p className="text-sm text-gray-400">No history yet.</p>
              )}
              {selected && (
              <div className="mt-6">
                 <h4 className="font-semibold mb-2">Results</h4>
                 <pre className="text-xs bg-black/30 p-2 rounded overflow-auto">{JSON.stringify(selected.results, null, 2)}</pre>
              </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  };

  // Main render
  if (!orgId) return <div className="p-6 text-gray-400">Loading analytics…</div>;

  const results = qc.getQueryData(['analytics-results', orgId, activeAnalytic]) as any;
 
  
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#0B1120] to-[#1E2A44] text-white font-inter">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-20 bg-black/30 backdrop-blur-xl border border-white/10 rounded-b-2xl px-6 py-4"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-cyan-300 bg-clip-text text-transparent">Analytics</h1>
            <p className="text-sm text-gray-400">{ctx?.firstName} • {ctx?.plan?.name} plan</p>
          </div>
          <div className="flex items-center gap-3">
            <LiveIndicator live={!!(live as any)?.online} />
            <HistoryDrawer />
            <Bell className="w-5 h-5 text-teal-400 cursor-pointer" onClick={() => toast('Notifications coming soon')} />
          </div>
        </div>
      </motion.header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-10">
        {/* Industry & Analytic Picker */}
        <Card className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <div className="flex flex-wrap items-center gap-4">
            <Select value={industry} onValueChange={(v) => setIndustry(v as Industry)}>
              <SelectTrigger className="w-48 bg-black/30 border-white/20 text-cyan-400">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1E2A44] border border-white/10 text-cyan-300">
                <SelectItem value="supermarket">{industryIcons.supermarket} Supermarket</SelectItem>
                <SelectItem value="retail">{industryIcons.retail} Retail</SelectItem>
                <SelectItem value="healthcare">{industryIcons.healthcare} Healthcare</SelectItem>
                <SelectItem value="manufacturing">{industryIcons.manufacturing} Manufacturing</SelectItem>
              </SelectContent>
            </Select>
            <Select value={activeAnalytic} onValueChange={(v) => setActiveAnalytic(v as AnalyticType)}>
              <SelectTrigger className="w-48 bg-black/30 border-white/20 text-cyan-400">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1E2A44] border border-white/10 text-cyan-300">
                <SelectItem value="eda">EDA</SelectItem>
                <SelectItem value="forecast">Forecast</SelectItem>
                <SelectItem value="basket">Basket</SelectItem>
                <SelectItem value="market-dynamics">Market Dynamics</SelectItem>
                <SelectItem value="supply-chain">Supply Chain</SelectItem>
                <SelectItem value="customer-insights">Customer Insights</SelectItem>
                <SelectItem value="operational-efficiency">Operational Efficiency</SelectItem>
                <SelectItem value="risk-assessment">Risk Assessment</SelectItem>
                <SelectItem value="sustainability">Sustainability</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => runMut.mutate(activeAnalytic)} disabled={runMut.isPending}>
              <Play className="w-4 h-4 mr-2" /> {runMut.isPending ? 'Running…' : 'Run'}
            </Button>
            <SchedulePopover />
          </div>
        </Card>

        {/* SUPERMARKET KPI RAIL – above old cards */}
        {industry === 'supermarket' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-white/5 border border-white/10 rounded-xl p-4">
            <CardContent>
               <p className="text-xs text-gray-400">Stock on hand</p>
               <p className="text-xl font-bold">{supermarketKPIs?.stock_on_hand ?? 0}</p>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border border-white/10 rounded-xl p-4">
            <CardContent>
              <p className="text-xs text-gray-400">Expiring ≤7 d</p>
              <p className="text-xl font-bold text-amber-400">{supermarketKPIs?.expiring_next_7_days ?? 0}</p>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border border-white/10 rounded-xl p-4">
            <CardContent>
              <p className="text-xs text-gray-400">Promo lift</p>
              <p className="text-xl font-bold">{supermarketKPIs?.promo_lift_pct ?? 0}%</p>
            </CardContent>
          </Card>
          <Card className="bg-white/5 border border-white/10 rounded-xl p-4">
            <CardContent>
              <p className="text-xs text-gray-400">Shrinkage</p>
              <p className="text-xl font-bold text-red-400">{supermarketKPIs?.shrinkage_pct ?? 0}%</p>
           </CardContent>
          </Card>
        </div>
        )}

        {/* Old 4 KPI cards – still visible */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <KPICard icon={<TrendingUp />} title="Daily Sales" value={`KES ${analyticResults?.daily_sales ?? 0}`} color="#10b981" />
          <KPICard icon={<BarChart3 />} title="Items Sold" value={analyticResults?.daily_qty ?? 0} color="#10b981" />
          <KPICard icon={<PieChartIcon />} title="Avg Basket" value={`KES ${analyticResults?.avg_basket ?? 0}`} color="#10b981" />
          <KPICard icon={<Zap />} title="Status" value={(live as any)?.online ? 'Online' : 'Offline'} color={(live as any)?.online ? '#10b981' : '#ef4444'} pulse={(live as any)?.online} />
        </div>

        {/* Drill breadcrumb */}
        <Breadcrumb />

        {/* Charts */}
        <Card className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">{activeAnalytic} <Filter className="w-4 h-4" /></CardTitle>
          </CardHeader>
          <CardContent>
            {activeAnalytic === 'eda' && renderChart('bar', drill.filtered)}
            {activeAnalytic === 'forecast' && renderChart('line', results?.forecast ?? [])}
            {activeAnalytic === 'basket' && renderChart('pie', results?.product_associations ? Object.entries(results.product_associations.support).map(([k, v]) => ({ name: k, value: v })) : [])}
            {['supply-chain', 'customer-insights', 'operational-efficiency', 'risk-assessment', 'sustainability'].includes(activeAnalytic) && (
              <pre className="text-xs bg-black/30 p-3 rounded overflow-auto">{JSON.stringify(results, null, 2)}</pre>
            )}
          </CardContent>
        </Card>

        {/* AI Chat with Visuals */}
        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl p-6 border border-purple-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Bot className="w-5 h-5" /> Ask Newton Anything</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="E.g. Why did profit dip yesterday?"
                className="bg-black/30 border-purple-500/50 text-white"
                onKeyDown={(e) => e.key === 'Enter' && askAIMut.mutate(question)}
              />
              <Button onClick={() => askAIMut.mutate(question)} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                Ask
              </Button>
            </div>
            <AnimatePresence>
              {aiReply && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-sm text-gray-200 bg-black/20 rounded-lg p-4"
                >
                  {aiReply.text}
                  {aiReply.chart && renderChart(aiReply.chart.type, aiReply.chart.data)}
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Scheduled Reports List */}
        <Card className="bg-white/5 border border-white/10 rounded-2xl p-4">
           <CardHeader>
              <CardTitle>Latest Report</CardTitle>
           </CardHeader>
           <CardContent>
             {latest ? (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                     <div>
                       <p className="font-medium">{latest.type}</p>
                       <p className="text-xs text-gray-400">Ran: {format(new Date(latest.lastRun), "PPp")}</p>
                     </div>
                     <Clock className="w-4 h-4 text-teal-400" />
                    </div>

                    {/* KPI table */}
                    <div className="text-sm bg-black/30 p-3 rounded overflow-auto max-h-48">
                      {Object.entries(latest.results?.supermarket_kpis || latest.results).map(([k, v]) => (
                       <div key={k} className="flex justify-between py-1 border-b border-white/10 last:border-0">
                         <span className="text-gray-300">{k.replace(/_/g, " ")}</span>
                         <span className="text-white font-semibold">{String(v)}</span>
                        </div>
                      ))}
                    </div>

                    {/* PDF download */}
                    <button
                      onClick={async () => {
                        const bytes = await buildReportPDF(latest);
                        const blob = new Blob([bytes as Uint8Array<ArrayBuffer>], { type: "application/pdf" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `${latest.type}-report-${latest.orgId}.pdf`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                        }}
                      className="inline-flex items-center gap-2 mt-3 px-3 py-1 bg-teal-500 text-white rounded hover:bg-teal-600"
                      >
                      <Download className="w-4 h-4" /> Download PDF
                     </button>
                </div> 
              ) : (
               <p className="text-sm text-gray-400">No report yet – run an analytic above.</p>
              )}
            </CardContent>
          </Card>
      </main>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sub-components                                                     */
/* ------------------------------------------------------------------ */
const KPICard = ({ icon, title, value, color, pulse }: { icon: React.ReactNode; title: string; value: string | number; color?: string; pulse?: boolean }) => (
  <motion.div whileHover={{ scale: 1.02 }} className="bg-white/5 border border-white/10 rounded-xl p-6 shadow-lg">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-400">{title}</p>
        <p className={`text-2xl font-bold ${pulse ? 'animate-pulse' : ''}`} style={{ color }}>
          {value}
        </p>
      </div>
      <div className="text-2xl" style={{ color }}>
        {icon}
      </div>
    </div>
  </motion.div>
);