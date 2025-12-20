// src/app/what-we-do-support/page.tsx
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
  MessageSquare, LifeBuoy, Headset, Mail, Phone, Clock, Shield, 
  TrendingUp, Activity, ChevronRight, ChevronDown, ChevronUp, 
  CheckCircle2, AlertCircle, XCircle, Wrench, Star, Zap, Award,
  BookOpen, Search, Users, BarChart3, ArrowRight, Plus, X
} from 'lucide-react';
import { SiKubernetes, SiTerraform, SiReact, SiNodedotjs, SiRedis, SiPython, SiTensorflow, SiApachekafka } from 'react-icons/si';
import SolutionsAgent from '@/components/SolutionsAgent';

/* ----------  THEME ---------- */
const DEEP_NAVY = '#1E2A44';
const TEAL = '#2E7D7D';

/* ----------  FAQS WITH SEARCH ---------- */
const faqs = [
  { 
    question: 'How do I reset my password?', 
    answer: 'Click "Forgot Password" on the login page and follow the email instructions. If you don\'t receive the email within 5 minutes, check your spam folder or contact support.' 
  },
  { 
    question: 'What data sources do you support?', 
    answer: 'We support 150+ data sources including SQL databases (PostgreSQL, MySQL, SQL Server), NoSQL (MongoDB, Redis), cloud storage (S3, GCS, Azure), and SaaS apps (Salesforce, HubSpot, Stripe). See our integrations page for the full list.' 
  },
  { 
    question: 'How often is data synced?', 
    answer: 'Free plans: 24h; Professional: hourly; Enterprise: as frequent as 15 minutes. Real-time streaming available for Enterprise Plus.' 
  },
  { 
    question: 'Can I use MutSyncHub with my custom API?', 
    answer: 'Yes – we expose REST & GraphQL endpoints with detailed guides. Our engineering team can also help with custom implementations for Enterprise customers.' 
  },
  { 
    question: 'How secure is my data?', 
    answer: 'Encrypted in transit (TLS 1.3) and at rest (AES-256), SOC 2 Type II & ISO 27001 compliant. Enterprise customers get dedicated encryption keys and on-premise deployment options.' 
  },
  { 
    question: 'What happens if I exceed my plan limits?', 
    answer: 'You\'ll receive alerts at 80% and 95% usage. We never cut off service unexpectedly. You can upgrade instantly through your dashboard or contact your account manager.' 
  }
];

/* ----------  SUPPORT TIERS (ENTERPRISE-FOCUSED) ---------- */
const supportTiers = [
  {
    name: 'Community',
    description: 'For developers and small teams',
    features: ['Documentation', 'Community Forum', 'Email Support (48h)', 'Basic Status Page'],
    responseTime: '48 hours',
    availability: 'Business Hours',
    icon: <Users size={20} />
  },
  {
    name: 'Professional',
    description: 'For growing businesses',
    features: ['Email Support (4h)', 'Live Chat', 'Phone Support', 'Priority Queue', 'Extended Status History'],
    responseTime: '4 hours',
    availability: '24/5',
    icon: <Headset size={20} />
  },
  {
    name: 'Enterprise',
    description: 'For mission-critical operations',
    features: ['Dedicated Support Engineer', '15min Phone Response', 'SLA Guarantee', 'On-Premise Deployment', 'Custom Integrations'],
    responseTime: '15 minutes',
    availability: '24/7/365',
    icon: <Shield size={20} />
  }
];

/* ----------  MOCK TICKETS (GAMIFIED) ---------- */
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
      badge: '🔥',
      sla: '2h remaining'
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
      badge: '⚡',
      sla: '4h remaining'
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
      badge: '✅',
      sla: 'Completed'
    }
  ]);
  return tickets;
};

