'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { DatePicker } from '@/components/ui/datepicker';
import Link from 'next/link';
import Image from 'next/image';
import {
  HiOutlineChatBubbleLeftRight, HiOutlineMicrophone, HiOutlineSpeakerWave, HiOutlineSpeakerXMark, HiOutlinePhone, HiOutlineEnvelope, HiOutlineCalendar
} from 'react-icons/hi2';
import { useSearchParams } from 'next/navigation';
import { X, Calendar, Check, ChevronDown, ChevronUp, ArrowRight, Star, Briefcase, Cpu, Cloud, Database, Bot, Globe, Code2, LayoutGrid, Sparkles, Zap, Shield, TrendingUp, Users, DollarSign, Clock, ArrowUpRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { sendConsultationEmail } from '@/lib/emailClient';

// Service categories
const SERVICE_CATEGORIES = [
  { id: 'ai', name: 'AI & Automation', icon: <Cpu size={20} />, color: 'text-cyan-400' },
  { id: 'cloud', name: 'Cloud Solutions', icon: <Cloud size={20} />, color: 'text-blue-400' },
  { id: 'data', name: 'Data Engineering', icon: <Database size={20} />, color: 'text-indigo-400' },
  { id: 'chatbots', name: 'Chatbots', icon: <Bot size={20} />, color: 'text-purple-400' },
  { id: 'web', name: 'Web Development', icon: <Globe size={20} />, color: 'text-green-400' },
  { id: 'integrations', name: 'Integrations', icon: <Code2 size={20} />, color: 'text-orange-400' },
  { id: 'all', name: 'All Services', icon: <LayoutGrid size={20} />, color: 'text-gray-400' },
];

// Enhanced solutions data with more details
const SOLUTIONS = [
  {
    id: "analytics-demo",
    title: "Analytics Demo",
    description: "Request a live demonstration of our analytics engine and dashboard capabilities tailored to your industry.",
    category: "data",
    services: [
      "Custom analytics walkthrough",
      "Live dashboard demo",
      "Q&A with analytics expert"
    ],
    deliverables: [
      "Personalized demo session",
      "Demo access credentials",
      "Follow-up recommendations"
    ],
    benefits: [
      "See analytics in action",
      "Tailored to your use case",
      "Direct expert answers"
    ],
    isHot: true,
    duration: "45 min",
    price: "Free",
    icon: <TrendingUp size={18} />
  },
  {
    id: "ai-agents",
    title: "AI Agent Ecosystems",
    description: "Build autonomous AI agents that collaborate to solve complex business problems without human intervention.",
    category: "ai",
    services: [
      "Multi-agent orchestration systems",
      "Self-optimizing agent networks",
      "Domain-specific agent frameworks",
      "Agent-to-agent communication protocols",
      "Continuous learning environments"
    ],
    deliverables: [
      "Deployed agent ecosystem",
      "Agent performance dashboard",
      "Integration documentation",
      "Training datasets",
      "Maintenance playbook"
    ],
    benefits: [
      "24/7 automated problem solving",
      "Reduced operational costs by 40-60%",
      "Real-time business intelligence",
      "Scalable decision-making capacity",
      "Future-proof adaptability"
    ],
    isHot: true,
    duration: "8-12 weeks",
    price: "From $15,000",
    icon: <Zap size={18} />
  },
  {
    id: "cloud-architecture",
    title: "Cloud-Native Architecture",
    description: "Design and implement resilient, scalable cloud infrastructures optimized for your specific business needs.",
    category: "cloud",
    services: [
      "Multi-cloud strategy development",
      "Serverless architecture design",
      "Kubernetes orchestration",
      "Cloud cost optimization",
      "Disaster recovery planning"
    ],
    deliverables: [
      "Cloud architecture blueprint",
      "Infrastructure-as-Code templates",
      "Performance benchmarking",
      "Security compliance report",
      "Cost management dashboard"
    ],
    benefits: [
      "99.99% uptime guarantee",
      "40-70% lower infrastructure costs",
      "Instant global scalability",
      "Enhanced security posture",
      "Faster time-to-market"
    ],
    isHot: true,
    duration: "6-10 weeks",
    price: "From $12,000",
    icon: <Shield size={18} />
  },
  {
    id: "data-engineering",
    title: "Modern Data Engineering",
    description: "Build robust data pipelines that transform raw information into actionable intelligence.",
    category: "data",
    services: [
      "Real-time data streaming",
      "AI-powered data quality",
      "Data lakehouse implementation",
      "Predictive analytics pipelines",
      "Data governance frameworks"
    ],
    deliverables: [
      "End-to-end data pipeline",
      "Data catalog and dictionary",
      "BI dashboard templates",
      "Data quality reports",
      "ML-ready datasets"
    ],
    benefits: [
      "Unified data ecosystem",
      "90% faster insights delivery",
      "Automated data quality control",
      "Scalable to petabyte scale",
      "Regulatory compliance assurance"
    ],
    isHot: true,
    duration: "8-12 weeks",
    price: "From $18,000",
    icon: <Database size={18} />
  },
  {
    id: "enterprise-chatbots",
    title: "Enterprise Chatbot Systems",
    description: "Create AI-powered conversational interfaces that handle complex enterprise workflows.",
    category: "chatbots",
    services: [
      "Multi-modal chatbot design",
      "Emotion-aware interactions",
      "ERP/CRM integrations",
      "Voice-enabled assistants",
      "Continuous learning systems"
    ],
    deliverables: [
      "Deployed chatbot solution",
      "Conversation flow diagrams",
      "Integration documentation",
      "Training datasets",
      "Analytics dashboard"
    ],
    benefits: [
      "85% automated query resolution",
      "40% reduction in support costs",
      "24/7 customer engagement",
      "Personalized user experiences",
      "Actionable conversation insights"
    ],
    isHot: true,
    duration: "6-8 weeks",
    price: "From $8,000",
    icon: <Bot size={18} />
  },
  {
    id: "fullstack",
    title: "Full-Stack Development",
    description: "Build robust and scalable web applications tailored to your business needs with modern architectures.",
    category: "web",
    services: [
      "Custom web applications",
      "Progressive Web Apps (PWAs)",
      "Micro-frontend architecture",
      "Real-time collaboration features",
      "Headless CMS implementation"
    ],
    deliverables: [
      "Production-ready application",
      "Responsive design system",
      "CI/CD pipeline",
      "Performance optimization report",
      "Maintenance guidelines"
    ],
    benefits: [
      "Enhanced user engagement",
      "Faster feature deployment",
      "Cross-platform compatibility",
      "Future-proof architecture",
      "Reduced maintenance costs"
    ],
    duration: "10-16 weeks",
    price: "From $20,000",
    icon: <Code2 size={18} />
  },
  {
    id: "cloud-migration",
    title: "Cloud Migration & Optimization",
    description: "Seamlessly transition to cloud environments with maximum efficiency and minimal disruption.",
    category: "cloud",
    services: [
      "Legacy system modernization",
      "Cloud cost optimization",
      "Data migration strategies",
      "Containerization services",
      "Hybrid cloud solutions"
    ],
    deliverables: [
      "Migration roadmap",
      "Cost-benefit analysis",
      "Deployment playbook",
      "Performance benchmarks",
      "Security assessment"
    ],
    benefits: [
      "40-60% infrastructure cost savings",
      "Enhanced system performance",
      "Improved scalability",
      "Reduced technical debt",
      "Future-ready architecture"
    ],
    duration: "12-20 weeks",
    price: "From $25,000",
    icon: <Cloud size={18} />
  },
  {
    id: "ai-integrations",
    title: "AI-Powered Workflow Automation",
    description: "Transform business processes with intelligent automation that learns and adapts to your operations.",
    category: "ai",
    services: [
      "Process mining and analysis",
      "Intelligent document processing",
      "Predictive workflow optimization",
      "RPA with cognitive capabilities",
      "Automation governance frameworks"
    ],
    deliverables: [
      "Automated workflow implementation",
      "Process optimization report",
      "ROI analysis",
      "Maintenance dashboard",
      "Training materials"
    ],
    benefits: [
      "70-90% process acceleration",
      "60% reduction in manual errors",
      "Continuous process improvement",
      "Enhanced compliance tracking",
      "Rapid ROI (3-6 months)"
    ],
    isHot: true,
    duration: "6-10 weeks",
    price: "From $10,000",
    icon: <Sparkles size={18} />
  },
  {
    id: "multitenant",
    title: "Multi-Tenant SaaS Platforms",
    description: "Build scalable, secure SaaS solutions with efficient resource sharing and isolation for multiple clients.",
    category: "web",
    services: [
      "Tenant isolation architecture",
      "Customizable white-label solutions",
      "Usage-based billing systems",
      "Scalable data partitioning",
      "Self-service tenant management"
    ],
    deliverables: [
      "SaaS platform architecture",
      "Tenant management dashboard",
      "Billing system integration",
      "Scalability assessment",
      "Security audit report"
    ],
    benefits: [
      "90% faster tenant onboarding",
      "Efficient resource utilization",
      "Customizable client experiences",
      "Automated billing and reporting",
      "Enterprise-grade security"
    ],
    duration: "12-18 weeks",
    price: "From $30,000",
    icon: <Users size={18} />
  },
  {
    id: "data-analytics",
    title: "Advanced Analytics & BI",
    description: "Transform raw data into strategic insights with cutting-edge analytics solutions and interactive dashboards.",
    category: "data",
    services: [
      "Predictive analytics modeling",
      "Real-time dashboards",
      "Natural language query systems",
      "Anomaly detection frameworks",
      "Data storytelling platforms"
    ],
    deliverables: [
      "Interactive BI dashboards",
      "Analytics models",
      "Data visualization library",
      "Insight delivery framework",
      "User training materials"
    ],
    benefits: [
      "Data-driven decision making",
      "90% faster insights delivery",
      "Predictive capabilities",
      "Democratized data access",
      "Competitive intelligence"
    ],
    duration: "8-12 weeks",
    price: "From $15,000",
    icon: <TrendingUp size={18} />
  },
  {
    id: "api-integrations",
    title: "Enterprise API Integrations",
    description: "Connect your ecosystem with robust, secure API integrations and microservices architecture.",
    category: "integrations",
    services: [
      "API gateway implementation",
      "Microservices architecture",
      "Event-driven integrations",
      "Legacy system API wrapping",
      "Real-time data synchronization"
    ],
    deliverables: [
      "Integration architecture",
      "API documentation",
      "Testing suite",
      "Monitoring dashboard",
      "Security audit report"
    ],
    benefits: [
      "Unified business ecosystem",
      "Real-time data flow",
      "Reduced integration costs",
      "Enhanced system agility",
      "Future-proof connectivity"
    ],
    isHot: true,
    duration: "6-10 weeks",
    price: "From $8,000",
    icon: <Code2 size={18} />
  },
  {
    id: "iot-cloud",
    title: "IoT Cloud Platforms",
    description: "Connect, manage, and derive value from IoT ecosystems at scale with edge computing and real-time processing.",
    category: "cloud",
    services: [
      "IoT device management",
      "Edge computing architecture",
      "Real-time telemetry processing",
      "Predictive maintenance systems",
      "Digital twin implementation"
    ],
    deliverables: [
      "IoT platform architecture",
      "Device management console",
      "Data pipeline design",
      "Alerting and monitoring system",
      "Analytics dashboard"
    ],
    benefits: [
      "Unified device management",
      "Real-time operational insights",
      "Predictive failure prevention",
      "Remote monitoring capabilities",
      "New revenue streams"
    ],
    isHot: true,
    duration: "10-14 weeks",
    price: "From $22,000",
    icon: <Cloud size={18} />
  },
  {
    id: "blockchain",
    title: "Blockchain Integration",
    description: "Leverage distributed ledger technology for secure, transparent transactions and decentralized solutions.",
    category: "integrations",
    services: [
      "Smart contract development",
      "Tokenization strategies",
      "Supply chain transparency",
      "Decentralized identity solutions",
      "NFT marketplace development"
    ],
    deliverables: [
      "Blockchain architecture",
      "Smart contract suite",
      "Integration documentation",
      "Wallet management system",
      "Compliance assessment"
    ],
    benefits: [
      "Enhanced transaction security",
      "Reduced intermediary costs",
      "Immutable audit trails",
      "New business models",
      "Increased stakeholder trust"
    ],
    duration: "8-12 weeks",
    price: "From $18,000",
    icon: <Shield size={18} />
  }
];

// Case studies data (unchanged but enhanced with icons)
const CASE_STUDIES = [
  {
    id: "fintech-ai",
    title: "AI-Powered Fraud Detection",
    client: "Global FinTech Leader",
    challenge: "Facing $12M annual losses to sophisticated fraud with legacy systems missing 40% of fraudulent transactions while generating excessive false positives.",
    solution: "Implemented a multi-agent AI ecosystem with specialized fraud detection agents, behavioral analysis modules, and real-time adaptive learning capabilities.",
    results: [
      "94% fraud detection accuracy",
      "$8.7M annual fraud prevention",
      "80% reduction in false positives",
      "Real-time transaction monitoring",
      "Self-optimizing detection models"
    ],
    technologies: ["Python", "TensorFlow", "Kubernetes", "Apache Kafka", "React"],
    testimonial: "The AI agent ecosystem reduced our fraud losses by 92% in the first quarter while improving customer experience through fewer false positives. The system continues to improve autonomously.",
    icon: <Shield size={16} />
  },
  {
    id: "healthcare-cloud",
    title: "Healthcare Cloud Migration",
    client: "National Healthcare Provider",
    challenge: "Legacy systems causing 5+ hours of downtime monthly with inability to scale during pandemic surges, risking patient care and compliance.",
    solution: "Designed and implemented a HIPAA-compliant multi-cloud architecture with auto-scaling capabilities, zero-downtime migration, and advanced data encryption.",
    results: [
      "99.99% uptime achieved",
      "40% infrastructure cost reduction",
      "3x faster system performance",
      "Seamless pandemic-scale capacity",
      "Enhanced security compliance"
    ],
    technologies: ["AWS", "Azure", "Terraform", "Kubernetes", "React"],
    testimonial: "Our cloud transformation enabled us to handle 300% patient volume increases during critical periods without service degradation. The cost savings funded our telehealth expansion.",
    icon: <Cloud size={16} />
  },
  {
    id: "retail-chatbot",
    title: "Omnichannel Retail Assistant",
    client: "International Retail Chain",
    challenge: "Inconsistent customer experience across 12 channels with 48-hour response times and $3M annual support costs for basic inquiries.",
    solution: "Created unified AI assistant ecosystem handling 23 languages across web, mobile, social, and in-store kiosks with seamless human handoff.",
    results: [
      "85% inquiry automation rate",
      "$2.1M annual support savings",
      "4.8/5 customer satisfaction",
      "40% increase in conversion rate",
      "Unified customer journey"
    ],
    technologies: ["Dialogflow", "Node.js", "React Native", "AWS Lambda", "Redis"],
    testimonial: "Our AI assistant now handles 15,000+ daily conversations with higher satisfaction than human agents. It's transformed how we engage customers across all touchpoints.",
    icon: <Bot size={16} />
  }
];

// Consultation times for scheduling
const CONSULTATION_TIMES = [
  "9:00 AM", "10:00 AM", "11:00 AM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"
];

type Solution = {
  id: string;
  title: string;
  description: string;
  category: string;
  services: string[];
  deliverables: string[];
  benefits: string[];
  isHot?: boolean;
  duration: string;
  price: string;
  icon: React.ReactNode;
};

/* ----------  THEME CONSTANTS (from dashboard)  ---------- */
const DEEP_NAVY = '#1E2A44';
const TEAL = '#2E7D7D';
const TEXT_MAIN = 'text-gray-100';
const TEXT_SEC = 'text-gray-300';
const TEXT_MUTED = 'text-gray-400';

/* ----------  AI CONSULTANT COMPONENT  ---------- */
function SolutionsAgent({ solutions }: { solutions: any[] }) {
  type Message = { role: 'user' | 'assistant'; content: string };

  const [threadId] = useState(() => `sol-${Date.now()}`);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [requiresContact, setRequiresContact] = useState(false);
  const [booking, setBooking] = useState(false);

  const callAgent = async (action: string, payload: any) => {
    const res = await fetch('/api/agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, payload }),
    });
    const text = await res.text();
    if (!text) return { json: null, status: res.status };
    try {
      const json = JSON.parse(text);
      return { json, status: res.status };
    } catch (e) {
      console.error('Bad agent JSON:', text, e);
      return { json: null, status: res.status };
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    setMessages((m) => [...m, { role: 'user', content: text }]);
    setInput('');
    setLoading(true);
    const { json, status } = await callAgent('chat', { message: text, threadId });
    setLoading(false);
    if (!json || !json.content) {
      setMessages((m) => [...m, { role: 'assistant', content: 'Sorry, I could not process that.' }]);
      return;
    }
    setMessages((m) => [...m, { role: 'assistant', content: json.content }]);
    if (status === 100 || json.requiresContact) setRequiresContact(true);
  };

  const book = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = fd.get('name') as string;
    const email = fd.get('email') as string;
    const date = fd.get('date') as string;
    const time = fd.get('time') as string;
    
    setBooking(true);
    const { json } = await callAgent('book', { name, email, date, time, threadId });
    setBooking(false);
    
    if (json?.ok) {
      const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//MutSyncHub//Consultation//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        `UID:mut-${Date.now()}@mutsynchub.com`,
        `DTSTART:${date}T${time.replace(':', '')}00`,
        `DTEND:${date}T${String(Number(time.split(':')[0]) + 1).padStart(2, '0')}${time.split(':')[1]}00`,
        'SUMMARY:MutSyncHub Consultation',
        'DESCRIPTION:AI-agent booked consultation slot',
        'STATUS:CONFIRMED',
        'TRANSP:OPAQUE',
        'END:VEVENT',
        'END:VCALENDAR',
      ].join('\r\n');
      
      const mailVars = {
        name,
        email,
        consultation_date: date,
        consultation_time: `${time} (East-Africa time)`,
        services: 'AI-Consulting',
        company: 'N/A',
        phone: 'N/A',
        message: 'AI-agent booked slot',
        ics_file: encodeURIComponent(icsContent),
        ics_filename: 'MutSyncHub-consultation.ics',
        now_year: new Date().getFullYear(),
      };
      
      const res = await sendConsultationEmail(mailVars);
      if (res.status !== 200) console.warn('EmailJS failed:', res.text);
      
      setMessages((m) => [...m, { role: 'assistant', content: `✅ Calendar invite sent to ${email}. See you soon!` }]);
    }
  };

  return (
    <div className="flex flex-col gap-3 text-sm max-w-2xl mx-auto">
      <div className="h-64 overflow-y-auto rounded-xl border border-gray-300 bg-[#F5F5F0] p-3 flex flex-col gap-2">
        {messages.length === 0 && <p className="text-gray-500">👋 Hi! Ask me anything or pick a solution card below.</p>}
        {messages.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'self-end bg-white text-black border border-gray-200 rounded-xl px-3 py-1' : 'self-start bg-[#EAE6DD] text-black rounded-xl px-3 py-1'}>
            {m.content}
          </div>
        ))}
        {loading && <span className="text-gray-400 animate-pulse">Thinking…</span>}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); sendMessage(input); }} className="flex gap-2">
        <input
          id="ai-chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type or speak…"
          className="flex-1 bg-white text-black border border-gray-300 rounded-lg px-3 py-2 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#2E7D7D]"
        />
        <Button type="submit" size="sm" className="bg-[#2E7D7D] text-white hover:bg-[#2E7D7D]/80 rounded-lg">Send</Button>
      </form>

      {requiresContact && (
        <motion.form
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2"
          onSubmit={book}
        >
          <input name="name" type="text" required placeholder="Your name" className="bg-white text-black border border-gray-300 rounded px-3 py-2" />
          <input name="email" type="email" required placeholder="your@email.com" className="bg-white text-black border border-gray-300 rounded px-3 py-2" />
          <input name="date" type="date" required className="bg-white text-black border border-gray-300 rounded px-3 py-2" />
          <input name="time" type="time" required className="bg-white text-black border border-gray-300 rounded px-3 py-2" />
          <Button type="submit" disabled={booking} className="sm:col-span-3 bg-[#2E7D7D] text-white hover:bg-[#2E7D7D]/80 rounded-lg">
            {booking ? 'Booking…' : 'Book free consultation'}
          </Button>
        </motion.form>
      )}
    </div>
  );
}

