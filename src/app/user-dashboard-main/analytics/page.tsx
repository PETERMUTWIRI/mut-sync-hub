// app/analytics/cockpit/page.tsx
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion';
import { 
  Package, AlertTriangle, TrendingUp, ShoppingCart, Zap, Sparkles, 
  Bot, ChevronRight, Lightbulb, ShieldCheck, HeartPulse, Factory,
  Clock, DollarSign, Calendar, BarChart3, Info, X, Menu, RefreshCw,
  Users, CreditCard, ShoppingBag, TrendingDown, Box, AlertCircle,
  Activity, Target, Truck, ChartLine, PieChartIcon, BarChartIcon
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

import { useAnalyticsPoll } from '@/hooks/useAnalyticsPoll';
import { getOrgProfileInternal } from '@/lib/org-profile';
import { useAIQuery } from '@/hooks/useAIQuery';

// ── TYPE DEFINITIONS ────────────────────────────────────────────────────

interface OrgProfile {
  userId: string;
  orgId: string;
  role: string;
  plan: string | null;
}

type Severity = 'critical' | 'warning' | 'info';
type ChartType = 'line' | 'bar' | 'pie' | 'area';
type Category = 'realtime' | 'financial' | 'inventory' | 'customer' | 'predictive';

interface KPIData {
  id: string;
  label: string;
  value: string | number;
  change: string;
  icon: React.ElementType;
  color: string;
  alert?: boolean;
  inverse?: boolean;
  data?: any[];
  category: Category;
  meta?: Record<string, any>;
}

interface Insight {
  id: string;
  type: keyof typeof INSIGHT_ICONS;
  severity: Severity;
  icon: React.ElementType;
  title: string;
  description: string;
  action?: string;
}

interface ChartData {
  type: ChartType;
  title: string;
  data: any[];
}

// ── CONSTANTS ────────────────────────────────────────────────────────────

const INSIGHT_ICONS: Record<string, React.ElementType> = {
  alert: AlertTriangle,
  insight: Lightbulb,
  system: Bot,
};

const SEVERITY_STYLES: Record<Severity, string> = {
  critical: 'border-red-500/50 bg-red-500/10',
  warning: 'border-amber-500/50 bg-amber-500/10',
  info: 'border-cyan-500/50 bg-cyan-500/10',
};

const CATEGORY_CONFIG: Record<Category, { label: string; icon: React.ElementType; color: string }> = {
  realtime: { label: 'Real-Time', icon: Zap, color: '#00D4FF' },
  financial: { label: 'Financial', icon: DollarSign, color: '#10B981' },
  inventory: { label: 'Inventory', icon: Package, color: '#F59E0B' },
  customer: { label: 'Customers', icon: Users, color: '#A3BFFA' },
  predictive: { label: 'AI Alerts', icon: Bot, color: '#EF4444' },
};

// ── COMPONENTS ──────────────────────────────────────────────────────────

const AnimatedNumber = ({ value }: { value: number }) => {
  const spring = useSpring(value, { stiffness: 500, damping: 30 });
  const display = useTransform(spring, (v) => Math.round(v).toLocaleString());
  
  return <motion.h2 className="text-3xl font-bold">{display}</motion.h2>;
};

const KPICard = ({ data, isLive, onClick }: { 
  data: KPIData; 
  isLive: boolean;
  onClick: () => void;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const isNegative = data.change.startsWith('-') && !data.inverse;
  
  return (
    <motion.div
      className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 cursor-pointer"
      whileHover={{ scale: 1.02, borderColor: data.color }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      layout
    >
      {isLive && (
        <motion.div 
          className="absolute top-3 right-3 w-2 h-2 bg-teal-400 rounded-full"
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
      
      <div className="flex items-start justify-between mb-3">
        <data.icon className="w-6 h-6" style={{ color: data.color }} />
        <motion.span 
          className={`text-sm font-semibold px-2 py-1 rounded ${
            isNegative ? 'bg-red-500/20 text-red-400' : 'bg-teal-500/20 text-teal-400'
          }`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500 }}
        >
          {data.change}
        </motion.span>
      </div>
      
      <div className="space-y-1">
        <p className="text-xs text-gray-400 uppercase tracking-wider">{data.label}</p>
        {typeof data.value === 'number' ? (
          <AnimatedNumber value={data.value} />
        ) : (
          <motion.h2 
            className="text-3xl font-bold"
            style={{ color: data.color }}
            key={data.value}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {data.value}
          </motion.h2>
        )}
      </div>
      
      {data.alert && (
        <motion.div
          className="absolute -top-2 -right-2 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500 }}
        >
          <AlertTriangle className="w-3 h-3 text-white" />
        </motion.div>
      )}
    </motion.div>
  );
};

const InsightCard = ({ insight }: { insight: Insight }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <motion.div
      className={`rounded-xl p-4 mb-3 cursor-pointer ${SEVERITY_STYLES[insight.severity]}`}
      whileHover={{ scale: 1.01 }}
      onClick={() => setIsExpanded(!isExpanded)}
      layout
    >
      <div className="flex items-start gap-3">
        <insight.icon className="w-5 h-5 mt-1 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="font-semibold mb-1">{insight.title}</h4>
          <p className="text-sm text-gray-300">{insight.description}</p>
          
          <AnimatePresence>
            {isExpanded && insight.action && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3"
              >
                <button className="bg-cyan-500/20 border border-cyan-500/50 rounded-lg px-3 py-2 text-sm text-cyan-400 hover:bg-cyan-500/30 w-full">
                  {insight.action}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

const ChartWrapper = ({ chart }: { chart: ChartData }) => {
  const colors = ['#00D4FF', '#10B981', '#F59E0B', '#EF4444', '#A3BFFA', '#8B5CF6', '#F97316', '#06B6D4'];
  
  return (
    <Card className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
      <CardHeader className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{chart.title}</h3>
        <button className="text-xs text-gray-400 hover:text-cyan-400 flex items-center gap-1">
          <Info className="w-3 h-3" /> AI Explain
        </button>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          {chart.type === 'line' && (
            <LineChart data={chart.data}>
              <CartesianGrid stroke="#1E2A44" strokeDasharray="3 3" />
              <XAxis dataKey="label" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip contentStyle={{ backgroundColor: '#0B1120', border: '1px solid #1E2A44' }} />
              <Line type="monotone" dataKey="value" stroke="#00D4FF" strokeWidth={2} dot={{ r: 3, stroke: '#00D4FF', fill: '#00D4FF' }} />
            </LineChart>
          )}
          {chart.type === 'bar' && (
            <BarChart data={chart.data}>
              <CartesianGrid stroke="#1E2A44" strokeDasharray="3 3" />
              <XAxis dataKey="label" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip contentStyle={{ backgroundColor: '#0B1120', border: '1px solid #1E2A44' }} />
              <Bar dataKey="value" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          )}
          {chart.type === 'pie' && (
            <PieChart>
              <Tooltip contentStyle={{ backgroundColor: '#0B1120', border: '1px solid #1E2A44' }} />
              <Pie data={chart.data} dataKey="value" nameKey="label" outerRadius={90} label>
                {chart.data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
            </PieChart>
          )}
          {chart.type === 'area' && (
            <AreaChart data={chart.data}>
              <CartesianGrid stroke="#1E2A44" strokeDasharray="3 3" />
              <XAxis dataKey="label" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip contentStyle={{ backgroundColor: '#0B1120', border: '1px solid #1E2A44' }} />
              <Area type="monotone" dataKey="value" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.3} />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

const DrilldownModal = ({ kpi, onClose }: { kpi: KPIData; onClose: () => void }) => {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-cockpit-panel border border-white/10 rounded-2xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">{kpi.label} - Detailed Analysis</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Trend Analysis</h3>
              </CardHeader>
              <CardContent>
                <ChartWrapper chart={{ type: 'line', title: '30 Day Trend', data: kpi.data || [] }} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Category Breakdown</h3>
              </CardHeader>
              <CardContent>
                <ChartWrapper chart={{ type: 'bar', title: 'By Segment', data: kpi.meta?.breakdown || [] }} />
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const CategoryTabs = ({ activeTab, onTabChange }: { activeTab: Category; onTabChange: (tab: Category) => void }) => {
  return (
    <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
      {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
        const Icon = config.icon;
        const isActive = activeTab === key;
        
        return (
          <button
            key={key}
            onClick={() => onTabChange(key as Category)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
              isActive 
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
                : 'bg-white/5 text-gray-300 hover:bg-white/10'
            }`}
          >
            <Icon className="w-4 h-4" />
            {config.label}
          </button>
        );
      })}
    </div>
  );
};

// ── MAIN PAGE ───────────────────────────────────────────────────────────

export default function AnalyticsCockpit() {
  // FIX: Industry should be string, not Category
  const [industry, setIndustry] = useState<string>('supermarket');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedKPI, setSelectedKPI] = useState<KPIData | null>(null);
  const [aiInput, setAiInput] = useState('');
  const [profile, setProfile] = useState<OrgProfile | null>(null);
  const [activeTab, setActiveTab] = useState<Category>('realtime');
  const { askQuestion, answer, sources, loading } = useAIQuery();
  const [aiQuery, setAiQuery] = useState('');
  
  useEffect(() => {
    let isMounted = true;
    
    const fetchProfile = async () => {
      try {
        const result = await getOrgProfileInternal();
        if (isMounted) setProfile(result);
      } catch (error) {
        console.error('[Cockpit] Failed to load profile:', error);
        if (isMounted) {
          setProfile({
            userId: 'user_synth_456',
            orgId: 'org_synth_123',
            role: 'USER',
            plan: '088c6a32-7840-4188-bc1a-bdc0c6bee723'
          });
        }
      }
    };
    
    fetchProfile();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const {
    kpis: apiKpis, // This is now the full metrics object, not an array
    insights: apiInsights,
    status,
    error,
    lastUpdated,
    isTriggering,
    triggerComputation,
    reconnect,
  } = useAnalyticsPoll(profile?.orgId || null, 'default_source');

  // Transform backend metrics to KPIData format
  const transformMetricsToKPIs = useCallback((metrics: any): KPIData[] => {
    if (!metrics) return [];
    
    const kpis: KPIData[] = [];
    
    // Process each category
    Object.entries(CATEGORY_CONFIG).forEach(([categoryKey, config]) => {
      const categoryData = metrics[categoryKey];
      if (!categoryData) return;
      
      Object.entries(categoryData).forEach(([key, value]) => {
        // Skip non-numeric values and metadata
        if (typeof value !== 'number' || key.includes('_pct') || key.includes('_rate')) return;
        
        const changeKey = `growth_vs_last_${key}` in categoryData ? categoryData[`growth_vs_last_${key}`] : '+0%';
        
        kpis.push({
          id: `${categoryKey}-${key}`,
          label: formatLabel(key),
          value: formatValue(value),
          change: changeKey || '+0%',
          icon: getIconByKey(key),
          color: config.color,
          category: categoryKey as Category,
          alert: categoryKey === 'inventory' && key === 'expiring_value' && value > 5000,
          inverse: key === 'shrinkage' || key === 'refund_rate',
          meta: categoryData,
        });
      });
    });
    
    return kpis.slice(0, 20); // Limit to top 20 to prevent UI overload
  }, []);

  // Process insights from backend
  const processInsights = useCallback((metrics: any): Insight[] => {
    if (!metrics?.predictive?.alerts && !metrics?.inventory?.alerts) return [];
    
    const alerts = [
      ...(metrics.predictive?.alerts || []),
      ...(metrics.inventory?.alerts || [])
    ];
    
    return alerts.map((alert: any, i: number) => ({
      id: `alert-${i}`,
      type: alert.severity === 'critical' ? 'alert' : 'insight',
      severity: alert.severity || 'info',
      icon: INSIGHT_ICONS[alert.severity === 'critical' ? 'alert' : 'insight'] || Lightbulb,
      title: alert.title || alert,
      description: alert.description || '',
      action: alert.action,
    }));
  }, []);

  // Transform API response
  const kpis = useMemo(() => {
    if (!apiKpis) return [];
    return transformMetricsToKPIs(apiKpis);
  }, [apiKpis, transformMetricsToKPIs]);

  const aiFeed = useMemo(() => {
    if (!apiKpis) return [];
    return processInsights(apiKpis);
  }, [apiKpis, processInsights]);

  // Dynamic charts from backend
  const charts = useMemo(() => {
    if (!apiKpis?.charts) return []; // FIX: apiKpis is an object, not an array
    
    const chartData = apiKpis.charts;
    return [
      { type: 'line' as ChartType, title: 'Hourly Sales', data: chartData.hourly_sales || [] },
      { type: 'bar' as ChartType, title: 'Top Categories', data: chartData.top_categories || [] },
      { type: 'pie' as ChartType, title: 'Customer Segments', data: chartData.customer_segments || [] },
      { type: 'area' as ChartType, title: '7-Day Sales Trend', data: chartData.sales_trend_7d || [] },
    ];
  }, [apiKpis]);

  const handleAIQuery = useCallback(async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && aiQuery.trim() && profile) {
      await askQuestion(aiQuery, profile.orgId);
      setAiQuery('');
    }
  }, [aiQuery, profile, askQuestion]);

  const handleKPIClick = useCallback((kpi: KPIData) => {
    setSelectedKPI(kpi);
  }, []);

  if (!profile) {
    return (
      <div className="min-h-screen bg-cockpit-bg text-white flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-cyan-400" />
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (status === 'loading' && !apiKpis) {
    return (
      <div className="min-h-screen bg-cockpit-bg text-white flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-cyan-400" />
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-cockpit-bg text-white flex items-center justify-center p-6">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 max-w-md">
          <h2 className="text-xl font-bold mb-2">Error Loading Analytics</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <button 
            onClick={reconnect}
            className="bg-cyan-500/20 border border-cyan-500/50 rounded-lg px-4 py-2 text-cyan-400 hover:bg-cyan-500/30"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cockpit-bg text-white relative">
      {/* Progress Bar */}
      {isTriggering && (
        <motion.div
          className="fixed top-0 left-0 right-0 h-1 bg-cyan-500 z-50"
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      )}
      
      {/* Header */}
      <motion.header 
        className="sticky top-0 z-40 bg-black/50 backdrop-blur-xl border-b border-white/10 px-6 py-4"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="max-w-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden">
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-cyan-400">Analytics Copilot</h1>
              <p className="text-xs text-gray-400">{profile.orgId} • Tier: {profile.plan}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                status === 'connected' ? 'bg-teal-400' : 'bg-amber-400 animate-pulse'
              }`} />
              <span className="text-xs">{status}</span>
            </div>
            <button 
              onClick={triggerComputation}
              disabled={isTriggering}
              className="text-xs bg-cyan-500/20 border border-cyan-500/50 rounded-lg px-3 py-1 hover:bg-cyan-500/30 disabled:opacity-50"
            >
              {isTriggering ? 'Processing...' : 'Recompute'}
            </button>
          </div>
        </div>
      </motion.header>
      
      {/* Main Layout */}
      <div className="flex h-screen pt-16">
        {/* AI Command Feed Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              className="w-80 bg-cockpit-panel/50 backdrop-blur-xl border-r border-white/10 p-4 overflow-y-auto"
              initial={{ x: -320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -320, opacity: 0 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-cyan-400">AI Command Feed</h2>
                <Sparkles className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="space-y-2">
                {aiFeed.map(insight => (
                  <InsightCard key={insight.id} insight={insight} />
                ))}
                {aiFeed.length === 0 && (
                  <p className="text-sm text-gray-400">No insights yet. Data is being analyzed...</p>
                )}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Industry Selector */}
          <motion.div 
            className="mb-6 flex items-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <select 
              className="bg-cockpit-panel border border-white/10 rounded-lg px-3 py-2 text-sm"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
            >
              <option value="supermarket">🏪 Supermarket</option>
              <option value="manufacturing">🏭 Manufacturing</option>
              <option value="pharmaceutical">💊 Pharmaceutical</option>
              <option value="wholesale">📦 Wholesale</option>
            </select>
            <span className="text-xs text-gray-400">
              {lastUpdated ? `Updated: ${lastUpdated.toLocaleTimeString()}` : 'Live data from DuckDB'}
            </span>
          </motion.div>
          
          {/* Category Tabs */}
          <CategoryTabs activeTab={activeTab} onTabChange={setActiveTab} />
          
          {/* KPI Grid */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-6"
          >
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {kpis
                .filter(kpi => kpi.category === activeTab)
                .map((kpi, i) => (
                  <motion.div
                    key={kpi.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                  >
                    <KPICard 
                      data={kpi} 
                      isLive={status === 'connected'} 
                      onClick={() => handleKPIClick(kpi)}
                    />
                  </motion.div>
                ))}
              {kpis.filter(kpi => kpi.category === activeTab).length === 0 && (
                <div className="col-span-full text-center py-8 text-gray-400">
                  No {activeTab} metrics available yet
                </div>
              )}
            </div>
          </motion.section>
          
          {/* Chart Grid */}
          <motion.section
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {charts.map((chart, i) => (
              <motion.div
                key={chart.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + i * 0.1 }}
              >
                <ChartWrapper chart={chart} />
              </motion.div>
            ))}
          </motion.section>
        </main>
      </div>
      
      {/* Command Bar */}
      <motion.div 
        className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-3xl z-40"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, type: "spring" }}
      >
        <div className="bg-black/70 backdrop-blur-xl border border-cyan-400/30 rounded-2xl p-4 flex items-start gap-3 shadow-2xl">
          <Bot className="w-5 h-5 text-cyan-400 mt-1" />
          <div className="flex-1">
            <input
              type="text"
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              onKeyDown={handleAIQuery}
              placeholder='Ask anything about your data...'
              className="w-full bg-transparent border-0 text-white placeholder:text-gray-400 focus:outline-none mb-2"
            />
            {loading && (
              <div className="text-xs text-cyan-400">Thinking... analyzing {sources.length} transactions</div>
            )}
            {answer && !loading && (
              <div className="text-sm text-gray-300 border-t border-white/10 pt-2 mt-2">
                <strong>AI:</strong> {answer}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <kbd className="px-1 py-0.5 bg-white/10 rounded">Enter</kbd>
            <span>Ask</span>
          </div>
        </div>
      </motion.div>
      
      {/* Drilldown Modal */}
      <AnimatePresence>
        {selectedKPI && (
          <DrilldownModal kpi={selectedKPI} onClose={() => setSelectedKPI(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};

// ── UTILITY FUNCTIONS ───────────────────────────────────────────────────

const formatLabel = (key: string): string => {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
    .replace(/Pct/g, '%')
    .replace(/Avg/g, 'Average');
};

const formatValue = (value: any): string | number => {
  if (typeof value === 'number') {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
    if (value < 1 && value > 0) return `${(value * 100).toFixed(1)}%`;
    return Math.round(value);
  }
  return String(value);
};

const getIconByKey = (key: string): React.ElementType => {
  const iconMap: Record<string, React.ElementType> = {
    // Realtime
    hourly_sales: TrendingUp,
    active_checkouts: Zap,
    items_per_minute: Package,
    avg_transaction_time: Clock,
    queue_length_estimate: Users,
    
    // Financial
    daily_sales: DollarSign,
    gross_margin: TrendingUp,
    refund_rate: AlertTriangle,
    avg_basket_value: ShoppingCart,
    avg_items_per_basket: Box,
    labor_efficiency: Activity,
    sales_per_sqft: Target,
    
    // Inventory
    expiring_value: AlertTriangle,
    out_of_stock_skus: AlertCircle,
    wastage_rate: TrendingDown,
    stock_turnover: RefreshCw,
    carrying_cost: DollarSign,
    
    // Customer
    unique_customers: Users,
    repeat_rate: HeartPulse,
    peak_hour: Clock,
    weekend_lift_pct: TrendingUp,
    new_customers: UserPlus,
    customer_lifetime_value: DollarSign,
  };
  return iconMap[key] || BarChart3;
};

const UserPlus = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
  </svg>
);