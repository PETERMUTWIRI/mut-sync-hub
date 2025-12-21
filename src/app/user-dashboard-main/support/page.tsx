// src/app/support/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useUser } from '@stackframe/stack';
import { useRouter } from 'next/navigation';
import { toast, Toaster } from 'react-hot-toast';
import { 
  LifeBuoy, MessageSquare, BookOpen, Users, Plus, Search, ChevronRight, 
  Mail, Phone, Wrench,Headset, CheckCircle2, XCircle, X, Clock, Shield, 
  TrendingUp, Activity, Zap, Award, ArrowRight, AlertCircle, RefreshCw
} from 'lucide-react';
import { HiTicket, HiRefresh } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';
import { getOrgProfile } from '@/lib/org-profile-client'; // ✅ NEW IMPORT

// ──────────────────────────────────────────────────────────────
// TYPES & INTERFACES
// ──────────────────────────────────────────────────────────────

interface SupportTicket {
  id: string;
  ticket_number: string;
  title: string;
  description: string;
  status: 'open' | 'pending' | 'resolved' | 'closed';
  priority: 'critical' | 'high' | 'medium' | 'low';
  created_at: string;
  updated_at: string;
  SupportReply: { author_email: string; body: string; created_at: string }[];
}

interface OrgProfile {
  userId: string;
  profileId: string;
  orgId: string;
  role: string;
  email: string;
}

// ──────────────────────────────────────────────────────────────
// CUSTOM HOOK (with refetch)
// ──────────────────────────────────────────────────────────────

const useTickets = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/support/tickets', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setTickets(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch tickets', error);
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  return { tickets, loading, refetch: fetchTickets };
};

// ──────────────────────────────────────────────────────────────
// INLINE COMPONENTS
// ──────────────────────────────────────────────────────────────

