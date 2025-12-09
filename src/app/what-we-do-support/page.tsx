'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  MessageSquare, LifeBuoy, BookOpen, Users, AlertCircle, Plus, Search, Mail, Phone,
  CheckCircle2, XCircle, Wrench, ChevronRight, ArrowRight, Star, Cpu, Cloud, Database,
  Bot, Globe, Code2, LayoutGrid, ChevronUp, ChevronDown, BarChart3, Clock, Award,
  Zap, Shield, Target, TrendingUp, Activity,RadioTower, Server, HardDrive,
  RefreshCw, Download, Play, StopCircle, ZapOff
} from 'lucide-react';
import { SiKubernetes, SiTerraform, SiReact, SiNodedotjs, SiRedis, SiPython, SiTensorflow, SiApachekafka, SiHiveBlockchain } from 'react-icons/si';
import SolutionsAgent from '@/components/SolutionsAgent'; // Your local AI component

/* ----------  THEME ---------- */
const DEEP_NAVY = '#1E2A44';
const TEAL = '#2E7D7D';
const TEXT_MAIN = 'text-gray-100';
const TEXT_SEC = 'text-gray-300';

/* ----------  FAQS (LOCAL) ---------- */
const faqs = [
  { question: 'How do I reset my password?', answer: 'Click “Forgot Password” on the login page and follow the email instructions.' },
  { question: 'What data sources do you support?', answer: 'SQL, NoSQL, cloud storage, SaaS apps – see our integrations page for the full list.' },
  { question: 'How often is data synced?', answer: 'Free plans: 24 h; paid plans: as frequent as 15 min.' },
  { question: 'Can I use MutSyncHub with my custom API?', answer: 'Yes – we expose REST & GraphQL endpoints and detailed guides.' },
  { question: 'How secure is my data?', answer: 'Encrypted in transit and at rest, SOC 2 & ISO 27001 compliant.' }
];

/* ----------  MOCK TICKETS (LOCAL) ---------- */
const useTickets = () => {
  const [tickets] = useState([
    {
      id: 'TKT-001',
      title: 'API Integration Issue',
      description: 'Unable to authenticate with the new API endpoint',
      status: 'open',
      priority: 'high',
      date: '2025-07-24',
      assignee: 'Sarah Johnson',
      xp: 150,
      badge: '🔥'
    },
    {
      id: 'TKT-002',
      title: 'Dashboard Not Loading',
      description: 'Analytics dashboard fails to load with large datasets',
      status: 'pending',
      priority: 'medium',
      date: '2025-07-23',
      assignee: 'Michael Chen',
      xp: 100,
      badge: '⚡'
    },
    {
      id: 'TKT-003',
      title: 'Billing Inquiry',
      description: 'Question about the latest invoice charges',
      status: 'resolved',
      priority: 'low',
      date: '2025-07-22',
      assignee: 'Emma Rodriguez',
      xp: 50,
      badge: '✅'
    }
  ]);
  return tickets;
};

