'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@stackframe/stack';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
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

// Dynamic imports
const SupportTicketCard = dynamic(() => import('@/components/support/SupportTicketCard'), { ssr: false });
const SupportChannelCard = dynamic(() => import('@/components/support/SupportChannelCard'), { ssr: false });
const KnowledgeBaseSearch = dynamic(() => import('@/components/support/KnowledgeBaseSearch'), { ssr: false });
const SystemStatusCard = dynamic(() => import('@/components/support/SystemStatusCard'), { ssr: false });
const FaqAccordion = dynamic(() => import('@/components/support/FaqAccordion'), { ssr: false });
const PriorityIndicator = dynamic(() => import('@/components/support/PriorityIndicator'), { ssr: false });
const StatusBadge = dynamic(() => import('@/components/support/StatusBadge'), { ssr: false });
const Breadcrumb = dynamic(() => import('@/components/resources/Breadcrumb'), { ssr: false });
const ContactOption = dynamic(() => import('@/components/support/ContactOption'), { ssr: false });
const LiveChatWidget = dynamic(() => import('@/components/support/LiveChatWidget'), { ssr: false });
const Input = dynamic(() => import('@/components/ui/input').then((mod) => mod.Input), { ssr: false });
const Button = dynamic(() => import('@/components/ui/button').then((mod) => mod.Button), { ssr: false });
const Select = dynamic(() => import('@/components/ui/select').then((mod) => mod.Select), { ssr: false });
const SelectContent = dynamic(() => import('@/components/ui/select').then((mod) => mod.SelectContent), { ssr: false });
const SelectItem = dynamic(() => import('@/components/ui/select').then((mod) => mod.SelectItem), { ssr: false });
const SelectTrigger = dynamic(() => import('@/components/ui/select').then((mod) => mod.SelectTrigger), { ssr: false });
const SelectValue = dynamic(() => import('@/components/ui/select').then((mod) => mod.SelectValue), { ssr: false });

// Mock server action
const getTickets = async () => {
  try {
    return {
      data: [
        {
          id: 'TKT-001',
          title: 'API Integration Issue',
          description: 'Unable to authenticate with the new API endpoint',
          status: 'open',
          priority: 'high',
          date: '2025-07-20',
          assignee: 'Sarah Johnson',
        },
        {
          id: 'TKT-002',
          title: 'Dashboard Not Loading',
          description: 'Analytics dashboard fails to load with large datasets',
          status: 'pending',
          priority: 'medium',
          date: '2025-07-18',
          assignee: 'Michael Chen',
        },
        {
          id: 'TKT-003',
          title: 'Billing Inquiry',
          description: 'Question about the latest invoice charges',
          status: 'resolved',
          priority: 'low',
          date: '2025-07-15',
          assignee: 'Emma Rodriguez',
        },
      ],
    };
  } catch (error) {
    throw new Error('Failed to fetch tickets');
  }
};

// Error Boundary
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="min-h-screen bg-[#1E2A44] flex items-center justify-center text-white"
        >
          <div className="text-center bg-[#2E7D7D]/10 rounded-xl p-8 border border-[#2E7D7D]/30">
            <p className="text-red-400 font-inter text-lg">Failed to load support page</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 bg-[#2E7D7D] text-white px-6 py-2 rounded-lg hover:bg-[#2E7D7D]/80"
            >
              Retry
            </button>
          </div>
        </motion.div>
      );
    }
    return this.props.children;
  }
}

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'pending' | 'resolved' | 'closed';
  priority: 'critical' | 'high' | 'medium' | 'low';
  date: string;
  assignee: string;
}

interface SupportChannel {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionText: string;
  onClick: () => void;
  color: string;
}

interface ContactOptionType {
  icon: React.ReactNode;
  title: string;
  details: string;
  actionText: string;
  href: string;
  onClick?: () => void;
}

interface SystemStatus {
  service: string;
  status: 'operational' | 'degraded' | 'maintenance' | 'outage';
  lastUpdated: string;
}

interface Faq {
  question: string;
  answer: string;
}

