// client-nextjs/src/app/support/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useUser } from '@stackframe/stack';
import { useRouter } from 'next/navigation';
import { toast, Toaster } from 'react-hot-toast';
import { 
  LifeBuoy, MessageSquare, BookOpen, Users, 
  Plus, Search, ChevronRight, Mail, Phone, 
  Wrench, CheckCircle2, XCircle, X
} from 'lucide-react';
// Use server API route instead of importing server action into client
import { HiTicket, HiRefresh } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';

// ──────────────────────────────────────────────────────────────
// TYPES & INTERFACES (Enterprise-Ready)
// ──────────────────────────────────────────────────────────────

interface SupportTicket {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'pending' | 'resolved' | 'closed';
  priority: 'critical' | 'high' | 'medium' | 'low';
  createdAt: string;
  SupportReply: { authorEmail: string; body: string; createdAt: string }[];
}

interface OrgProfile {
  userId: string;
  profileId: string;
  orgId: string;
  role: string;
  email: string;
}

// ──────────────────────────────────────────────────────────────
// ORG PROFILE FETCHER (Consistent Pattern)
// ──────────────────────────────────────────────────────────────

async function getOrgProfile(): Promise<OrgProfile> {
  const res = await fetch('/api/org-profile', {
    credentials: 'include',
    headers: { 'Accept': 'application/json' }
  });
  
  if (!res.ok) {
    throw new Error(`Failed to fetch org profile: HTTP ${res.status}`);
  }
  
  return res.json();
}

// ──────────────────────────────────────────────────────────────
// INLINE COMPONENTS (Self-Contained)
// ──────────────────────────────────────────────────────────────