/* ----------  SYSTEM STATUS (REAL-TIME SIMULATION) ---------- */
const useSystemStatus = () => {
  const [status, setStatus] = useState([
    { service: 'API Services', status: 'operational', lastUpdated: new Date(), uptime: '99.99%', incidents: 0 },
    { service: 'Data Processing', status: 'operational', lastUpdated: new Date(), uptime: '99.97%', incidents: 1 },
    { service: 'Dashboard & Analytics', status: 'degraded', lastUpdated: new Date(), uptime: '98.5%', incidents: 2 },
    { service: 'Authentication', status: 'operational', lastUpdated: new Date(), uptime: '100%', incidents: 0 },
    { service: 'Integration Connectors', status: 'maintenance', lastUpdated: new Date(), uptime: '0%', incidents: 0 },
    { service: 'Notification System', status: 'operational', lastUpdated: new Date(), uptime: '99.95%', incidents: 1 }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(prev => prev.map(s => ({
        ...s,
        lastUpdated: new Date(),
        // Simulate minor changes
        incidents: s.status === 'operational' ? Math.max(0, s.incidents + (Math.random() > 0.9 ? 1 : 0)) : s.incidents
      })));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return status;
};

/* ----------  SELF-SERVICE TOOLS ---------- */
const SelfServiceTools = () => {
  const [running, setRunning] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, { success: boolean; message: string }>>({});

  const tools = [
    { id: 'diagnostics', name: 'Run Diagnostics', icon: <Activity size={18} />, description: 'Check system health' },
    { id: 'cache', name: 'Clear Cache', icon: <Zap size={18} />, description: 'Refresh data sources' },
    { id: 'logs', name: 'Download Logs', icon: <BookOpen size={18} />, description: 'Get debug logs' },
    { id: 'connection', name: 'Test Connections', icon: <TrendingUp size={18} />, description: 'Verify integrations' }
  ];

  const run = async (id: string) => {
    setRunning(id);
    // Simulate processing
    await new Promise(res => setTimeout(res, 2000));
    
    const success = Math.random() > 0.2;
    setResults(prev => ({ 
      ...prev, 
      [id]: { 
        success, 
        message: success 
          ? `${tools.find(t => t.id === id)?.name} completed successfully` 
          : `${tools.find(t => t.id === id)?.name} failed - please contact support` 
      } 
    }));
    setRunning(null);
  };

  return (
    <Card className="bg-[#1E2A44]/30 border border-[#2E7D7D]/30 shadow-md rounded-xl">
      <CardHeader>
        <CardTitle className="text-gray-100 flex items-center gap-2">
          <Wrench size={20} /> Self-Service Tools
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tools.map(t => (
            <div key={t.id} className="flex items-center justify-between p-3 bg-[#1E2A44]/50 rounded-lg border border-[#2E7D7D]/20">
              <div className="flex items-center gap-3">
                {running === t.id ? <Activity size={16} className="animate-pulse text-cyan-400" /> : t.icon}
                <div>
                  <p className="text-white text-sm">{t.name}</p>
                  <p className="text-gray-400 text-xs">{t.description}</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="border-[#2E7D7D] text-cyan-400 hover:bg-[#2E7D7D]/20"
                onClick={() => run(t.id)}
                disabled={running === t.id}
              >
                {running === t.id ? 'Running...' : 'Run'}
              </Button>
            </div>
          ))}
        </div>

        <AnimatePresence>
          {Object.entries(results).map(([id, result]) => (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mt-4 p-3 rounded-lg border ${
                result.success 
                  ? 'bg-green-600/10 border-green-600/30 text-green-300' 
                  : 'bg-red-600/10 border-red-600/30 text-red-300'
              }`}
            >
              <p className="text-sm">{result.message}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

/* ----------  MAIN COMPONENT ---------- */
export default function SupportPage() {
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAgent, setShowAgent] = useState(false);
  const tickets = useTickets();
  const systemStatus = useSystemStatus();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  // Filter FAQs based on search
  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#1E2A44] text-gray-100 font-inter overflow-x-hidden">
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
            24/7/365 support for your mission-critical operations. 98% satisfaction, &lt; 2h response time for Enterprise.
          </p>

          {/* Trust Indicators */}
          <div className="mt-8 flex justify-center gap-8 flex-wrap text-3xl text-cyan-400">
            <SiKubernetes title="Kubernetes Certified" />
            <SiTerraform title="Terraform Partner" />
            <SiReact title="React Enterprise" />
            <SiNodedotjs title="Node.js Foundation" />
            <SiRedis title="Redis Enterprise" />
            <SiPython title="Python Enterprise" />
            <SiTensorflow title="TensorFlow AI" />
            <SiApachekafka title="Kafka Certified" />
          </div>

          {/* Quick Actions */}
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Button
              className="bg-cyan-600 text-white hover:bg-cyan-700 px-8 py-3 rounded-lg font-semibold"
              onClick={() => setShowAgent(true)}
            >
              <MessageSquare className="mr-2" /> Start AI Chat
            </Button>
            <Link href="#self-service">
              <Button variant="outline" className="border-cyan-600 text-cyan-400 hover:bg-cyan-600/20 px-8 py-3 rounded-lg">
                <Wrench className="mr-2" /> Self-Service Tools
              </Button>
            </Link>
            <Link href="/solutions">
              <Button variant="outline" className="border-cyan-600 text-cyan-400 hover:bg-cyan-600/20 px-8 py-3 rounded-lg">
                View Solutions
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* SUPPORT TIERS */}
      <section className="py-16 bg-[#1E2A44]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-100 mb-4 text-center">Choose Your Support Level</h2>
          <p className="text-gray-300 text-center max-w-2xl mx-auto mb-12">From community resources to dedicated engineers, we have the right support for your business.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {supportTiers.map((tier, idx) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`bg-[#1E2A44]/30 border border-[#2E7D7D]/30 rounded-xl p-6 shadow-md hover:shadow-xl transition-all ${
                  tier.name === 'Enterprise' ? 'ring-1 ring-cyan-400/50' : ''
                }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  {tier.icon}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-100">{tier.name}</h3>
                    <p className="text-sm text-gray-400">{tier.description}</p>
                  </div>
                  {tier.name === 'Enterprise' && <Award className="text-cyan-400" size={20} />}
                </div>

                <div className="mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock size={14} className="text-cyan-400" />
                    <span className="text-gray-300">Response: {tier.responseTime}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm mt-1">
                    <Shield size={14} className="text-cyan-400" />
                    <span className="text-gray-300">{tier.availability}</span>
                  </div>
                </div>

                <ul className="space-y-2 mb-6">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                      <CheckCircle2 size={14} className="text-green-400" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button 
                  className={`w-full ${
                    tier.name === 'Enterprise' 
                      ? 'bg-cyan-600 text-white hover:bg-cyan-700' 
                      : 'border border-cyan-600 text-cyan-400 hover:bg-cyan-600/20'
                  }`}
                >
                  {tier.name === 'Community' ? 'Get Started' : 'Contact Sales'} <ArrowRight className="ml-2" size={14} />
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SYSTEM STATUS + SELF-SERVICE TOOLS */}
      <section id="self-service" className="py-16 bg-[#1E2A44]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* System Status */}
            <Card className="bg-[#1E2A44]/30 border border-[#2E7D7D]/30 shadow-md rounded-xl">
              <CardHeader>
                <CardTitle className="text-gray-100 flex items-center gap-2">
                  <Activity size={20} /> System Status
                  <span className="ml-auto text-xs text-gray-400">Updated every 30s</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {systemStatus.map(s => (
                    <div key={s.service} className="flex items-center justify-between p-3 bg-[#1E2A44]/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {s.status === 'operational' && <CheckCircle2 size={16} className="text-green-400" />}
                        {s.status === 'degraded' && <AlertCircle size={16} className="text-yellow-400" />}
                        {s.status === 'maintenance' && <Wrench size={16} className="text-blue-400" />}
                        {s.status === 'outage' && <XCircle size={16} className="text-red-400" />}
                        <div>
                          <p className="text-white text-sm">{s.service}</p>
                          <p className="text-gray-400 text-xs">Uptime: {s.uptime}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          s.status === 'operational' ? 'bg-green-600/10 text-green-300' :
                          s.status === 'degraded' ? 'bg-yellow-600/10 text-yellow-300' :
                          s.status === 'maintenance' ? 'bg-blue-600/10 text-blue-300' :
                          'bg-red-600/10 text-red-300'
                        }`}>{s.status}</span>
                        <p className="text-gray-500 text-xs mt-1">{s.incidents} incidents</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Self-Service Tools */}
            <SelfServiceTools />
          </div>
        </div>
      </section>

      {/* GAMIFIED TICKETS + FAQ */}
      <section className="py-16 bg-[#1E2A44]/50 border-t border-[#2E7D7D]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Support Tickets */}
            <Card className="bg-[#1E2A44]/30 border border-[#2E7D7D]/30 shadow-md rounded-xl">
              <CardHeader>
                <CardTitle className="text-gray-100 flex items-center gap-2">
                  <LifeBuoy size={20} /> Your Support Tickets <Award className="ml-2 text-cyan-400" size={16} />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tickets.map(t => (
                    <div key={t.id} className="p-4 bg-[#1E2A44]/50 rounded-lg border border-[#2E7D7D]/20 hover:border-[#2E7D7D]/50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-white font-medium">{t.title}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          t.status === 'open' ? 'bg-yellow-600/10 text-yellow-300' :
                          t.status === 'pending' ? 'bg-blue-600/10 text-blue-300' :
                          'bg-green-600/10 text-green-300'
                        }`}>{t.status}</span>
                      </div>
                      <p className="text-gray-400 text-sm mb-3">{t.description}</p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">ID: {t.id}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-cyan-400 flex items-center gap-1"><Star size={12} /> {t.xp} XP</span>
                          <span className="text-gray-500">{t.sla}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <Button className="w-full mt-4 border border-cyan-600 text-cyan-400 hover:bg-cyan-600/20">
                    <Plus size={14} className="mr-2" /> Create New Ticket
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* FAQ with Search */}
            <Card className="bg-[#1E2A44]/30 border border-[#2E7D7D]/30 shadow-md rounded-xl">
              <CardHeader>
                <CardTitle className="text-gray-100 flex items-center gap-2">
                  <BookOpen size={20} /> Knowledge Base <Search className="ml-2 text-cyan-400" size={16} />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder="Search FAQs..."
                  className="mb-4 bg-[#1E2A44]/50 border-[#2E7D7D]/30 text-white placeholder-gray-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredFaqs.map((faq, i) => (
                    <div key={i} className="border border-[#2E7D7D]/20 rounded-lg overflow-hidden">
                      <button
                        onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-[#1E2A44]/70 transition-colors"
                      >
                        <span className="text-white text-sm">{faq.question}</span>
                        {expandedFaq === i ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      <AnimatePresence>
                        {expandedFaq === i && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            className="overflow-hidden"
                          >
                            <p className="p-4 text-gray-300 text-sm border-t border-[#2E7D7D]/20">{faq.answer}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>

                {filteredFaqs.length === 0 && (
                  <p className="text-gray-400 text-center py-8">No results found. Try our AI consultant below.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* AI CONSULTANT MODAL */}
      <AnimatePresence>
        {showAgent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setShowAgent(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#1E2A44] border border-[#2E7D7D]/30 rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-[#2E7D7D]/30">
                <div className="flex items-center gap-3">
                  <span className="text-cyan-400 text-xl">🤖</span>
                  <div>
                    <p className="font-semibold text-gray-100">MutSyncHub AI Support</p>
                    <p className="text-xs text-gray-400">Ask about any technical issue</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAgent(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={20} />
                </Button>
              </div>
              <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
                <SolutionsAgent context="support" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FOOTER CTA */}
      <section className="py-16 bg-[#1E2A44]/70 border-t border-[#2E7D7D]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-100 mb-4">Still Need Help?</h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">Our engineering team is standing by for critical issues. Escalate to human support instantly.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button className="bg-red-600 text-white hover:bg-red-700 px-8 py-3 rounded-lg" onClick={() => setShowAgent(true)}>
              <MessageSquare className="mr-2" /> Emergency Support
            </Button>
            <Link href="mailto:support@mutsynchub.com">
              <Button variant="outline" className="border-cyan-600 text-cyan-400 hover:bg-cyan-600/20 px-8 py-3 rounded-lg">
                <Mail className="mr-2" /> Email Support
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}