const SupportTicketCard = ({ ticket }: { ticket: SupportTicket }) => {
  const statusColors = {
    open: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30',
    pending: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
    resolved: 'bg-green-500/10 text-green-300 border-green-500/30',
    closed: 'bg-slate-500/10 text-slate-300 border-slate-500/30'
  };

  const priorityColors = {
    critical: 'bg-red-500/10 text-red-400',
    high: 'bg-orange-500/10 text-orange-400',
    medium: 'bg-yellow-500/10 text-yellow-400',
    low: 'bg-green-500/10 text-green-400'
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      className="bg-[#1E2A44]/50 border border-[#2E7D7D]/30 rounded-lg p-4 hover:border-[#2E7D7D]/60 hover:shadow-xl transition-all"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs bg-[#2E7D7D]/20 text-[#2E7D7D] px-2 py-1 rounded font-mono">
              {ticket.ticket_number}
            </span>
            <span className={`text-xs px-2 py-1 rounded ${priorityColors[ticket.priority]}`}>
              {ticket.priority}
            </span>
          </div>
          <h4 className="font-bold text-white">{ticket.title}</h4>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ${statusColors[ticket.status]}`}>
          {ticket.status}
        </span>
      </div>
      
      <p className="text-gray-300 text-sm mb-3 line-clamp-2">{ticket.description}</p>
      
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-3 text-gray-400">
          <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
          <span>•</span>
          <span>Updated {new Date(ticket.updated_at).toLocaleTimeString()}</span>
        </div>
        {ticket.SupportReply?.length > 0 && (
          <div className="flex items-center gap-1 text-[#2E7D7D]">
            <MessageSquare className="w-3 h-3" />
            <span>{ticket.SupportReply.length}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const FaqAccordion = ({ faqs }: { faqs: { question: string; answer: string }[] }) => {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  
  return (
    <div className="space-y-3">
      {faqs.map((faq, idx) => (
        <motion.div 
          key={idx} 
          className="border border-[#2E7D7D]/30 rounded-lg overflow-hidden"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
        >
          <button
            className="w-full p-4 text-left flex justify-between items-center bg-[#1E2A44]/30 hover:bg-[#1E2A44]/50 text-white font-medium transition"
            onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
          >
            <span className="text-sm">{faq.question}</span>
            <ChevronRight className={`w-4 h-4 transition-transform text-[#2E7D7D] ${openIdx === idx ? 'rotate-90' : ''}`} />
          </button>
          <AnimatePresence>
            {openIdx === idx && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 bg-[#1E2A44]/70 text-gray-300 text-sm border-t border-[#2E7D7D]/30">
                  {faq.answer}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
};

const CreateTicketModal = ({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) => {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    
    const form = new FormData(e.currentTarget);
    const data = {
      title: form.get('title') as string,
      description: form.get('description') as string,
      priority: form.get('priority') as string,
    };

    try {
      const res = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Failed');
      
      toast.success('✅ Ticket created successfully');
      onSuccess(); // ✅ Refresh list
      onClose(); // Close modal
    } catch (error) {
      toast.error('❌ Failed to create ticket');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-[#1E2A44] border border-cyan-500/30 rounded-xl p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">Create Support Ticket</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="title"
            type="text"
            placeholder="Ticket Title"
            className="w-full p-3 bg-[#1E2A44]/50 border border-cyan-500/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            required
          />
          <textarea
            name="description"
            placeholder="Describe your issue..."
            rows={4}
            className="w-full p-3 bg-[#1E2A44]/50 border border-cyan-500/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
            required
          />
          <select
            name="priority"
            className="w-full p-3 bg-[#1E2A44]/50 border border-cyan-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
            <option value="critical">Critical</option>
          </select>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 bg-cyan-600 text-black font-medium rounded-lg hover:bg-cyan-500 disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Ticket'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-800 text-white font-medium rounded-lg hover:bg-slate-700"
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ──────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ──────────────────────────────────────────────────────────────

export default function SupportPage() {
  useUser({ or: 'redirect' });
  const router = useRouter();
  const { tickets, loading, refetch } = useTickets();
  const [showModal, setShowModal] = useState(false);
  const [orgProfile, setOrgProfile] = useState<OrgProfile | null>(null);
  const [isLive, setIsLive] = useState(true);

  // Load org profile for SSE
  useEffect(() => {
    getOrgProfile().then(setOrgProfile).catch(() => {});
  }, []);

  // SSE Real-time updates
  useEffect(() => {
    if (!orgProfile?.orgId || !orgProfile?.email) return;

    const eventSource = new EventSource('/api/notifications/stream', { 
      withCredentials: true 
    });

    eventSource.addEventListener('message', (event) => {
      if (event.data.startsWith(':')) return;
      try {
        const parsed = JSON.parse(event.data);
        if (parsed.data?.orgId === orgProfile.orgId) {
          refetch(); // ✅ Auto-refresh
        }
      } catch {}
    });

    eventSource.onerror = () => {
      setIsLive(false);
      eventSource.close();
    };

    return () => eventSource.close();
  }, [orgProfile?.orgId, orgProfile?.email, refetch]);

  // Support tiers
  const supportTiers = [
    { name: 'Community', icon: <Users className="text-cyan-400" />, responseTime: '48h' },
    { name: 'Professional', icon: <Headset className="text-blue-400" />, responseTime: '4h' },
    { name: 'Enterprise', icon: <Shield className="text-red-400" />, responseTime: '15min' }
  ];

  const faqs = [
    { question: 'How do I reset my password?', answer: 'Click "Forgot Password" on login page.' },
    { question: 'What data sources are supported?', answer: 'SQL, NoSQL, APIs, cloud storage.' },
    { question: 'How do I upgrade my plan?', answer: 'Visit billing in your dashboard.' },
    { question: 'Is there a mobile app?', answer: 'Yes, on App Store & Google Play.' }
  ];

  if (loading && tickets.length === 0) {
    return (
      <div className="min-h-screen bg-[#1E2A44] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400 mx-auto mb-4" />
          <p className="text-cyan-400">Loading tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1E2A44] text-gray-100 font-inter p-6">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center gap-2">
              <LifeBuoy className="text-cyan-400" /> Support Center
            </h1>
            <p className="text-sm text-cyan-200/70 mt-1">Track tickets and get help</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isLive ? 'bg-green-500' : 'bg-slate-500'}`}></div>
              <span className="text-xs text-cyan-200/70">{isLive ? 'LIVE' : 'OFFLINE'}</span>
            </div>
            
            <button
              onClick={refetch}
              className="p-2 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-lg transition"
            >
              <HiRefresh className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-black rounded-lg hover:bg-cyan-500 font-medium shadow-lg"
            >
              <Plus className="w-4 h-4" /> New Ticket
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Sidebar */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          {/* Contact Options */}
          <div className="bg-[#1E2A44]/30 border border-cyan-500/20 rounded-xl p-6">
            <h2 className="text-xl font-bold text-cyan-400 mb-4">Contact</h2>
            <div className="space-y-3">
              <a href="mailto:support@mutsynhub.com" className="flex items-center gap-3 p-3 bg-[#1E2A44]/50 rounded-lg hover:bg-cyan-500/10 transition">
                <Mail className="text-cyan-400" /> 
                <div>
                  <div className="text-white font-medium">Email</div>
                  <div className="text-xs text-gray-400">support@mutsynhub.com</div>
                </div>
              </a>
            </div>
          </div>

          {/* Support Tiers */}
          <div className="bg-[#1E2A44]/30 border border-cyan-500/20 rounded-xl p-6">
            <h2 className="text-xl font-bold text-cyan-400 mb-4">Support Tiers</h2>
            <div className="space-y-3">
              {supportTiers.map((tier, idx) => (
                <div key={idx} className="p-3 bg-[#1E2A44]/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    {tier.icon}
                    <span className="text-white font-medium">{tier.name}</span>
                  </div>
                  <div className="text-xs text-gray-400">Response: {tier.responseTime}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Right Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tickets */}
          <div className="bg-[#1E2A44]/30 border border-cyan-500/20 rounded-xl p-6">
            <h2 className="text-xl font-bold text-cyan-400 mb-4">My Tickets</h2>
            {tickets.length === 0 && !loading ? (
              <div className="text-center py-12">
                <HiTicket className="w-12 h-12 mx-auto mb-3 text-cyan-400/30" />
                <p className="text-gray-400">No tickets yet. Create your first one!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tickets.map(ticket => (
                  <SupportTicketCard key={ticket.id} ticket={ticket} />
                ))}
              </div>
            )}
          </div>

          {/* FAQ */}
          <div className="bg-[#1E2A44]/30 border border-cyan-500/20 rounded-xl p-6">
            <h2 className="text-xl font-bold text-cyan-400 mb-4">FAQ</h2>
            <FaqAccordion faqs={faqs} />
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <CreateTicketModal onClose={() => setShowModal(false)} onSuccess={refetch} />
      )}
    </div>
  );
}