/* ----------  MAIN PAGE  ---------- */
export default function SolutionsPage() {
  const searchParams = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedSolution, setExpandedSolution] = useState<string | null>(null);
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [selectedSolution, setSelectedSolution] = useState<Solution | null>(null);

  const openAgentModal = (solution?: Solution) => {
    setSelectedSolution(solution || null);
    setShowAgentModal(true);
    setTimeout(() => {
      document.querySelector<HTMLInputElement>('#ai-chat-input')?.focus();
    }, 100);
  };

  const closeAgentModal = () => {
    setShowAgentModal(false);
    setSelectedSolution(null);
  };

  const filtered = selectedCategory === 'all' ? SOLUTIONS : SOLUTIONS.filter((s) => s.category === selectedCategory);

  useEffect(() => {
    const id = searchParams.get('id');
    if (id) setExpandedSolution(id);
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-[#1E2A44] text-gray-100 font-inter overflow-x-hidden">
      {/*  ----  NAV BAR  ----  */}
      <header className="flex items-center justify-between px-8 py-4 bg-[#1E2A44] border-b border-[#2E7D7D]/30 shadow-lg w-full">
        <div className="flex items-center gap-4">
          <Link href="/">
            <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">MutSyncHub</span>
          </Link>
          <nav className="hidden md:flex items-center gap-4 text-sm">
            <Link href="/" className="text-gray-300 hover:text-white transition">Home</Link>
            <Link href="/resources" className="text-gray-300 hover:text-white transition">Resources</Link>
            <Link href="/support" className="text-gray-300 hover:text-white transition">Support</Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Input 
            type="text" 
            placeholder="Search solutions..." 
            className="bg-[#2E7D7D]/20 border-[#2E7D7D] text-gray-100 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D7D] w-full max-w-xs md:max-w-sm"
          />
          <Button 
            onClick={() => openAgentModal()} 
            className="bg-[#2E7D7D] text-white px-4 py-2 rounded-lg hover:bg-[#2E7D7D]/80 flex items-center gap-2"
          >
            <HiOutlineChatBubbleLeftRight size={18} /> Talk to AI
          </Button>
        </div>
      </header>

      {/*  ----  HERO  ----  */}
      <section className="relative pt-24 pb-16 overflow-hidden bg-[#1E2A44]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
            Enterprise Solutions
          </motion.h1>
          <p className="mt-4 text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto">Transform your business with proven, enterprise-grade technology — or let our AI consultant guide you to the next big thing.</p>
          <div className="mt-8 flex justify-center gap-4">
            <Button className="bg-[#2E7D7D] text-white px-6 py-3 rounded-lg hover:bg-[#2E7D7D]/80 shadow-lg">
              <Link href="#solutions">Explore Solutions</Link>
            </Button>
            <Button 
              onClick={() => openAgentModal()} 
              variant="outline" 
              className="border-[#2E7D7D] text-[#2E7D7D] hover:bg-[#2E7D7D]/20 px-6 py-3 rounded-lg flex items-center gap-2"
            >
              <HiOutlineChatBubbleLeftRight size={20} /> Talk to AI Consultant
            </Button>
          </div>
        </div>
      </section>

      {/*  ----  STICKY CATEGORY PILLS  ----  */}
      <section className="sticky top-0 z-20 bg-[#1E2A44]/80 backdrop-blur border-b border-[#2E7D7D]/30">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-start md:justify-center gap-2 overflow-x-auto pb-2">
            {SERVICE_CATEGORIES.map((cat) => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(cat.id)}
                className={`rounded-full px-4 py-2 text-sm h-8 flex items-center gap-2 ${
                  selectedCategory === cat.id 
                    ? 'bg-[#2E7D7D] text-white' 
                    : 'border-[#2E7D7D]/40 text-gray-300 hover:bg-[#2E7D7D]/20'
                }`}
              >
                <span className={cat.color}>{cat.icon}</span>
                <span>{cat.name}</span>
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/*  ----  SOLUTIONS GRID  ----  */}
      <section id="solutions" className="py-16 bg-[#1E2A44]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-full">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-100 mb-4">
                {selectedCategory === 'all' ? 'All Enterprise Solutions' : SERVICE_CATEGORIES.find((c) => c.id === selectedCategory)?.name}
              </h2>
              <p className="text-gray-300 max-w-2xl mx-auto">Click any solution to explore details or talk to our AI consultant for personalized recommendations.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filtered.map((sol) => (
                <motion.div
                  key={sol.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card 
                    className={`bg-[#1E2A44]/30 border border-[#2E7D7D]/30 shadow-md hover:shadow-xl transition-all duration-300 rounded-xl overflow-hidden ${sol.isHot ? 'ring-1 ring-[#2E7D7D]/50' : ''} cursor-pointer`}
                    onClick={() => setExpandedSolution(expandedSolution === sol.id ? null : sol.id)}
                  >
                    <CardHeader className="flex items-start justify-between pb-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="text-[#2E7D7D] mt-1">{sol.icon}</div>
                        <div>
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-xl text-gray-100">{sol.title}</CardTitle>
                            {sol.isHot && <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold">HOT</span>}
                          </div>
                          <p className="text-sm text-gray-300 mt-1">{sol.description}</p>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                        <div className="flex items-center gap-1">
                          <Clock size={12} />
                          <span>{sol.duration}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign size={12} />
                          <span>{sol.price}</span>
                        </div>
                      </div>
                      
                      <AnimatePresence>
                        {expandedSolution === sol.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="border-t border-gray-600 pt-4 mt-2"
                          >
                            <div className="mb-4">
                              <h4 className="text-sm font-semibold text-gray-200 mb-2 flex items-center gap-1">
                                <Check size={14} className="text-[#2E7D7D]" /> Key Services
                              </h4>
                              <ul className="text-xs text-gray-300 space-y-1 ml-4">
                                {sol.services.slice(0, 4).map((s) => (
                                  <li key={s} className="flex items-center gap-2">
                                    <span className="text-[#2E7D7D]">•</span> {s}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            
                            <div className="mb-4">
                              <h4 className="text-sm font-semibold text-gray-200 mb-2 flex items-center gap-1">
                                <Star size={14} className="text-[#2E7D7D]" /> Benefits
                              </h4>
                              <ul className="text-xs text-gray-300 space-y-1 ml-4">
                                {sol.benefits.slice(0, 3).map((b) => (
                                  <li key={b} className="flex items-center gap-2">
                                    <span className="text-[#2E7D7D]">→</span> {b}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      
                      <div className="flex gap-2 mt-4">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            openAgentModal(sol);
                          }}
                          className="flex-1 bg-[#2E7D7D] text-white hover:bg-[#2E7D7D]/80 rounded-lg text-sm py-2 flex items-center justify-center gap-2"
                        >
                          <HiOutlineChatBubbleLeftRight size={14} /> Get AI Quote
                        </Button>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            openAgentModal(sol);
                          }}
                          variant="outline"
                          className="border-[#2E7D7D]/40 text-[#2E7D7D] hover:bg-[#2E7D7D]/20 rounded-lg text-sm py-2 px-3"
                        >
                          <ArrowUpRight size={14} />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/*  ----  CASE STUDIES  ----  */}
      <section id="success" className="py-16 bg-[#1E2A44] border-t border-[#2E7D7D]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl font-bold text-gray-100 mb-4 text-center"
          >
            Success Stories
          </motion.h2>
          <p className="text-gray-300 text-center max-w-2xl mx-auto mb-12">See how MutSyncHub has empowered businesses with transformative technology.</p>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {CASE_STUDIES.map((study, idx) => (
              <motion.div
                key={study.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="bg-[#1E2A44]/30 rounded-lg p-6 shadow-md hover:shadow-xl transition-shadow border border-[#2E7D7D]/30 hover:border-[#2E7D7D] cursor-pointer"
                onClick={() => window.dispatchEvent(new CustomEvent('openCaseStudy', { detail: study }))}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[#2E7D7D]">{study.icon}</span>
                  <h3 className="text-xl font-semibold text-gray-100">{study.title}</h3>
                </div>
                <p className="text-[#2E7D7D] mb-4 font-medium">{study.client}</p>
                <p className="text-gray-300 mb-4 line-clamp-3">{study.challenge}</p>
                <div className="flex flex-wrap gap-2">
                  {study.results.slice(0, 3).map((result, i) => (
                    <span key={i} className="text-xs bg-[#2E7D7D] text-white px-3 py-1 rounded-full">
                      {result}
                    </span>
                  ))}
                </div>
                <Button variant="link" className="mt-4 text-[#2E7D7D] hover:text-cyan-300 p-0">
                  Read Full Case Study →
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/*  ----  FOOTER CTA  ----  */}
      <section className="py-16 bg-[#1E2A44] border-t border-[#2E7D7D]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-100 mb-4">Ready to Transform Your Business?</h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">Join leading enterprises leveraging MutSyncHub's AI and cloud solutions for unparalleled growth.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              onClick={() => openAgentModal()}
              className="bg-[#2E7D7D] text-white px-8 py-3 rounded-lg hover:bg-[#2E7D7D]/80"
            >
              Schedule Free Consultation
            </Button>
            <Button variant="outline" className="border-[#2E7D7D] text-[#2E7D7D] hover:bg-[#2E7D7D]/20 px-8 py-3 rounded-lg" asChild>
              <Link href="#solutions">Explore All Solutions</Link>
            </Button>
          </div>
        </div>
      </section>

      {/*  ----  AI CONSULTANT MODAL  ----  */}
      <AnimatePresence>
        {showAgentModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={closeAgentModal}
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
                  <span className="text-[#2E7D7D] text-xl">🤖</span>
                  <div>
                    <p className="font-semibold text-gray-100">MutSyncHub Solutions Consultant</p>
                    <p className="text-xs text-gray-400">
                      {selectedSolution ? `Discussing: ${selectedSolution.title}` : 'Ask me anything about our solutions'}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeAgentModal}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={20} />
                </Button>
              </div>
              <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
                <SolutionsAgent solutions={SOLUTIONS} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}