/* ----------  SELF-HEALING TOOLS (LOCAL SIMULATION) ---------- */
const SelfHealingTools = () => {
  const [running, setRunning] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, boolean>>({});

  const tools = [
    { id: 'ping', name: 'API Ping', icon: <RadioTower size={18} /> },
    { id: 'cache', name: 'Clear Cache', icon: <HardDrive size={18} /> },
    { id: 'logs', name: 'Download Logs', icon: <Download size={18} /> },
    { id: 'health', name: 'Health Check', icon: <Activity size={18} /> }
  ];

  const run = async (id: string) => {
    setRunning(id);
    // Simulate async work
    await new Promise(res => setTimeout(res, 1500));
    setResults(prev => ({ ...prev, [id]: true }));
    setRunning(null);
  };

  return (
    <Card className="bg-[#1E2A44]/30 border border-[#2E7D7D]/30 shadow-md rounded-xl">
      <CardHeader>
        <CardTitle className="text-gray-100 flex items-center gap-2">
          <Zap size={20} /> Self-Healing Tools
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        {tools.map(t => (
          <Button
            key={t.id}
            variant="outline"
            className="border-teal-600 text-teal-400 hover:bg-teal-600/20 flex items-center gap-2"
            onClick={() => run(t.id)}
            disabled={running === t.id}
          >
            {running === t.id ? <RefreshCw size={16} className="animate-spin" /> : t.icon}
            {t.name}
          </Button>
        ))}
        <AnimatePresence>
          {Object.entries(results).map(([id, ok]) => (
            <motion.div
              key={id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`col-span-2 text-xs px-3 py-2 rounded-lg ${
                ok ? 'bg-green-600/10 text-green-300' : 'bg-red-600/10 text-red-300'
              }`}
            >
              {id} {ok ? 'completed successfully' : 'failed'}
            </motion.div>
          ))}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

/* ----------  REAL-TIME METRICS (LOCAL SIMULATION) ---------- */
const RealTimeMetrics = () => {
  const [responseTime, setResponseTime] = useState(320);
  const [satisfaction, setSatisfaction] = useState(98);
  const [queue, setQueue] = useState(3);

  useEffect(() => {
    const interval = setInterval(() => {
      setResponseTime(prev => Math.max(200, prev + (Math.random() - 0.5) * 20));
      setSatisfaction(prev => Math.min(100, Math.max(95, prev + (Math.random() - 0.5) * 2)));
      setQueue(prev => Math.max(0, prev + Math.floor(Math.random() * 3 - 1)));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="bg-[#1E2A44]/30 border border-[#2E7D7D]/30 shadow-md rounded-xl">
      <CardHeader>
        <CardTitle className="text-gray-100 flex items-center gap-2">
          <BarChart3 size={20} /> Real-Time Metrics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm text-gray-300 mb-1"><span>Avg Response</span><span>{Math.round(responseTime)} ms</span></div>
          <div className="w-full bg-gray-700 rounded-full h-2"><div className="bg-teal-400 h-2 rounded-full" style={{ width: `${100 - (responseTime - 200) / 3}%` }} /></div>
        </div>
        <div>
          <div className="flex justify-between text-sm text-gray-300 mb-1"><span>Satisfaction</span><span>{satisfaction}%</span></div>
          <div className="w-full bg-gray-700 rounded-full h-2"><div className="bg-green-400 h-2 rounded-full" style={{ width: `${satisfaction}%` }} /></div>
        </div>
        <div>
          <div className="flex justify-between text-sm text-gray-300 mb-1"><span>Live Queue</span><span>{queue}</span></div>
          <div className="w-full bg-gray-700 rounded-full h-2"><div className="bg-yellow-400 h-2 rounded-full" style={{ width: `${Math.min(100, queue * 20)}%` }} /></div>
        </div>
      </CardContent>
    </Card>
  );
};
const useSystemStatus = () => {
  const [status, setStatus] = useState([
    { service: 'API Services', status: 'operational', lastUpdated: new Date(), progress: 100 },
    { service: 'Data Processing', status: 'operational', lastUpdated: new Date(), progress: 94 },
    { service: 'Dashboard & Analytics', status: 'degraded', lastUpdated: new Date(), progress: 78 },
    { service: 'Authentication', status: 'operational', lastUpdated: new Date(), progress: 100 },
    { service: 'Integration Connectors', status: 'maintenance', lastUpdated: new Date(), progress: 0 },
    { service: 'Notification System', status: 'outage', lastUpdated: new Date(), progress: 0 }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(prev => prev.map(s => ({
        ...s,
        lastUpdated: new Date(),
        progress: s.status === 'operational' ? Math.min(100, s.progress + Math.random() * 2) :
                   s.status === 'degraded' ? Math.max(70, s.progress - Math.random()) :
                   s.status === 'maintenance' ? 0 : 0
      })));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return status;
};

/* ----------  MAIN RETURN (ENTERPRISE THEME, AUTOMATION-FREE) ---------- */
export default function WhatWeDoSupport() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'tickets' | 'knowledge' | 'status'>((searchParams?.get('section') as any) || 'tickets');
  const [showAgent, setShowAgent] = useState(false);
  const tickets = useTickets();
  const [searchTerm, setSearchTerm] = useState('');   // ← add this
  const systemStatus = useSystemStatus();
   

  /* ----------  SUPPORT TICKET CARD (GAMIFIED, LOCAL) ---------- */
  const TicketCard = ({ t }: { t: any }) => {
    const [expanded, setExpanded] = useState(false);
    return (
      <Card className="bg-[#1E2A44]/30 border border-[#2E7D7D]/30 shadow-md hover:shadow-xl transition-shadow rounded-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-gray-100">{t.title}</CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-lg">{t.badge}</span>
              <span className={`text-xs px-2 py-1 rounded-full ${
                t.status === 'open' ? 'bg-yellow-600/10 text-yellow-300' :
                t.status === 'pending' ? 'bg-blue-600/10 text-blue-300' :
                t.status === 'resolved' ? 'bg-green-600/10 text-green-300' :
                'bg-gray-600/10 text-gray-300'
              }`}>{t.status}</span>
            </div>
          </div>
          <p className="text-sm text-gray-300 mt-1">{t.description}</p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>ID: {t.id}</span>
            <span>Assignee: {t.assignee}</span>
            <span className="flex items-center gap-1 text-teal-400"><Star size={12} /> {t.xp} XP</span>
          </div>
          <button onClick={() => setExpanded(!expanded)} className="mt-3 text-teal-400 hover:text-teal-300 text-xs flex items-center gap-1">
            {expanded ? 'Hide details' : 'View details'} {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-3 pt-3 border-t border-[#2E7D7D]/30 text-sm text-gray-300"
              >
                Priority: <span className="capitalize">{t.priority}</span> | Created: {t.date} | SLA: 2h remaining
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    );
  };

  /* ----------  TRUST BAR (ICONS, NO 404S) ---------- */
  const TrustIcons = () => (
    <div className="flex justify-center gap-4 sm:gap-6 md:gap-8 flex-wrap text-2xl sm:text-3xl text-teal-400">
      <SiKubernetes title="Kubernetes" />
      <SiTerraform title="Terraform" />
      <SiReact title="React" />
      <SiNodedotjs title="Node.js" />
      <SiRedis title="Redis" />
      <SiPython title="Python" />
      <SiTensorflow title="TensorFlow" />
      <SiApachekafka title="Kafka" />
      <SiHiveBlockchain title="Blockchain" />
    </div>
  );

  /* ----------  MAIN RETURN (ENTERPRISE THEME) ---------- */
  return (
    <div className="min-h-screen bg-[#1E2A44] text-gray-100 font-inter overflow-x-hidden">
      <header className="sticky top-0 z-50 bg-[#1E2A44]/90 backdrop-blur border-b border-[#2E7D7D]/30 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              MutSyncHub
            </Link>

            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              <Link href="/" className="text-gray-300 hover:text-cyan-400 transition">Home</Link>
              <Link href="/solutions" className="text-gray-300 hover:text-cyan-400 transition">Solutions</Link>
              <Link href="/what-we-do-support" className="text-gray-300 hover:text-cyan-400 transition">Support</Link>
              <Link href="/resources" className="text-gray-300 hover:text-cyan-400 transition">Resources</Link>
            </nav>

            <div className="flex items-center gap-3">
              <Input
                type="text"
                placeholder="Search documentation, APIs, guides..."
                className="bg-[#2E7D7D]/20 border-[#2E7D7D] text-gray-100 placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-[#2E7D7D] w-full max-w-xs sm:max-w-sm md:max-w-md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Link
                href="https://wa.me/254783423550?text=Hi%20MutSyncHub,%20I%20need%20enterprise%20solutions."
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="bg-[#2E7D7D] text-white px-4 py-2 rounded-lg hover:bg-[#2E7D7D]/80">
                    Contact Sales
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative pt-24 pb-16 overflow-hidden bg-[#1E2A44]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500"
          >
            Enterprise Support Center
          </motion.h1>
          <p className="mt-4 text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto">
            24/7 support for your business-critical operations, with 98 % satisfaction and &lt; 2 h response time.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <Button
              className="bg-teal-600 text-white hover:bg-teal-700 px-8 py-3 rounded-lg font-semibold"
              onClick={() => setShowAgent(true)}
            >
              <MessageSquare className="mr-2" /> Start Live Chat
            </Button>
            <Button variant="outline" asChild className="border-teal-600 text-teal-400 hover:bg-teal-600/20 px-8 py-3 rounded-lg">
              <Link href="/resources">Explore Resources</Link>
            </Button>
          </div>

          {/* Trust Icons (React-Icons, zero 404s) */}
          <div className="mt-8 flex justify-center gap-8 flex-wrap text-3xl text-teal-400">
            <SiKubernetes title="Kubernetes" />
            <SiTerraform title="Terraform" />
            <SiReact title="React" />
            <SiNodedotjs title="Node.js" />
            <SiRedis title="Redis" />
            <SiPython title="Python" />
            <SiTensorflow title="TensorFlow" />
            <SiApachekafka title="Kafka" />
            <SiHiveBlockchain title="Blockchain" />
          </div>
        </div>
      </section>

      {/* REAL-TIME METRICS + SELF-HEALING (LOCAL) */}
      <section className="py-16 bg-[#1E2A44]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-full">
          <h2 className="text-3xl font-bold text-gray-100 mb-8 text-center">Real-Time Health & Metrics</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <RealTimeMetrics />
            <SelfHealingTools />
          </div>
        </div>
      </section>

      {/* GAMIFIED TICKETS + SYSTEM STATUS (LOCAL) */}
      <section className="py-16 bg-[#1E2A44]/30 border-t border-[#2E7D7D]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-full">
            {/* LEFT */}
            <aside className="lg:w-1/3 w-full max-w-full">
              <Card className="bg-[#1E2A44]/30 border border-[#2E7D7D]/30 shadow-md rounded-xl w-full">
                <CardHeader><CardTitle className="text-gray-100">Contact Support</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <Link href="mailto:support@mutsynhub.com" className="flex items-center gap-3 text-gray-300 hover:text-teal-400 transition-colors"><Mail size={20} /> support@mutsynhub.com</Link>
                  <Link href="tel:+254783423550" className="flex items-center gap-3 text-gray-300 hover:text-teal-400 transition-colors"><Phone size={20} /> +254 783 423 550</Link>
                  <Button className="bg-teal-600 text-white hover:bg-teal-700 px-6 sm:px-8 py-3 rounded-lg font-semibold whitespace-nowrap" onClick={() => setShowAgent(true)}><MessageSquare size={18} className="mr-2" /> 24/7 Live Chat</Button>
                </CardContent>
              </Card>

              <Card className="bg-[#1E2A44]/30 border border-[#2E7D7D]/30 shadow-md rounded-xl mt-8">
                <CardHeader><CardTitle className="text-gray-100">System Status</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {systemStatus.map(s => (
                    <div key={s.service} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {s.status === 'operational' && <CheckCircle2 size={16} className="text-teal-400" />}
                        {s.status === 'degraded' && <AlertCircle size={16} className="text-yellow-400" />}
                        {s.status === 'maintenance' && <Wrench size={16} className="text-blue-400" />}
                        {s.status === 'outage' && <XCircle size={16} className="text-red-400" />}
                        <span className="text-gray-300">{s.service}</span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        s.status === 'operational' ? 'bg-teal-600/10 text-teal-300' :
                        s.status === 'degraded' ? 'bg-yellow-600/10 text-yellow-300' :
                        s.status === 'maintenance' ? 'bg-blue-600/10 text-blue-300' :
                        'bg-red-600/10 text-red-300'
                      }`}>{s.status}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </aside>

            {/* RIGHT */}
            <main className="lg:w-2/3">
              <Card className="bg-[#1E2A44]/30 border border-[#2E7D7D]/30 shadow-md rounded-xl">
                <CardHeader><CardTitle className="text-gray-100">Gamified Support Tickets</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {tickets.map(t => <TicketCard key={t.id} t={t} />)}
                </CardContent>
              </Card>

              <Card className="bg-[#1E2A44]/30 border border-[#2E7D7D]/30 shadow-md rounded-xl mt-8">
                <CardHeader><CardTitle className="text-gray-100">Frequently Asked Questions</CardTitle></CardHeader>
                <CardContent className="divide-y divide-[#2E7D7D]/30">
                  {faqs.map((f, i) => (
                    <details key={i} className="group py-4">
                      <summary className="flex items-center justify-between cursor-pointer text-gray-100 hover:text-teal-300">
                        <span>{f.question}</span>
                        <ChevronRight className="group-open:rotate-90 transition-transform text-teal-400" size={16} />
                      </summary>
                      <p className="mt-2 text-gray-300 text-sm">{f.answer}</p>
                    </details>
                  ))}
                </CardContent>
              </Card>
            </main>
          </div>
        </div>
      </section>

      {/* AI AGENT (LOCAL, NO EXTERNAL AUTOMATION) */}
      <section className="py-16 bg-[#1E2A44]/30 border-t border-[#2E7D7D]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={false}
            animate={{ height: showAgent ? 'auto' : 64 }}
            className="bg-[#1E2A44]/50 border border-[#2E7D7D]/30 rounded-xl overflow-hidden shadow-lg"
          >
            <div
              onClick={() => setShowAgent((s) => !s)}
              className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-[#2E7D7D]/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-[#2E7D7D] text-xl">🤖</span>
                <div>
                  <p className="font-semibold text-gray-100">MutSyncHub AI Consultant</p>
                  <p className="text-xs text-gray-400">Opt-in • Voice + Text</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <span className="text-xs hidden sm:inline">{showAgent ? 'Minimize' : 'Expand'}</span>
                {showAgent ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
            </div>
            <AnimatePresence>
              {showAgent && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="px-4 pb-4"
                >
                  <SolutionsAgent context="support" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* FOOTER CTA (LOCAL LINKS ONLY) */}
      <section className="py-16 bg-[#1E2A44]/50 border-t border-[#2E7D7D]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-100 mb-4">Need Immediate Assistance?</h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">Our 24/7 support team is here to ensure your operations run smoothly. Contact us now.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button className="bg-teal-600 text-white hover:bg-teal-700 px-8 py-3 rounded-lg" onClick={() => setShowAgent(true)}>
              <MessageSquare className="mr-2" /> Start Live Chat
            </Button>
            <Button variant="outline" asChild className="border-teal-600 text-teal-400 hover:bg-teal-600/20 px-8 py-3 rounded-lg">
              <Link href="/resources">Explore Support Resources</Link>
            </Button>
          </div>
          <div className="mt-8 flex justify-center gap-6 text-sm font-medium text-gray-400">
            <Link href="/" className="hover:text-cyan-400 transition-colors">Home</Link>
            <Link href="/solutions" className="hover:text-cyan-400 transition-colors">Solutions</Link>
            <Link href="/resources" className="hover:text-cyan-400 transition-colors">Resources</Link>
          </div>
        </div>
      </section>
    </div>
  );
}