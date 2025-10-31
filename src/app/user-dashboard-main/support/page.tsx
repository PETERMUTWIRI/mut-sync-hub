// client-nextjs/src/app/support/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@stackframe/stack';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import { Tooltip } from 'react-tooltip';
import {
  LifeBuoy,
  MessageSquare,
  BookOpen,
  Users,
  AlertCircle,
  Plus,
  Search,
  ChevronRight,
  Mail,
  Phone,
  Wrench,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { createSupportTicket } from '@/app/actions/support';
import { useSupportTickets, useServiceStatus } from '@/lib/useSupport';

// ----- dynamic imports -----
const SupportTicketCard   = dynamic(() => import('@/components/support/SupportTicketCard'),   { ssr: false });
const SupportChannelCard  = dynamic(() => import('@/components/support/SupportChannelCard'),  { ssr: false });
const KnowledgeBaseSearch = dynamic(() => import('@/components/support/KnowledgeBaseSearch'), { ssr: false });
const SystemStatusCard    = dynamic(() => import('@/components/support/SystemStatusCard'),    { ssr: false });
const FaqAccordion        = dynamic(() => import('@/components/support/FaqAccordion'),        { ssr: false });
const StatusBadge         = dynamic(() => import('@/components/support/StatusBadge'),        { ssr: false });
const PriorityIndicator   = dynamic(() => import('@/components/support/PriorityIndicator'),  { ssr: false });
const Breadcrumb          = dynamic(() => import('@/components/resources/Breadcrumb'),       { ssr: false });
const ContactOption       = dynamic(() => import('@/components/support/ContactOption'),      { ssr: false });
const LiveChatWidget      = dynamic(() => import('@/components/support/LiveChatWidget'),     { ssr: false });
const Input               = dynamic(() => import('@/components/ui/input').then(m => m.Input), { ssr: false });
const Button              = dynamic(() => import('@/components/ui/button').then(m => m.Button),{ ssr: false });
const Select              = dynamic(() => import('@/components/ui/select').then(m => m.Select),{ ssr: false });
const SelectContent       = dynamic(() => import('@/components/ui/select').then(m => m.SelectContent),{ ssr: false });
const SelectItem          = dynamic(() => import('@/components/ui/select').then(m => m.SelectItem),{ ssr: false });
const SelectTrigger       = dynamic(() => import('@/components/ui/select').then(m => m.SelectTrigger),{ ssr: false });
const SelectValue         = dynamic(() => import('@/components/ui/select').then(m => m.SelectValue),{ ssr: false });

/* ---------- types ---------- */
type Ticket = {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'pending' | 'resolved' | 'closed';
  priority: 'critical' | 'high' | 'medium' | 'low';
  createdAt: string;
  assignee: string | null;
  SupportReply: { authorEmail: string; body: string; createdAt: string }[];
};



 type ServiceStatus = {
   service: string;
   status: 'operational' | 'degraded' | 'maintenance' | 'outage';
   lastUpdated: string; // 
  };

/* ---------- page ---------- */
export default function SupportPage() {
  const user = useUser({ or: 'redirect' });
  const router = useRouter();

  /* ---------- live data ---------- */
  const userEmail = (user as any)?.primaryEmail || '';
  const { tickets, isLoading } = useSupportTickets(userEmail);
  const serviceStat = useServiceStatus();

  /* ---------- local state ---------- */
  const [activeTab, setActiveTab] = useState<'tickets' | 'knowledge' | 'status'>('tickets');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketForm, setTicketForm] = useState({ title: '', description: '', priority: 'medium' });
  const [ticketError, setTicketError] = useState('');
  const [ticketSuccess, setTicketSuccess] = useState('');

  /* ---------- static content (unchanged) ---------- */
  const supportChannels = [
    { icon: <MessageSquare size={24} />, title: 'Live Chat', description: 'Get immediate assistance from our support team', actionText: 'Start Chat', onClick: () => setIsChatOpen(true), color: 'bg-[#2E7D7D]/10 text-[#2E7D7D]' },
    { icon: <LifeBuoy size={24} />,       title: 'Support Ticket', description: 'Submit a ticket for non-urgent issues', actionText: 'Create Ticket', onClick: () => setShowTicketModal(true), color: 'bg-[#2E7D7D]/10 text-[#2E7D7D]' },
    { icon: <BookOpen size={24} />,       title: 'Knowledge Base', description: 'Find answers in our documentation', actionText: 'Browse Articles', onClick: () => setActiveTab('knowledge'), color: 'bg-[#2E7D7D]/10 text-[#2E7D7D]' },
    { icon: <Users size={24} />,          title: 'Community Forum', description: 'Ask the community for help', actionText: 'Visit Forum', onClick: () => router.push('https://community.mutsynhub.com'), color: 'bg-[#2E7D7D]/10 text-[#2E7D7D]' },
  ];

  const contactOptions = [
    { icon: <Mail size={20} />, title: 'Email Support', details: 'support@mutsynhub.com', actionText: 'Send Email', href: 'mailto:support@mutsynhub.com' },
    { icon: <Phone size={20} />, title: 'Phone Support', details: '+1 (800) 123-4567', actionText: 'Call Now', href: 'tel:+18001234567' },
    { icon: <MessageSquare size={20} />, title: '24/7 Chat', details: 'Available around the clock', actionText: 'Start Chat', href: '#', onClick: () => setIsChatOpen(true) },
  ];

  const faqs = [
    { question: 'How do I reset my password?', answer: 'Click “Forgot Password” on the login page.' },
    { question: 'What data sources do you support?', answer: 'SQL, NoSQL, cloud storage, SaaS APIs – check Integrations page.' },
    { question: 'How often is data synced?', answer: 'Free: 24 h; paid: as low as 15 min.' },
    { question: 'Can I use MUTSYNCHUB with my custom API?', answer: 'Yes – REST or GraphQL via our connector framework.' },
    { question: 'How secure is my data?', answer: 'Encrypted in transit & at rest; SOC 2 & ISO 27001 compliant.' },
  ];

  /* ---------- handlers ---------- */
  const handleTicketChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setTicketForm({ ...ticketForm, [e.target.name]: e.target.value });
    setTicketError(''); setTicketSuccess('');
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketForm.title || !ticketForm.description || !ticketForm.priority) {
      setTicketError('All fields are required'); toast.error('All fields required'); return;
    }
    try {
      await createSupportTicket({
        title: ticketForm.title,
        description: ticketForm.description,
        priority: ticketForm.priority,
        user_email: (user as any)?.primaryEmail || '',
      });
      setTicketSuccess('Ticket created successfully'); toast.success('Ticket created');
      setTicketForm({ title: '', description: '', priority: 'medium' });
      setShowTicketModal(false);
      setTimeout(() => setTicketSuccess(''), 3000);
    } catch (err: any) {
      setTicketError(err.message); toast.error(err.message);
      setTimeout(() => setTicketError(''), 3000);
    }
  };
 
   /* ---------- fake stubs (wire to real data later) ---------- */
  const usagePercent = 72;
  const monthSpend = 128_500;
  const sparkPoints = '0,40 20,25 40,30 60,15 80,20 100,10';
  const avgQuery = 123;
  const scheduleHealth = Array(20).fill(true);
  const unread = 3;
  const anomalies = 7;
  const confidence = 91;
  const insight = 'Your nightly jobs run 30 % faster on weekdays—consider scaling down on weekends.';

  /* ---------- safety guards ---------- */
  const safeTickets = Array.isArray(tickets) ? tickets : [];
  const safeServiceStat = Array.isArray(serviceStat) ? serviceStat : [];

  return (
    <>
      <Toaster position="top-right" />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-[#0B1020] text-gray-100 font-inter"
      >
        {/* -------------- HEADER -------------- */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-[#0B1020]/80 backdrop-blur-xl border-b border-white/10"
        >
          <h1 className="text-2xl font-bold">Support Center</h1>
          <div className="flex gap-4">
            <Input
              type="text"
              placeholder="Search support..."
              className="w-64 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
            <Button
              className="bg-cyan-500 text-black hover:bg-cyan-400"
              aria-label="Search"
            >
              <Search size={20} />
            </Button>
          </div>
        </motion.header>

        <main className="p-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 1️⃣  LEFT – CONTACT & STATUS  */}
          <div className="lg:col-span-1 space-y-6">
            {/* Contact */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md"
            >
              <h2 className="text-xl font-semibold text-cyan-400 mb-4">Contact Support</h2>
              <div className="space-y-3">
                {contactOptions.map((o, i) => (
                  <a
                    key={i}
                    href={o.href}
                    onClick={o.onClick}
                    className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition"
                  >
                    <div className="text-cyan-400">{o.icon}</div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{o.title}</div>
                      <div className="text-xs text-gray-400">{o.details}</div>
                    </div>
                    <ChevronRight size={16} className="text-gray-500" />
                  </a>
                ))}
              </div>
            </motion.div>

            {/* System Status */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md"
            >
              <h2 className="text-xl font-semibold text-cyan-400 mb-4">System Status</h2>
              {isLoading ? (
                <div className="text-gray-400">Loading…</div>
              ) : (
                safeServiceStat.map((s: ServiceStatus, i: number) => (
                  <div key={i} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2">
                      {s.status === 'operational' && <CheckCircle2 size={16} className="text-green-500" />}
                      {s.status === 'degraded' && <AlertCircle size={16} className="text-yellow-500" />}
                      {s.status === 'maintenance' && <Wrench size={16} className="text-blue-500" />}
                      {s.status === 'outage' && <XCircle size={16} className="text-red-500" />}
                      <span className="text-gray-300">{s.service}</span>
                    </div>
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-white/10 text-gray-200">
                      {s.status}
                    </span>
                  </div>
                ))
              )}
            </motion.div>
          </div>

          {/* 2️⃣  RIGHT – TICKETS / KB / STATUS  */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tab bar */}
            <div className="flex border-b border-white/10">
              {(['tickets', 'knowledge', 'status'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-3 px-4 text-sm font-medium border-b-2 transition ${
                    activeTab === tab
                      ? 'border-cyan-400 text-cyan-400'
                      : 'border-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  {tab === 'tickets' && 'My Tickets'}
                  {tab === 'knowledge' && 'Knowledge Base'}
                  {tab === 'status' && 'System Status'}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md"
            >
              {activeTab === 'tickets' && (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-white">Support Tickets</h3>
                    <Button
                      onClick={() => setShowTicketModal(true)}
                      className="bg-cyan-500 text-black hover:bg-cyan-400"
                    >
                      <Plus size={16} className="mr-2" />
                      New Ticket
                    </Button>
                  </div>
                  {isLoading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-cyan-400 mx-auto" />
                      <p className="mt-4 text-gray-400">Loading tickets…</p>
                    </div>
                  ) : safeTickets.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-400">No tickets yet.</p>
                      <Button
                        onClick={() => setShowTicketModal(true)}
                        className="mt-4 text-cyan-400 hover:text-cyan-300"
                      >
                        Create your first ticket
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {safeTickets.map((t: Ticket) => (
                        <SupportTicketCard key={t.id} ticket={t} />
                      ))}
                    </div>
                  )}
                </>
              )}

              {activeTab === 'knowledge' && (
                <>
                  <h3 className="text-lg font-medium text-white mb-4">Knowledge Base</h3>
                  <FaqAccordion faqs={faqs} />
                </>
              )}

              {activeTab === 'status' && (
                <>
                  <h3 className="text-lg font-medium text-white mb-4">Component Status</h3>
                  <div className="space-y-3">
                    {safeServiceStat.map((s: ServiceStatus, i: number) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {s.status === 'operational' && <CheckCircle2 size={16} className="text-green-500" />}
                          {s.status === 'degraded' && <AlertCircle size={16} className="text-yellow-500" />}
                          {s.status === 'maintenance' && <Wrench size={16} className="text-blue-500" />}
                          {s.status === 'outage' && <XCircle size={16} className="text-red-500" />}
                          <span className="text-gray-300">{s.service}</span>
                        </div>
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-white/10 text-gray-200">
                          {s.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </motion.div>

            {/* FAQ */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md"
            >
              <h3 className="text-lg font-medium text-white mb-4">Frequently Asked Questions</h3>
              <FaqAccordion faqs={faqs} />
            </motion.div>
          </div>
        </main>

        {/* ---------- Create-Ticket Modal ---------- */}
        <AnimatePresence>
          {showTicketModal && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
              role="dialog"
              aria-modal="true"
            >
              <div className="bg-[#0B1020] border border-white/10 rounded-2xl p-6 w-full max-w-md backdrop-blur-md">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">New Support Ticket</h3>
                  <button
                    onClick={() => setShowTicketModal(false)}
                    className="text-gray-400 hover:text-white"
                    aria-label="Close modal"
                  >
                    <XCircle size={20} />
                  </button>
                </div>
                <form onSubmit={handleCreateTicket} className="space-y-4">
                  <Input
                    name="title"
                    value={ticketForm.title}
                    onChange={handleTicketChange}
                    placeholder="Title"
                    className="bg-white/5 border border-white/10 text-white"
                    required
                  />
                  <textarea
                    name="description"
                    value={ticketForm.description}
                    onChange={handleTicketChange}
                    placeholder="Description"
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    required
                  />
                  <Select
                    value={ticketForm.priority}
                    onValueChange={(v) => setTicketForm({ ...ticketForm, priority: v })}
                  >
                    <SelectTrigger className="bg-white/5 border border-white/10 text-white">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                  {ticketError && <p className="text-red-400 text-sm">{ticketError}</p>}
                  {ticketSuccess && <p className="text-green-400 text-sm">{ticketSuccess}</p>}
                  <div className="flex gap-3">
                    <Button type="submit" className="flex-1 bg-cyan-500 text-black hover:bg-cyan-400">
                      Create
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowTicketModal(false)}
                      className="flex-1 text-cyan-400 border-cyan-400 hover:bg-cyan-400/10"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ---------- Live-Chat Widget ---------- */}
        <LiveChatWidget isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
        </motion.div>
      </>
    );
  }