const Support = () => {
  const user = useUser({ or: 'redirect' });
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'tickets' | 'knowledge' | 'community' | 'status'>('tickets');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketForm, setTicketForm] = useState({ title: '', description: '', priority: 'medium' });
  const [ticketError, setTicketError] = useState('');
  const [ticketSuccess, setTicketSuccess] = useState('');

  useEffect(() => {
    const fetchTickets = async () => {
      setIsLoading(true);
      try {
        const response = await getTickets();
        setTickets(
          response.data.map((ticket) => ({
            ...ticket,
            status: ticket.status as 'open' | 'pending' | 'resolved' | 'closed',
            priority: ticket.priority as 'critical' | 'high' | 'medium' | 'low',
          }))
        );
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to fetch tickets:', err);
        setError('Failed to fetch tickets');
        toast.error('Failed to fetch tickets');
        setIsLoading(false);
      }
    };
    fetchTickets();
  }, []);

  const supportChannels: SupportChannel[] = [
    {
      icon: <MessageSquare size={24} />,
      title: 'Live Chat',
      description: 'Get immediate assistance from our support team',
      actionText: 'Start Chat',
      onClick: () => setIsChatOpen(true),
      color: 'bg-[#2E7D7D]/10 text-[#2E7D7D]',
    },
    {
      icon: <LifeBuoy size={24} />,
      title: 'Support Ticket',
      description: 'Submit a ticket for non-urgent issues',
      actionText: 'Create Ticket',
      onClick: () => setShowTicketModal(true),
      color: 'bg-[#2E7D7D]/10 text-[#2E7D7D]',
    },
    {
      icon: <BookOpen size={24} />,
      title: 'Knowledge Base',
      description: 'Find answers in our documentation',
      actionText: 'Browse Articles',
      onClick: () => setActiveTab('knowledge'),
      color: 'bg-[#2E7D7D]/10 text-[#2E7D7D]',
    },
    {
      icon: <Users size={24} />,
      title: 'Community Forum',
      description: 'Ask the community for help',
      actionText: 'Visit Forum',
      onClick: () => router.push('https://community.mutsynhub.com'),
      color: 'bg-[#2E7D7D]/10 text-[#2E7D7D]',
    },
  ];

  const contactOptions: ContactOptionType[] = [
    {
      icon: <Mail size={20} />,
      title: 'Email Support',
      details: 'support@mutsynhub.com',
      actionText: 'Send Email',
      href: 'mailto:support@mutsynhub.com',
    },
    {
      icon: <Phone size={20} />,
      title: 'Phone Support',
      details: '+1 (800) 123-4567',
      actionText: 'Call Now',
      href: 'tel:+18001234567',
    },
    {
      icon: <MessageSquare size={20} />,
      title: '24/7 Chat',
      details: 'Available around the clock',
      actionText: 'Start Chat',
      href: '#',
      onClick: () => setIsChatOpen(true),
    },
  ];

  const systemStatus: SystemStatus[] = [
    { service: 'API Services', status: 'operational', lastUpdated: '2025-07-24T10:30:00Z' },
    { service: 'Data Processing', status: 'operational', lastUpdated: '2025-07-24T09:45:00Z' },
    { service: 'Dashboard & Analytics', status: 'degraded', lastUpdated: '2025-07-24T11:15:00Z' },
    { service: 'Authentication', status: 'operational', lastUpdated: '2025-07-24T08:20:00Z' },
    { service: 'Integration Connectors', status: 'maintenance', lastUpdated: '2025-07-24T07:00:00Z' },
    { service: 'Notification System', status: 'outage', lastUpdated: '2025-07-24T12:05:00Z' },
  ];

  const faqs: Faq[] = [
    {
      question: 'How do I reset my password?',
      answer: 'You can reset your password by clicking the "Forgot Password" link on the login page. You will receive an email with instructions to reset your password.',
    },
    {
      question: 'What data sources do you support?',
      answer: 'We support a wide range of data sources including SQL databases, NoSQL databases, cloud storage services, and popular SaaS applications. Check our integrations page for a complete list.',
    },
    {
      question: 'How often is data synced?',
      answer: 'Data sync frequency depends on your subscription plan. Free plans sync every 24 hours, while paid plans can sync as frequently as every 15 minutes.',
    },
    {
      question: 'Can I use MUTSYNCHUB with my custom API?',
      answer: 'Yes, we provide a flexible API integration framework that allows you to connect to any REST or GraphQL API. Our documentation includes detailed guides for custom integrations.',
    },
    {
      question: 'How secure is my data?',
      answer: 'We take security seriously. All data is encrypted in transit and at rest, and we comply with industry-standard security certifications including SOC 2 and ISO 27001.',
    },
  ];

  const handleTicketChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setTicketForm({ ...ticketForm, [e.target.name]: e.target.value });
    setTicketError('');
    setTicketSuccess('');
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketForm.title || !ticketForm.description || !ticketForm.priority) {
      setTicketError('All fields are required');
      toast.error('All fields are required');
      return;
    }
    try {
      const response = await fetch('/api/create-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...ticketForm,
          id: `TKT-${Date.now()}`,
          status: 'open',
          date: new Date().toISOString().split('T')[0],
          assignee: 'Unassigned',
        }),
      });
      const newTicket = await response.json();
      setTickets([...tickets, newTicket]);
      setTicketSuccess('Ticket created successfully');
      toast.success('Ticket created successfully');
      setTicketForm({ title: '', description: '', priority: 'medium' });
      setShowTicketModal(false);
      setTimeout(() => setTicketSuccess(''), 3000);
    } catch (err) {
      console.error('Failed to create ticket:', err);
      setTicketError('Failed to create ticket');
      toast.error('Failed to create ticket');
      setTimeout(() => setTicketError(''), 3000);
    }
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-[#1E2A44] flex items-center justify-center w-full"
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2E7D7D] mx-auto"></div>
          <p className="mt-4 text-gray-300 font-inter text-lg">Loading Support...</p>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-[#1E2A44] flex items-center justify-center w-full"
      >
        <div className="text-center bg-[#2E7D7D]/10 rounded-xl p-8 border border-[#2E7D7D]/30">
          <p className="text-red-400 font-inter text-lg">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 bg-[#2E7D7D] text-white px-6 py-2 rounded-lg hover:bg-[#2E7D7D]/80"
          >
            Return to Home
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <ErrorBoundary>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-[#1E2A44] text-white font-inter"
      >
        <div className="max-w-7xl mx-auto px-6 py-10">
          {/* Sticky Header */}
          <header className="sticky top-0 z-20 bg-[#1E2A44]/95 backdrop-blur-md border-b border-[#2E7D7D]/30 py-4 px-6">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
              <h1 className="text-2xl font-bold">Support Center</h1>
              <div className="flex gap-4">
                <Input
                  type="text"
                  placeholder="Search support..."
                  className="bg-[#2E7D7D]/20 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D7D]"
                  aria-label="Search support"
                />
                <Button
                  className="bg-[#2E7D7D] text-white hover:bg-[#2E7D7D]/80"
                  aria-label="Search support"
                  data-tooltip-id="search-support"
                  data-tooltip-content="Search support"
                >
                  <Search size={20} />
                </Button>
                <Tooltip id="search-support" />
              </div>
            </div>
          </header>

          {/* Breadcrumb */}
          <Breadcrumb items={[{ name: 'Home', href: '/' }, { name: 'Support', href: '/support' }]} />

          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-[#2E7D7D] mb-4">Support Center</h1>
            <p className="text-base text-gray-400 max-w-3xl mx-auto mb-8">
              Premium support services for your business-critical operations. Our experts are here to help 24/7.
            </p>
          </div>

          {/* Support Channels */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {supportChannels.map((channel, index) => (
              <motion.div key={index} whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
                <SupportChannelCard
                  {...channel}
                  aria-label={channel.title}
                  data-tooltip-id={`channel-${index}`}
                  data-tooltip-content={channel.title}
                />
                <Tooltip id={`channel-${index}`} />
              </motion.div>
            ))}
          </div>

          {/* Main Content Area */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column - Contact and Status */}
            <div className="lg:w-1/3">
              {/* Contact Options */}
              <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }} className="bg-[#2E7D7D]/10 rounded-xl shadow-lg p-6 mb-8">
                <h2 className="text-xl font-semibold text-[#2E7D7D] mb-4">Contact Support</h2>
                <div className="space-y-4">
                  {contactOptions.map((option, index) => (
                    <React.Fragment key={index}>
                      <ContactOption
                        {...option}
                        aria-label={option.title}
                        data-tooltip-id={`contact-${index}`}
                        data-tooltip-content={option.title}
                      />
                      <Tooltip id={`contact-${index}`} />
                    </React.Fragment>
                  ))}
                </div>
              </motion.div>

              {/* System Status */}
              <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }} className="bg-[#2E7D7D]/10 rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-[#2E7D7D] mb-4">System Status</h2>
                <div className="space-y-4">
                  {systemStatus.map((system, index) => (
                    <SystemStatusCard
                      key={index}
                      service={system.service}
                      status={system.status as 'operational' | 'degraded' | 'maintenance' | 'outage'}
                      lastUpdated={system.lastUpdated}
                      aria-label={`${system.service} status: ${system.status}`}
                    />
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t border-gray-600">
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">Status Legend:</span>{' '}
                    <span className="inline-flex items-center gap-1"><CheckCircle2 size={14} className="text-green-500" /> Operational</span>{' '}
                    <span className="inline-flex items-center gap-1"><AlertCircle size={14} className="text-yellow-500" /> Degraded</span>{' '}
                    <span className="inline-flex items-center gap-1"><Wrench size={14} className="text-blue-500" /> Maintenance</span>{' '}
                    <span className="inline-flex items-center gap-1"><XCircle size={14} className="text-red-500" /> Outage</span>
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Right Column - Tickets/Knowledge Base */}
            <div className="lg:w-2/3">
              {/* Tab Navigation */}
              <div className="flex border-b border-gray-600 mb-6">
                <button
                  className={`py-3 px-4 font-medium text-sm border-b-2 ${
                    activeTab === 'tickets'
                      ? 'border-[#2E7D7D] text-[#2E7D7D]'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                  onClick={() => setActiveTab('tickets')}
                  aria-label="View My Support Tickets"
                >
                  My Support Tickets
                </button>
                <button
                  className={`py-3 px-4 font-medium text-sm border-b-2 ${
                    activeTab === 'knowledge'
                      ? 'border-[#2E7D7D] text-[#2E7D7D]'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                  onClick={() => setActiveTab('knowledge')}
                  aria-label="View Knowledge Base"
                >
                  Knowledge Base
                </button>
                <button
                  className={`py-3 px-4 font-medium text-sm border-b-2 ${
                    activeTab === 'status'
                      ? 'border-[#2E7D7D] text-[#2E7D7D]'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                  onClick={() => setActiveTab('status')}
                  aria-label="View System Status"
                >
                  System Status
                </button>
              </div>

              {/* Tab Content */}
              <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }} className="bg-[#2E7D7D]/10 rounded-xl shadow-lg overflow-hidden">
                {activeTab === 'tickets' && (
                  <div>
                    <div className="px-6 py-4 border-b border-gray-600 flex justify-between items-center">
                      <h3 className="text-lg font-medium text-white">My Support Tickets</h3>
                      <Button
                        className="flex items-center gap-1 bg-[#2E7D7D] hover:bg-[#2E7D7D]/80 text-white px-4 py-2 rounded-lg text-sm font-medium"
                        onClick={() => setShowTicketModal(true)}
                        aria-label="Create new ticket"
                        data-tooltip-id="new-ticket"
                        data-tooltip-content="Create new ticket"
                      >
                        <Plus size={16} /> New Ticket
                      </Button>
                      <Tooltip id="new-ticket" />
                    </div>
                    <div className="divide-y divide-gray-600">
                      {isLoading ? (
                        <div className="p-12 text-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2E7D7D] mx-auto"></div>
                          <p className="mt-4 text-gray-500">Loading your support tickets...</p>
                        </div>
                      ) : tickets.length === 0 ? (
                        <div className="p-12 text-center">
                          <p className="text-gray-500">No support tickets found.</p>
                          <Button
                            className="mt-4 text-[#2E7D7D] hover:text-[#2E7D7D]/80 font-medium"
                            onClick={() => setShowTicketModal(true)}
                            aria-label="Create your first ticket"
                          >
                            Create your first ticket
                          </Button>
                        </div>
                      ) : (
                        tickets.map((ticket) => (
                          <SupportTicketCard
                            key={ticket.id}
                            ticket={ticket}
                            aria-label={`Support ticket: ${ticket.title}`}
                          />
                        ))
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'knowledge' && (
                  <div className="p-6">
                    <KnowledgeBaseSearch aria-label="Search knowledge base" />
                  </div>
                )}

                {activeTab === 'status' && (
                  <div className="p-6">
                    <div className="mb-6">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="bg-[#2E7D7D]/20 rounded-lg p-2 text-[#2E7D7D]">
                          <CheckCircle2 size={24} />
                        </div>
                        <div>
                          <h3 className="font-medium text-white">All Systems Operational</h3>
                          <p className="text-gray-500 text-sm">Last updated on July 24, 2025</p>
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-gray-600 pt-4">
                      <h3 className="font-medium text-white mb-3">Component Status</h3>
                      <div className="space-y-3">
                        {systemStatus.map((system, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              {system.status === 'operational' && <CheckCircle2 size={16} className="text-green-500" />}
                              {system.status === 'degraded' && <AlertCircle size={16} className="text-yellow-500" />}
                              {system.status === 'maintenance' && <Wrench size={16} className="text-blue-500" />}
                              {system.status === 'outage' && <XCircle size={16} className="text-red-500" />}
                              <span className="text-gray-300">{system.service}</span>
                            </div>
                            <span
                              className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                                system.status === 'operational'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                  : system.status === 'degraded'
                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                    : system.status === 'maintenance'
                                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                              }`}
                              aria-label={`${system.service} status: ${system.status}`}
                            >
                              {system.status.charAt(0).toUpperCase() + system.status.slice(1)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>

              {/* FAQ Section */}
              <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }} className="mt-8">
                <div className="bg-[#2E7D7D]/10 rounded-xl shadow-lg">
                  <div className="p-6">
                    <h2 className="text-xl font-bold text-[#2E7D7D] mb-6">Frequently Asked Questions</h2>
                    <FaqAccordion faqs={faqs} aria-label="Frequently Asked Questions" />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Create Ticket Modal */}
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
                <button
                  className="absolute top-3 right-4 text-white text-xl"
                  onClick={() => setShowTicketModal(false)}
                  aria-label="Close create ticket modal"
                >
                  &times;
                </button>
                <h2 id="create-ticket-modal-title" className="text-xl font-bold text-white mb-4">
                  Create New Support Ticket
                </h2>
                <form onSubmit={handleCreateTicket} className="space-y-4">
                  <div>
                    <label htmlFor="ticket-title" className="text-[#2E7D7D]">
                      Title
                    </label>
                    <Input
                      id="ticket-title"
                      name="title"
                      value={ticketForm.title}
                      onChange={handleTicketChange}
                      className="bg-[#2E7D7D]/20 border-[#2E7D7D]/30 text-white focus:ring-2 focus:ring-[#2E7D7D]"
                      required
                      aria-label="Ticket title"
                    />
                  </div>
                  <div>
                    <label htmlFor="ticket-description" className="text-[#2E7D7D]">
                      Description
                    </label>
                    <textarea
                      id="ticket-description"
                      name="description"
                      value={ticketForm.description}
                      onChange={handleTicketChange}
                      className="bg-[#2E7D7D]/20 border-[#2E7D7D]/30 text-white w-full p-2 rounded-lg focus:ring-2 focus:ring-[#2E7D7D]"
                      rows={4}
                      required
                      aria-label="Ticket description"
                    />
                  </div>
                  <div>
                    <label htmlFor="ticket-priority" className="text-[#2E7D7D]">
                      Priority
                    </label>
                    <Select
                      name="priority"
                      value={ticketForm.priority}
                      onValueChange={(value) => setTicketForm({ ...ticketForm, priority: value })}
                    >
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
                    <Button
                      type="submit"
                      className="w-full bg-[#2E7D7D] text-white font-bold hover:bg-[#2E7D7D]/80"
                      aria-label="Create ticket"
                      data-tooltip-id="create-ticket"
                      data-tooltip-content="Create ticket"
                    >
                      Create
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full text-[#2E7D7D] border-[#2E7D7D]"
                      type="button"
                      onClick={() => setShowTicketModal(false)}
                      aria-label="Cancel create ticket"
                      data-tooltip-id="cancel-ticket"
                      data-tooltip-content="Cancel create ticket"
                    >
                      Cancel
                    </Button>
                    <Tooltip id="create-ticket" />
                    <Tooltip id="cancel-ticket" />
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {/* Live Chat Widget */}
          <LiveChatWidget isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} aria-label="Live chat widget" />
        </div>
        <Toaster position="top-right" />
      </motion.div>
    </ErrorBoundary>
  );
};

export default Support;