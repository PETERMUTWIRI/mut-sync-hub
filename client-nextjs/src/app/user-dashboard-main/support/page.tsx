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
  replies: { authorEmail: string; body: string; createdAt: string }[];
};

type SystemStatus = {
  service: string;
  status: 'operational' | 'degraded' | 'maintenance' | 'outage';
  lastUpdated: string;
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

  /* ---------- render (full original UI) ---------- */
  return (
    <>
      <Toaster position="top-right" />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-[#1E2A44] text-white font-inter"
      >
        <div className="max-w-7xl mx-auto px-6 py-10">
          {/* ----- sticky header ----- */}
          <header className="sticky top-0 z-20 bg-[#1E2A44]/95 backdrop-blur-md border-b border-[#2E7D7D]/30 py-4 px-6">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
              <h1 className="text-2xl font-bold">Support Center</h1>
              <div className="flex gap-4">
                <Input type="text" placeholder="Search support..." className="bg-[#2E7D7D]/20 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D7D]" aria-label="Search support" />
                <Button className="bg-[#2E7D7D] text-white hover:bg-[#2E7D7D]/80" aria-label="Search" data-tooltip-id="search-tip" data-tooltip-content="Search support"><Search size={20} /></Button>
                <Tooltip id="search-tip" />
              </div>
            </div>
          </header>

          {/* ----- breadcrumb ----- */}
          <div className="mt-6">
            <Breadcrumb items={[{ name: 'Home', href: '/' }, { name: 'Support', href: '/support' }]} />
          </div>

          {/* ----- hero ----- */}
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-[#2E7D7D] mb-4">Support Center</h1>
            <p className="text-base text-gray-400 max-w-3xl mx-auto mb-8">
              Premium support services for your business-critical operations. Our experts are here to help 24/7.
            </p>
          </div>

          {/* ----- support channels ----- */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {supportChannels.map((ch, i) => (
              <motion.div key={i} whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
                <SupportChannelCard {...ch} aria-label={ch.title} data-tooltip-id={`ch-${i}`} data-tooltip-content={ch.title} />
                <Tooltip id={`ch-${i}`} />
              </motion.div>
            ))}
          </div>

          {/* ----- main content ----- */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* left column – contact & status */}
            <div className="lg:w-1/3">
              <motion.div whileHover={{ scale: 1.01 }} className="bg-[#2E7D7D]/10 rounded-xl shadow-lg p-6 mb-8">
                <h2 className="text-xl font-semibold text-[#2E7D7D] mb-4">Contact Support</h2>
                <div className="space-y-4">
                  {contactOptions.map((o, i) => (
                    <React.Fragment key={i}>
                      <ContactOption {...o} aria-label={o.title} data-tooltip-id={`co-${i}`} data-tooltip-content={o.title} />
                      <Tooltip id={`co-${i}`} />
                    </React.Fragment>
                  ))}
                </div>
              </motion.div>

              <motion.div whileHover={{ scale: 1.01 }} className="bg-[#2E7D7D]/10 rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-[#2E7D7D] mb-4">System Status</h2>
                <div className="space-y-4">
                  {isLoading ? (
                    <div className="text-gray-400">Loading status…</div>
                  ) : (
                    serviceStat.map((s, i) => <SystemStatusCard key={i} {...s} aria-label={`${s.service} status: ${s.status}`} />)
                  )}
                </div>
                <div className="mt-6 pt-4 border-t border-gray-600 text-xs text-gray-500">
                  <span className="font-medium">Status Legend:</span>{' '}
                  <span className="inline-flex items-center gap-1"><CheckCircle2 size={14} className="text-green-500" /> Operational</span>{' '}
                  <span className="inline-flex items-center gap-1"><AlertCircle size={14} className="text-yellow-500" /> Degraded</span>{' '}
                  <span className="inline-flex items-center gap-1"><Wrench size={14} className="text-blue-500" /> Maintenance</span>{' '}
                  <span className="inline-flex items-center gap-1"><XCircle size={14} className="text-red-500" /> Outage</span>
                </div>
              </motion.div>
            </div>

            {/* right column – tickets / knowledge / status */}
            <div className="lg:w-2/3">
              {/* tab nav */}
              <div className="flex border-b border-gray-600 mb-6">
                <button className={`py-3 px-4 font-medium text-sm border-b-2 ${activeTab === 'tickets' ? 'border-[#2E7D7D] text-[#2E7D7D]' : 'border-transparent text-gray-400 hover:text-gray-300'}`} onClick={() => setActiveTab('tickets')} aria-label="My Support Tickets">My Support Tickets</button>
                <button className={`py-3 px-4 font-medium text-sm border-b-2 ${activeTab === 'knowledge' ? 'border-[#2E7D7D] text-[#2E7D7D]' : 'border-transparent text-gray-400 hover:text-gray-300'}`} onClick={() => setActiveTab('knowledge')} aria-label="Knowledge Base">Knowledge Base</button>
                <button className={`py-3 px-4 font-medium text-sm border-b-2 ${activeTab === 'status' ? 'border-[#2E7D7D] text-[#2E7D7D]' : 'border-transparent text-gray-400 hover:text-gray-300'}`} onClick={() => setActiveTab('status')} aria-label="System Status">System Status</button>
              </div>

              {/* tab content card */}
              <motion.div whileHover={{ scale: 1.01 }} className="bg-[#2E7D7D]/10 rounded-xl shadow-lg overflow-hidden">
                {activeTab === 'tickets' && (
                  <div>
                    <div className="px-6 py-4 border-b border-gray-600 flex justify-between items-center">
                      <h3 className="text-lg font-medium text-white">My Support Tickets</h3>
                      <Button className="flex items-center gap-1 bg-[#2E7D7D] hover:bg-[#2E7D7D]/80 text-white px-4 py-2 rounded-lg text-sm font-medium" onClick={() => setShowTicketModal(true)} aria-label="Create new ticket" data-tooltip-id="new-ticket" data-tooltip-content="Create new ticket"><Plus size={16} /> New Ticket</Button>
                      <Tooltip id="new-ticket" />
                    </div>
                    <div className="divide-y divide-gray-600">
                      {isLoading ? (
                        <div className="p-12 text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2E7D7D] mx-auto"></div><p className="mt-4 text-gray-500">Loading your tickets…</p></div>
                      ) : tickets.length === 0 ? (
                        <div className="p-12 text-center"><p className="text-gray-500">No support tickets yet.</p><Button className="mt-4 text-[#2E7D7D] hover:text-[#2E7D7D]/80 font-medium" onClick={() => setShowTicketModal(true)} aria-label="Create your first ticket">Create your first ticket</Button></div>
                      ) : (
                        tickets.map((t) => <SupportTicketCard key={t.id} ticket={t} aria-label={`Ticket: ${t.title}`} />)
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'knowledge' && (
                  <div className="p-6"><FaqAccordion faqs={faqs} aria-label="Frequently Asked Questions" /></div>
                )}

                {activeTab === 'status' && (
                  <div className="p-6">
                    <div className="mb-6">
                      <div className="flex items-center gap-3 mb-2"><div className="bg-[#2E7D7D]/20 rounded-lg p-2 text-[#2E7D7D]"><CheckCircle2 size={24} /></div><div><h3 className="font-medium text-white">All Systems Operational</h3><p className="text-gray-500 text-sm">Last updated on {new Date().toLocaleDateString()}</p></div></div>
                    </div>
                    <div className="border-t border-gray-600 pt-4">
                      <h3 className="font-medium text-white mb-3">Component Status</h3>
                      <div className="space-y-3">
                        {serviceStat.map((s, i) => (
                          <div key={i} className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              {s.status === 'operational' && <CheckCircle2 size={16} className="text-green-500" />}
                              {s.status === 'degraded' && <AlertCircle size={16} className="text-yellow-500" />}
                              {s.status === 'maintenance' && <Wrench size={16} className="text-blue-500" />}
                              {s.status === 'outage' && <XCircle size={16} className="text-red-500" />}
                              <span className="text-gray-300">{s.service}</span>
                            </div>
                            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${s.status === 'operational' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : s.status === 'degraded' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' : s.status === 'maintenance' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}`} aria-label={`${s.service} status: ${s.status}`}>{s.status.charAt(0).toUpperCase() + s.status.slice(1)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>

              {/* FAQ section */}
              <motion.div whileHover={{ scale: 1.01 }} className="mt-8">
                <div className="bg-[#2E7D7D]/10 rounded-xl shadow-lg p-6">
                  <h2 className="text-xl font-bold text-[#2E7D7D] mb-6">Frequently Asked Questions</h2>
                  <FaqAccordion faqs={faqs} aria-label="Frequently Asked Questions" />
                </div>
              </motion.div>
            </div>
          </div>

          {/* ----- create ticket modal ----- */}
          <AnimatePresence>
            {showTicketModal && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60"
                role="dialog"
                aria-modal="true"
                aria-labelledby="create-ticket-modal-title"
              >
                <div className="bg-[#1E2A44] rounded-2xl p-8 w-full max-w-md shadow-2xl border border-[#2E7D7D]/30 relative">
                  <button className="absolute top-3 right-4 text-white text-xl" onClick={() => setShowTicketModal(false)} aria-label="Close modal">&times;</button>
                  <h2 id="create-ticket-modal-title" className="text-xl font-bold text-white mb-4">Create New Support Ticket</h2>
                  <form onSubmit={handleCreateTicket} className="space-y-4">
                    <div>
                      <label htmlFor="ticket-title" className="text-[#2E7D7D]">Title</label>
                      <Input id="ticket-title" name="title" value={ticketForm.title} onChange={handleTicketChange} className="bg-[#2E7D7D]/20 border-[#2E7D7D]/30 text-white focus:ring-2 focus:ring-[#2E7D7D]" required aria-label="Ticket title" />
                    </div>
                    <div>
                      <label htmlFor="ticket-description" className="text-[#2E7D7D]">Description</label>
                      <textarea id="ticket-description" name="description" value={ticketForm.description} onChange={handleTicketChange} className="bg-[#2E7D7D]/20 border-[#2E7D7D]/30 text-white w-full p-2 rounded-lg focus:ring-2 focus:ring-[#2E7D7D]" rows={4} required aria-label="Ticket description" />
                    </div>
                    <div>
                      <label htmlFor="ticket-priority" className="text-[#2E7D7D]">Priority</label>
                      <Select name="priority" value={ticketForm.priority} onValueChange={(v) => setTicketForm({ ...ticketForm, priority: v })}>
                        <SelectTrigger className="bg-[#2E7D7D]/20 border-[#2E7D7D]/30 text-white focus:ring-2 focus:ring-[#2E7D7D]">
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="critical">Critical</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {ticketError && <div className="text-red-400 text-sm mb-2">{ticketError}</div>}
                    {ticketSuccess && <div className="text-green-400 text-sm mb-2">{ticketSuccess}</div>}
                    <div className="flex gap-2">
                      <Button type="submit" className="w-full bg-[#2E7D7D] text-white font-bold hover:bg-[#2E7D7D]/80" aria-label="Create ticket">Create</Button>
                      <Button variant="outline" className="w-full text-[#2E7D7D] border-[#2E7D7D]" type="button" onClick={() => setShowTicketModal(false)} aria-label="Cancel">Cancel</Button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ----- live chat widget ----- */}
          <LiveChatWidget isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} aria-label="Live chat" />
        </div>
      </motion.div>
      <Toaster position="top-right" />
    </>
  );
}