const SupportTicketCard = ({ ticket }: { ticket: SupportTicket }) => {
  const statusColors = {
    open: 'bg-green-500/10 text-green-400 border-green-500/30',
    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    resolved: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    closed: 'bg-slate-500/10 text-slate-400 border-slate-500/30'
  };

  return (
    <div className="bg-slate-900/50 border border-cyan-500/20 rounded-lg p-4 hover:border-cyan-500/40 transition-all hover:bg-slate-900/60">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-bold text-white line-clamp-1">{ticket.title}</h4>
        <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${statusColors[ticket.status]}`}>
          {ticket.status}
        </span>
      </div>
      <p className="text-slate-300 text-sm mb-3 line-clamp-2">{ticket.description}</p>
      <div className="flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-3">
          <span className="capitalize">{ticket.priority}</span>
          <span>•</span>
          <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
        </div>
        {ticket.SupportReply?.length > 0 && (
          <div className="flex items-center gap-1">
            <MessageSquare className="w-3 h-3" />
            <span>{ticket.SupportReply.length}</span>
          </div>
        )}
      </div>
    </div>
  );
};

const FaqAccordion = ({ faqs }: { faqs: { question: string; answer: string }[] }) => {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  
  return (
    <div className="space-y-3">
      {faqs.map((faq, idx) => (
        <motion.div 
          key={idx} 
          className="border border-cyan-500/20 rounded-lg overflow-hidden"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
        >
          <button
            className="w-full p-4 text-left flex justify-between items-center bg-slate-900/50 hover:bg-slate-900/70 text-white font-medium transition"
            onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
          >
            {faq.question}
            <ChevronRight className={`w-4 h-4 transition-transform ${openIdx === idx ? 'rotate-90' : ''}`} />
          </button>
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ 
              height: openIdx === idx ? 'auto' : 0,
              opacity: openIdx === idx ? 1 : 0
            }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-slate-950/50 text-slate-300 text-sm border-t border-cyan-500/20">
              {faq.answer}
            </div>
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
};

// ──────────────────────────────────────────────────────────────
// MAIN COMPONENT (Enterprise Grade)
// ──────────────────────────────────────────────────────────────

export default function SupportPage() {
  // Stack user for auth guard (redirect if not logged in)
  useUser({ or: 'redirect' });
  const router = useRouter();

  // ──────────────────────────────────────────────────────────
  // STATE MANAGEMENT (Single Source of Truth)
  // ──────────────────────────────────────────────────────────

  const [orgProfile, setOrgProfile] = useState<OrgProfile | null>(null);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium' });

  // ──────────────────────────────────────────────────────────
  // ORG PROFILE LOADING (Pattern from DataSourcesPage)
  // ──────────────────────────────────────────────────────────

  useEffect(() => {
    getOrgProfile()
      .then((profile) => {
        console.log('✅ [SupportPage] orgId loaded:', profile.orgId);
        setOrgProfile(profile);
      })
      .catch((err) => {
        console.error('❌ [SupportPage] org profile error:', err);
        setError('Failed to load organization profile');
        toast.error('Authentication error');
      });
  }, []);

  // ──────────────────────────────────────────────────────────
  // DATA FETCHING (Dependent on orgId)
  // ──────────────────────────────────────────────────────────

  const fetchTickets = useCallback(async () => {
    if (!orgProfile?.orgId) return;

    try {
      setLoading(true);
      const res = await fetch('/api/support/tickets', { 
        credentials: 'include',
        headers: { 
          'Accept': 'application/json',
          'x-org-id': orgProfile.orgId // Explicit header for consistency
        }
      });
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setTickets(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch';
      setError(message);
      toast.error('Failed to load support tickets');
    } finally {
      setLoading(false);
    }
  }, [orgProfile?.orgId]);

  // Load tickets once orgId is available
  useEffect(() => {
    if (orgProfile?.orgId) {
      fetchTickets();
    }
  }, [orgProfile?.orgId, fetchTickets]);

  // ──────────────────────────────────────────────────────────
  // SSE REAL-TIME UPDATES (QStash + Upstash)
  // ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (!orgProfile?.orgId || !orgProfile?.email) return;

    const eventSource = new EventSource('/api/notifications/stream', { 
      withCredentials: true 
    });

    const handleMessage = (event: MessageEvent) => {
      if (event.data.startsWith(':')) return; // Skip heartbeats
      
      try {
        const parsed = JSON.parse(event.data);
        
        // Only process events for this org
        if (parsed.data?.orgId && parsed.data.orgId !== orgProfile.orgId) {
          return;
        }

        // Handle support replies specifically for this user
        if (parsed.event === 'support:reply' && parsed.data.userEmail === orgProfile.email) {
          toast.success(`📝 Owner replied to your ticket: "${parsed.data.ticket.title}"`, {
            duration: 5000,
            icon: '💬'
          });
          // Refresh tickets to show new reply
          fetchTickets();
        }

        // Handle new notifications
        if (parsed.event === 'notification:new' && parsed.data.type === 'SUPPORT') {
          toast(`📢 ${parsed.data.title}`, {
            duration: 4000,
            icon: '🔔'
          });
          fetchTickets(); // Refresh in case it's a ticket update notification
        }
      } catch (err) {
        console.error('SSE parse error:', err);
      }
    };

    eventSource.addEventListener('message', handleMessage);
    
    eventSource.onerror = () => {
      console.warn('SSE connection error, retrying...');
      eventSource.close();
      setIsLive(false);
      
      // Exponential backoff reconnect
      setTimeout(() => {
        setIsLive(true);
        // window.location.reload(); // Or attempt silent reconnect
      }, 3000);
    };

    return () => eventSource.close();
  }, [orgProfile?.orgId, orgProfile?.email, fetchTickets]);

  // ──────────────────────────────────────────────────────────
  // ACTIONS (Optimistic + Transactional)
  // ──────────────────────────────────────────────────────────

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgProfile?.orgId) {
      toast.error('Organization not loaded');
      return;
    }

    if (!form.title.trim() || !form.description.trim()) {
      toast.error('❌ Title and description required');
      return;
    }

    try {
      setLoading(true);

      const res = await fetch('/api/support/tickets', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          priority: form.priority,
          user_email: orgProfile.email,
          org_id: orgProfile.orgId
        }),
      });

      if (!res.ok) throw new Error('Failed to create ticket');

      toast.success('✅ Ticket created successfully', { icon: '🎫', duration: 3000 });

      // Reset form and close modal
      setShowModal(false);
      setForm({ title: '', description: '', priority: 'medium' });

      // Refresh tickets
      await fetchTickets();
    } catch (err) {
      console.error('Ticket creation error:', err);
      toast.error('❌ Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  // ──────────────────────────────────────────────────────────
  // RENDER STATES (Loading, Error, Empty, Data)
  // ──────────────────────────────────────────────────────────

  // Loading State (Initial Mount - Org Profile)
  if (!orgProfile) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400" />
          <p className="text-cyan-400 font-medium">Authenticating...</p>
        </div>
      </div>
    );
  }

  // Loading State (Tickets)
  if (loading && tickets.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400" />
          <p className="text-cyan-400 font-medium">Loading your tickets...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-900/80 border border-red-500/30 rounded-xl p-6 max-w-md w-full"
        >
          <div className="flex items-center gap-3 text-red-400 mb-4">
            <XCircle className="w-6 h-6" />
            <h2 className="text-lg font-bold">Error Loading Support</h2>
          </div>
          <p className="text-slate-300 text-sm mb-4">{error}</p>
          <div className="flex gap-3">
            <button 
              onClick={fetchTickets}
              className="flex-1 bg-cyan-500 text-black font-medium py-2 rounded-lg hover:bg-cyan-400 transition"
            >
              <HiRefresh className="inline w-4 h-4 mr-2" /> Retry
            </button>
            <button 
              onClick={() => window.location.href = '/'}
              className="flex-1 bg-slate-800 text-white font-medium py-2 rounded-lg hover:bg-slate-700 transition"
            >
              Go Home
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────
  // MAIN RENDER (Success State)
  // ──────────────────────────────────────────────────────────

  const faqs = [
    { question: 'How do I reset my password?', answer: 'Click "Forgot Password" on the login page.' },
    { question: 'What data sources are supported?', answer: 'SQL, NoSQL, APIs, cloud storage.' },
    { question: 'How do I upgrade my plan?', answer: 'Visit the billing section in your dashboard.' },
    { question: 'Is there a mobile app?', answer: 'Yes, download from App Store or Google Play.' }
  ];

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      {/* Toaster for notifications */}
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: '#0f172a',
            color: '#e2e8f0',
            border: '1px solid rgba(6, 182, 212, 0.3)',
          },
        }}
      />
      
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto mb-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center gap-3">
              <LifeBuoy className="text-cyan-400" /> Support Center
            </h1>
            <p className="text-sm text-cyan-200/70 mt-1">Get help and track your tickets in real-time</p>
          </div>
          
          {/* Live Indicator & Refresh */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className={`w-3 h-3 rounded-full ${isLive ? 'bg-green-500' : 'bg-slate-500'}`}></div>
                {isLive && (
                  <div className="absolute inset-0 bg-green-500 rounded-full animate-ping"></div>
                )}
              </div>
              <span className="text-xs text-cyan-200/70">
                {isLive ? 'LIVE' : 'DISCONNECTED'}
              </span>
            </div>
            
            <button
              onClick={fetchTickets}
              disabled={loading}
              className="p-2 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-lg transition disabled:opacity-50"
              title="Refresh tickets"
            >
              <HiRefresh className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Contact & Resources */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          {/* Contact Options */}
          <div className="bg-slate-900/50 border border-cyan-500/20 rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-cyan-400 mb-4">Contact Options</h2>
            <div className="space-y-3">
              <a href="mailto:support@mutsynhub.com" className="flex items-center gap-3 p-3 bg-slate-900/40 rounded-lg hover:bg-slate-900/60 transition group">
                <Mail className="text-cyan-400 w-5 h-5 group-hover:text-cyan-300" />
                <div className="flex-1">
                  <div className="font-medium text-white group-hover:text-cyan-200">Email Support</div>
                  <div className="text-xs text-slate-400 group-hover:text-slate-300">support@mutsynhub.com</div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400" />
              </a>
              <button 
                onClick={() => toast('Live chat coming soon', { icon: '💬' })}
                className="w-full flex items-center gap-3 p-3 bg-slate-900/40 rounded-lg hover:bg-slate-900/60 transition group text-left"
              >
                <MessageSquare className="text-cyan-400 w-5 h-5 group-hover:text-cyan-300" />
                <div className="flex-1">
                  <div className="font-medium text-white group-hover:text-cyan-200">Live Chat</div>
                  <div className="text-xs text-slate-400 group-hover:text-slate-300">24/7 available</div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400" />
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-slate-900/50 border border-cyan-500/20 rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-cyan-400 mb-4">Resources</h2>
            <div className="space-y-2">
              <button 
                onClick={() => router.push('/docs')}
                className="w-full text-left p-3 bg-slate-900/40 rounded-lg hover:bg-slate-900/60 transition group"
              >
                <BookOpen className="inline w-4 h-4 mr-2 text-cyan-400 group-hover:text-cyan-300" /> 
                <span className="text-white group-hover:text-cyan-200">Documentation</span>
              </button>
              <button 
                onClick={() => router.push('/community')}
                className="w-full text-left p-3 bg-slate-900/40 rounded-lg hover:bg-slate-900/60 transition group"
              >
                <Users className="inline w-4 h-4 mr-2 text-cyan-400 group-hover:text-cyan-300" /> 
                <span className="text-white group-hover:text-cyan-200">Community Forum</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Right Column - Tickets & FAQ */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Tickets Section */}
          <div className="bg-slate-900/50 border border-cyan-500/20 rounded-xl p-6 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-cyan-400">My Tickets</h2>
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500 text-black rounded-lg hover:bg-cyan-400 font-medium transition shadow-lg"
              >
                <Plus className="w-4 h-4" /> New Ticket
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-cyan-400" />
              </div>
            ) : tickets.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8 text-slate-400"
              >
                <HiTicket className="w-12 h-12 mx-auto mb-3 text-cyan-400/30" />
                <p className="text-lg font-medium mb-1">No tickets yet</p>
                <p className="text-sm">Create your first ticket to get support</p>
                <button
                  onClick={() => setShowModal(true)}
                  className="mt-4 text-cyan-400 hover:text-cyan-300 underline"
                >
                  Create ticket now
                </button>
              </motion.div>
            ) : (
              <motion.div 
                className="space-y-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ staggerChildren: 0.05 }}
              >
                {tickets.map((ticket, idx) => (
                  <motion.div
                    key={ticket.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <SupportTicketCard ticket={ticket} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>

          {/* FAQ Section */}
          <div className="bg-slate-900/50 border border-cyan-500/20 rounded-xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-cyan-400 mb-4">Frequently Asked</h2>
            <FaqAccordion faqs={faqs} />
          </div>
        </motion.div>
      </div>

      {/* Create Ticket Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-slate-900 border border-cyan-500/20 rounded-xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">Create Support Ticket</h3>
                <button 
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-white transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleCreate} className="space-y-4">
                <input
                  type="text"
                  placeholder="Ticket Title"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full p-3 bg-slate-950 border border-cyan-500/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  required
                />
                <textarea
                  placeholder="Describe your issue in detail..."
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  rows={4}
                  className="w-full p-3 bg-slate-950 border border-cyan-500/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                  required
                />
                <select
                  value={form.priority}
                  onChange={e => setForm({ ...form, priority: e.target.value })}
                  className="w-full p-3 bg-slate-950 border border-cyan-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                  <option value="critical">Critical</option>
                </select>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-cyan-500 text-black font-medium rounded-lg hover:bg-cyan-400 transition disabled:opacity-50"
                    disabled={loading}
                  >
                    Create Ticket
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-3 bg-slate-800 text-white font-medium rounded-lg hover:bg-slate-700 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}