// app/analytics/cockpit/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion';
import { 
  Package, AlertTriangle, TrendingUp, ShoppingCart, Zap, Sparkles, 
  Bot, ChevronRight, Lightbulb, ShieldCheck, HeartPulse, Factory,
  Clock, DollarSign, Thermometer, BarChart3, PieChartIcon, Calendar,
  Activity, Users, Archive,Bell, Percent, CalendarDays, AlertOctagon,
  Info, X, Menu, Send
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

// TYPES
type Severity = 'critical' | 'warning' | 'info';
type ChartType = 'line' | 'bar' | 'pie' | 'area';

interface KPIData {
  id: string;
  label: string;
  value: string | number;
  change: string;
  icon: React.ElementType;
  color: string;
  alert?: boolean;
  inverse?: boolean;
}

interface Insight {
  id: string;
  type: 'alert' | 'insight' | 'system';
  severity: Severity;
  icon: React.ElementType;
  title: string;
  description: string;
  action?: string;
  data?: any;
}

interface ChartData {
  type: ChartType;
  title: string;
  data: any[];
}

// ANIMATED NUMBER COMPONENT (No CSS needed)
const AnimatedNumber = ({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) => {
  const spring = useSpring(value, { stiffness: 500, damping: 30 });
  const display = useTransform(spring, (v) => `${prefix}${Math.round(v).toLocaleString()}${suffix}`);
  
  return <motion.h2 className="text-3xl font-bold">{display}</motion.h2>;
};

// KPI CARD COMPONENT
const KPICard = ({ data, isLive }: { data: KPIData; isLive: boolean }) => {
  const [isHovered, setIsHovered] = useState(false);
  const isNegative = data.change.startsWith('-') && !data.inverse;
  
  return (
    <motion.div
      className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 cursor-pointer"
      whileHover={{ scale: 1.02, borderColor: data.color }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      layout
    >
      {/* Live indicator */}
      {isLive && (
        <motion.div 
          className="absolute top-3 right-3 w-2 h-2 bg-teal-400 rounded-full"
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
      
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <data.icon className="w-6 h-6" style={{ color: data.color }} />
        <motion.span 
          className={`text-sm font-semibold px-2 py-1 rounded ${isNegative ? 'bg-red-500/20 text-red-400' : 'bg-teal-500/20 text-teal-400'}`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500 }}
        >
          {data.change}
        </motion.span>
      </div>
      
      {/* Value */}
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
      
      {/* Alert badge */}
      {data.alert && (
        <motion.div
          className="absolute -top-2 -right-2 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500 }}
        >
          <span className="text-xs font-bold">{data.alert}</span>
        </motion.div>
      )}
      
      {/* Hover actions */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute -bottom-16 left-0 right-0 bg-black/80 backdrop-blur-sm rounded-lg p-3 z-10 border border-white/10"
          >
            <button 
              onClick={() => drillDown(data.id)}
              className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1"
            >
              Drill Down <ChevronRight className="w-3 h-3" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// INSIGHT CARD COMPONENT
const InsightCard = ({ insight }: { insight: Insight }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const severityStyles = {
    critical: 'border-red-500/50 bg-red-500/10',
    warning: 'border-amber-500/50 bg-amber-500/10',
    info: 'border-cyan-500/50 bg-cyan-500/10'
  };
  
  return (
    <motion.div
      className={`rounded-xl p-4 mb-3 cursor-pointer ${severityStyles[insight.severity]}`}
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
                <button className="bg-cyan-500/20 border border-cyan-500/50 rounded-lg px-3 py-2 text-sm text-cyan-400 hover:bg-cyan-500/30">
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

// CHART COMPONENT
const ChartWrapper = ({ chart }: { chart: ChartData }) => {
  const colors = ['#00D4FF', '#10B981', '#F59E0B', '#EF4444', '#A3BFFA'];
  
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
              <Line type="monotone" dataKey="value" stroke="#00D4FF" strokeWidth={2} dot={false} />
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
              <Pie data={chart.data} dataKey="value" nameKey="label" outerRadius={80}>
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

// MAIN COCKPIT PAGE
export default function AnalyticsCockpit() {
  // MOCK STATE - Replace with Redis pub/sub
  const [industry, setIndustry] = useState('supermarket');
  const [isIngesting, setIsIngesting] = useState(false);
  const [ingestProgress, setIngestProgress] = useState(0);
  const [aiInput, setAiInput] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Mock KPIs (will come from Redis: analytics:{org_id})
  const [kpis, setKpis] = useState<KPIData[]>([
  { id: "stock_value", label: "Stock Value", value: 2400000, change: "+8%", icon: Package, color: "#10B981" }, // ✅ number
  { id: "expiring", label: "Expiring <7d", value: 47, change: "-12%", icon: AlertTriangle, color: "#F59E0B", alert: true }, // ✅ number
  { id: "daily_sales", label: "Today's Sales", value: 487000, change: "+15%", icon: TrendingUp, color: "#10B981" }, // ✅ number
  { id: "shrinkage", label: "Shrinkage", value: "2.3%", change: "-0.5%", icon: Zap, color: "#EF4444", inverse: true }, // ✅ string
  // ... rest
  ]);
  
  // Mock AI feed (will come from Redis: ai_response:{org_id})
  const [aiFeed, setAiFeed] = useState<Insight[]>([
    {
      id: "1",
      type: "alert",
      severity: "critical",
      icon: AlertOctagon,
      title: "🚨 Milk Stockout in 48h",
      description: "Current: 23 units | Avg sales: 45 units/day. Lost revenue risk: KES 12,400",
      action: "Create Purchase Order →"
    },
    {
      id: "2", 
      type: "insight",
      severity: "info",
      icon: Lightbulb,
      title: "💡 Tuesday Promo Opportunity",
      description: "Bakery sales 18% below avg. Run 'Buy 2 Get 1' promo?",
      action: "Deploy Promo →"
    },
    {
      id: "3",
      type: "system", 
      severity: "info",
      icon: Bot,
      title: "🤖 Autopilot Active",
      description: "Next forecast run: 6:00 AM (2h 34m) | Tasks queued: 0"
    }
  ]);
  
  // Mock charts (will come from analytics cache)
  const [charts, setCharts] = useState<ChartData[]>([
    { type: 'line', title: 'Sales Trend (7d)', data: [{label:'Mon',value:450},{label:'Tue',value:380},{label:'Wed',value:520},{label:'Thu',value:490},{label:'Fri',value:610},{label:'Sat',value:700},{label:'Sun',value:650}] },
    { type: 'bar', title: 'Category AOV', data: [{label:'Bakery',value:1240},{label:'Dairy',value:890},{label:'Produce',value:1100},{label:'Meat',value:2100}] },
    { type: 'pie', title: 'Customer Segments', data: [{label:'VIP',value:30},{label:'Regular',value:45},{label:'New',value:25}] },
    { type: 'area', title: 'Forecast (Next 7d)', data: [{label:'Mon',value:680},{label:'Tue',value:720},{label:'Wed',value:750},{label:'Thu',value:800},{label:'Fri',value:820},{label:'Sat',value:780},{label:'Sun',value:740}] }
  ]);
  
  // Simulate ingestion
  useEffect(() => {
    const interval = setInterval(() => {
      setIsIngesting(true);
      setIngestProgress(Math.random() * 100);
      
      // Simulate new data arriving
      if (Math.random() > 0.7) {
        setKpis(prev => prev.map(kpi => ({
          ...kpi,
          value: typeof kpi.value === 'number' ? kpi.value + Math.floor(Math.random() * 10) : kpi.value
        })));
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Simulate AI feed updates
  useEffect(() => {
    const interval = setInterval(() => {
      setAiFeed(prev => [prev[0], {
        id: Date.now().toString(),
        type: "insight",
        severity: "warning",
        icon: Sparkles,
        title: "💡 New Insight",
        description: "AI has detected a pattern in your data",
        action: "View →"
      }, prev[2]]);
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);
  
  // AI Query handler
  const handleAIQuery = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && aiInput.trim()) {
      // This will push to Redis: task_queue
      console.log('AI Query:', aiInput);
      setAiInput('');
      
      // Mock instant response
      setAiFeed(prev => [{
        id: Date.now().toString(),
        type: "insight",
        severity: "info",
        icon: Bot,
        title: `🤖 ${aiInput}`,
        description: "Processing your query...",
        action: "Waiting for response"
      }, ...prev]);
    }
  };
  
  return (
    <div className="min-h-screen bg-cockpit-bg text-white relative">
      {/* Progress Bar (Ingestion) */}
      <AnimatePresence>
        {isIngesting && (
          <motion.div
            className="fixed top-0 left-0 right-0 h-1 bg-cyan-500 z-50"
            initial={{ width: 0 }}
            animate={{ width: `${ingestProgress}%` }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>
      
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
              <h1 className="text-2xl font-bold text-cyan-400">Analytics Cockpit</h1>
              <p className="text-xs text-gray-400">org_synth_123 • PRO Tier</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" />
              <span className="text-xs">Live</span>
            </div>
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <Bell className="w-5 h-5 text-cyan-400" />
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
            <span className="text-xs text-gray-400">Live data from DuckDB</span>
          </motion.div>
          
          {/* KPI Rail */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
              {kpis.map((kpi, i) => (
                <motion.div
                  key={kpi.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                >
                  <KPICard data={kpi} isLive={isIngesting} />
                </motion.div>
              ))}
            </div>
          </motion.section>
          
          {/* Chart Grid */}
          <motion.section
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            {charts.map((chart, i) => (
              <motion.div
                key={chart.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + i * 0.15 }}
              >
                <ChartWrapper chart={chart} />
              </motion.div>
            ))}
          </motion.section>
        </main>
      </div>
      
      {/* Command Bar */}
      <motion.div 
        className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl z-40"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8, type: "spring" }}
      >
        <div className="bg-black/70 backdrop-blur-xl border border-cyan-400/30 rounded-2xl p-3 flex items-center gap-3 shadow-2xl">
          <Bot className="w-5 h-5 text-cyan-400" />
          <input
            type="text"
            value={aiInput}
            onChange={(e) => setAiInput(e.target.value)}
            onKeyDown={handleAIQuery}
            placeholder='Ask anything... (e.g., "Why did sales drop yesterday?")'
            className="flex-1 bg-transparent border-0 text-white placeholder:text-gray-400 focus:outline-none"
          />
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <kbd className="px-1 py-0.5 bg-white/10 rounded">⌘</kbd>
            <span>K</span>
          </div>
        </div>
      </motion.div>
      
      {/* Status Bar */}
      <motion.div 
        className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-xl border-t border-white/10 px-6 py-2 text-xs text-gray-400 flex items-center justify-between"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.9 }}
      >
        <div className="flex items-center gap-4">
          <StatusIndicator label="DuckDB" status="healthy" />
          <StatusIndicator label="Redis" status="healthy" />
          <StatusIndicator label="LLM" status="loading" />
          <div className="w-px h-3 bg-white/10" />
          <span>Last: 2s ago</span>
          <span>Next: 6:00 AM (2h 34m)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-teal-400">org_synth_123</span>
          <span className="text-amber-400">Tier: PRO</span>
          <span>Credits: 1,450</span>
        </div>
      </motion.div>
    </div>
  );
};

// HELPERS
const StatusIndicator = ({ label, status }: { label: string; status: 'healthy' | 'loading' | 'error' }) => {
  const color = status === 'healthy' ? 'bg-teal-400' : status === 'loading' ? 'bg-amber-400 animate-pulse' : 'bg-red-400';
  
  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${color}`} />
      <span>{label}</span>
    </div>
  );
};

// PLACEHOLDER FUNCTIONS (Replace with real logic)
const drillDown = (kpiId: string) => console.log('Drill down:', kpiId);