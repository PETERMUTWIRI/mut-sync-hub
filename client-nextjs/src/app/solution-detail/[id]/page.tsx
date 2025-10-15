'use client';
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
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
// import  SolutionsAgent from '@/components/SolutionsAgent';
import { X, Calendar, Check, ChevronDown, ChevronUp, ArrowRight, Star, Briefcase, Cpu, Cloud, Database, Bot, Globe, Code2, LayoutGrid } from 'lucide-react';
import TestAgent from '@/components/TestAgent';
// Service categories
const SERVICE_CATEGORIES = [
  { id: 'ai', name: 'AI & Automation', icon: <Cpu size={20} /> },
  { id: 'cloud', name: 'Cloud Solutions', icon: <Cloud size={20} /> },
  { id: 'data', name: 'Data Engineering', icon: <Database size={20} /> },
  { id: 'chatbots', name: 'Chatbots', icon: <Bot size={20} /> },
  { id: 'web', name: 'Web Development', icon: <Globe size={20} /> },
  { id: 'integrations', name: 'Integrations', icon: <Code2 size={20} /> },
  { id: 'all', name: 'All Services', icon: <LayoutGrid size={20} /> },
];

// Solutions data (unchanged for brevity)
const SOLUTIONS = [
  {
    id: "analytics-demo",
    title: "Analytics Demo",
    description: "Request a live demonstration of our analytics engine and dashboard capabilities.",
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
    isHot: true
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
    isHot: true
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
    isHot: true
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
    isHot: true
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
    isHot: true
  },
  {
    id: "fullstack",
    title: "Full-Stack Development",
    description: "Build robust and scalable web applications tailored to your business needs.",
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
    ]
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
    ]
  },
  {
    id: "ai-integrations",
    title: "AI-Powered Workflow Automation",
    description: "Transform business processes with intelligent automation that learns and adapts.",
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
    isHot: true
  },
  {
    id: "multitenant",
    title: "Multi-Tenant SaaS Platforms",
    description: "Build scalable, secure SaaS solutions with efficient resource sharing and isolation.",
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
    ]
  },
  {
    id: "data-analytics",
    title: "Advanced Analytics & BI",
    description: "Transform raw data into strategic insights with cutting-edge analytics solutions.",
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
    ]
  },
  {
    id: "api-integrations",
    title: "Enterprise API Integrations",
    description: "Connect your ecosystem with robust, secure API integrations.",
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
    isHot: true
  },
  {
    id: "iot-cloud",
    title: "IoT Cloud Platforms",
    description: "Connect, manage, and derive value from IoT ecosystems at scale.",
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
    isHot: true
  },
  {
    id: "blockchain",
    title: "Blockchain Integration",
    description: "Leverage distributed ledger technology for secure, transparent transactions.",
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
    ]
  }
];

// Case studies data
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
    testimonial: "The AI agent ecosystem reduced our fraud losses by 92% in the first quarter while improving customer experience through fewer false positives. The system continues to improve autonomously."
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
    testimonial: "Our cloud transformation enabled us to handle 300% patient volume increases during critical periods without service degradation. The cost savings funded our telehealth expansion."
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
    testimonial: "Our AI assistant now handles 15,000+ daily conversations with higher satisfaction than human agents. It's transformed how we engage customers across all touchpoints."
  }
];

// Consultation times for scheduling
const CONSULTATION_TIMES = [
  "9:00 AM", "10:00 AM", "11:00 AM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"
];

/* ---------- HOT 2025 / 26 SERVICES (only inside AI) ---------- */
const HOT_SERVICES = [
  "Quantum-Safe Crypto Stack","Edge-AI for IoT","Synthetic Data Generator",
  "Voice-Cloning Defense","Serverless LLM Runtime","Green Cloud Optimizer",
  "Real-time Fraud Graph","Privacy-Preserving Analytics","Autonomous Supply-Chain"
];



/* ---------- NEW: Agent-powered component ---------- */
function SolutionsAgent({ solutions }: { solutions: Solution[] }) {
  type Message = { role: 'user' | 'assistant'; content: string };
  
  const [threadId] = useState(() => `sol-${Date.now()}`);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [requiresContact, setRequiresContact] = useState(false);
  const [booking, setBooking] = useState(false);
  
  /* ---------- helpers ---------- */
  const callAgent = async (action: string, payload: any) => {
    const res = await fetch('/api/agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, payload }),
    });
    
    // ➜  read raw text first
    const text = await res.text();
    if (!text) return { json: null, status: res.status }; // empty body guard
    
    try {
      const json = JSON.parse(text);
      return { json, status: res.status };
    }  catch (e) {
      console.error('Bad agent JSON:', text, e);
      return { json: null, status: res.status };
    }
  };
  
  const { json, status } = await callAgent('chat', { message, threadId });
  
  // ➜  never crash on null / missing field
  if (!json || !json.content) {
    setMessages((m) => [...m, { role: 'assistant', content: 'Sorry, I could not process that.' }]);
    setLoading(false);
    return;
  }
  
  setMessages((m) => [...m, { role: 'assistant', content: json.content }]);
  
  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    setMessages((m) => [...m, { role: 'user', content: text }]);
    setInput('');
    setLoading(true);
    const { json, status } = await callAgent('chat', { message: text, threadId });
    setLoading(false);
    setMessages((m) => [...m, { role: 'assistant', content: json.content }]);
    if (status === 100 || json.requiresContact) setRequiresContact(true);
  };
  
  const startRequirementFlow = async (service: string) => {
    setMessages((m) => [...m, { role: 'assistant', content: `Let me gather a few details about "${service}"…` }]);
    const { json } = await callAgent('requirements', { service, threadId });
    setMessages((m) => [...m, { role: 'assistant', content: json.question }]);
  };
  
  const book = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const date = fd.get('date') as string;
    const time = fd.get('time') as string;
    const email = fd.get('email') as string;
    setBooking(true);
    await callAgent('book', { date, time, email, threadId });
    setBooking(false);
    setMessages((m) => [...m, { role: 'assistant', content: `✅ Calendar invite sent to ${email}. See you soon!` }]);
  };
  
  /* ---------- UI ---------- */
  return (
    <div className="flex flex-col gap-3 text-sm">
    {/* chat window */}
    <div className="h-64 overflow-y-auto rounded-lg bg-gray-900 border border-gray-700 p-3 flex flex-col gap-2">
    {messages.length === 0 && (
      <p className="text-gray-400">👋 Hi! Ask me anything or pick a solution card below.</p>
    )}
    {messages.map((m, i) => (
      <div key={i} className={m.role === 'user' ? 'self-end' : 'self-start'}>
      {/* ➜  never crash on null / undefined */}
      {m.content ?? '<empty response>'}
      </div>
    ))}
    {loading && <span className="text-gray-400 animate-pulse">Thinking…</span>}
    </div>
    
    {/* input */}
    <form
    onSubmit={(e) => {
      e.preventDefault();
      sendMessage(input);
    }}
    className="flex gap-2"
    >
    <input
    id="ai-chat-input"
    value={input}
    onChange={(e) => setInput(e.target.value)}
    placeholder="Type or speak…"
    className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
    />
    <Button type="submit" size="sm" className="bg-cyan-600 hover:bg-cyan-700 text-white">Send</Button>
    </form>
    
    {/* quick solution chips */}
    <div className="flex flex-wrap gap-2">
    {solutions.slice(0, 5).map((s) => (
      <button
      key={s.id}
      onClick={() => startRequirementFlow(s.title)}
      className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-200 px-2 py-1 rounded-full"
      >
      {s.title}
      </button>
    ))}
    </div>
    
    {/* booking form (shown when agent asks for contact) */}
    {requiresContact && (
      <motion.form
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2"
      onSubmit={book}
      >
      <input name="email" type="email" placeholder="your@email.com" required className="bg-gray-900 border border-gray-700 rounded px-3 py-2 text-gray-100" />
      <input name="date" type="date" required className="bg-gray-900 border border-gray-700 rounded px-3 py-2 text-gray-100" />
      <input name="time" type="time" required className="bg-gray-900 border border-gray-700 rounded px-3 py-2 text-gray-100" />
      <Button type="submit" disabled={loading} className="sm:col-span-3 bg-cyan-600 hover:bg-cyan-700 text-white">
      {loading ? 'Booking…' : 'Book free consultation'}
      </Button>
      </motion.form>
    )}
    </div>
  );
}


/* ---------- rest of YOUR page (unchanged) ---------- */
export default function SolutionsPage() {
  const searchParams = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedSolution, setExpandedSolution] = useState<string | null>(null);
  const [showAgent, setShowAgent] = useState(false);
  
  const filtered = selectedCategory === 'all' ? SOLUTIONS : SOLUTIONS.filter((s) => s.category === selectedCategory);
  
  useEffect(() => {
    const id = searchParams.get('id');
    if (id) setExpandedSolution(id);
  }, [searchParams]);
  
  return (
    <div className="min-h-screen bg-slate-950 text-gray-100 font-sans">
    {/* Hero */}
    <section className="relative pt-24 pb-16 overflow-hidden">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
    <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
    Enterprise Solutions
    </motion.h1>
    <p className="mt-4 text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto">Transform your business with proven, enterprise-grade technology — or let our AI consultant guide you to the next big thing.</p>
    <div className="mt-8 flex justify-center gap-4">
    <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold px-8 py-3 rounded-lg shadow-lg">
    <Link href="#solutions">Explore Solutions</Link>
    </Button>
    <Button variant="outline" onClick={() => setShowAgent(true)} className="border-gray-600 text-gray-200 hover:bg-gray-800 px-8 py-3 rounded-lg flex items-center gap-2">
    <HiOutlineChatBubbleLeftRight size={20} /> Talk to AI Consultant
    </Button>
    </div>
    </div>
    </section>
    
    {/* Sticky Category Pills */}
    <section className="sticky top-0 z-20 bg-slate-950/80 backdrop-blur border-b border-gray-800">
    <div className="max-w-7xl mx-auto px-4 py-1.5">
    <div className="flex items-center justify-center gap-2">
    {SERVICE_CATEGORIES.map((cat) => (
      <Button
      key={cat.id}
      variant={selectedCategory === cat.id ? 'default' : 'outline'}
      onClick={() => setSelectedCategory(cat.id)}
      className={`rounded-full px-2.5 py-1 text-xs h-6 ${selectedCategory === cat.id ? 'bg-cyan-600 text-white' : 'border-gray-600 text-gray-200 hover:bg-gray-800'}`}
      >
      <span className="text-xs">{cat.icon}</span>
      <span className="text-xs">{cat.name}</span>
      </Button>
    ))}
    </div>
    </div>
    </section>
    
    {/* Solutions Grid */}
    <section id="solutions" className="py-16 bg-slate-950">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
    {/* LEFT — Enterprise Cards */}
    <div>
    <h2 className="text-3xl font-bold text-gray-100 mb-4">{selectedCategory === 'all' ? 'Our Solutions' : SERVICE_CATEGORIES.find((c) => c.id === selectedCategory)?.name}</h2>
    <p className="text-gray-300 mb-8">Pick what you need — or let the AI suggest what you don’t know you need yet.</p>
    <div className="space-y-6">
    {filtered.map((sol) => (
      <Card key={sol.id} className="bg-gray-800 border-gray-700 shadow-md">
      <CardHeader className="flex items-start justify-between">
      <div>
      <CardTitle className="text-xl text-gray-100">{sol.title}</CardTitle>
      <p className="text-sm text-gray-300 mt-1">{sol.description}</p>
      </div>
      {sol.isHot && <span className="bg-cyan-600 text-white text-xs px-2 py-1 rounded-full">HOT</span>}
      </CardHeader>
      <CardContent>
      <ul className="text-sm text-gray-300 space-y-1 mb-4">
      {sol.services.slice(0, 3).map((s) => (
        <li key={s} className="flex items-center gap-2">
        <span className="text-cyan-400">✓</span> {s}
        </li>
      ))}
      </ul>
      <Button
      onClick={() => {
        alert('AI consultant will help you refine this — click "Talk to AI Consultant"');
      }}
      className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
      >
      Request This Solution
      </Button>
      </CardContent>
      </Card>
    ))}
    </div>
    </div>
    
    {/* RIGHT — AI Consultant ( collapsible ) */}
    <div className="lg:sticky lg:top-24 self-start">
    <motion.div
    initial={false}
    animate={{ height: showAgent ? 'auto' : 64 }}
    className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden shadow-lg"
    >
    {/* Header Bar */}
    <div
    onClick={() => setShowAgent((s) => !s)}
    className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-700 transition-colors"
    >
    <div className="flex items-center gap-3">
    <span className="text-cyan-400 text-xl">🤖</span>
    <div>
    <p className="font-semibold text-gray-100">Mutsynchub Solutions Consultant</p>
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
      <SolutionsAgent solutions={SOLUTIONS} />
      </motion.div>
    )}
    </AnimatePresence>
    </motion.div>
    
    {/* Enterprise Trust Badges */}
    <div className="mt-6 grid grid-cols-3 gap-4 text-center text-xs text-gray-400">
    <div className="flex flex-col items-center gap-1"><HiOutlinePhone size={20} className="text-cyan-400" /><span>24/7 Support</span></div>
    <div className="flex flex-col items-center gap-1"><HiOutlineEnvelope size={20} className="text-cyan-400" /><span>Email Summary</span></div>
    <div className="flex flex-col items-center gap-1"><HiOutlineCalendar size={20} className="text-cyan-400" /><span>Book Slot</span></div>
    </div>
    </div>
    </div>
    </div>
    </section>
    
    {/* Case Studies (unchanged) */}
    <section id="success" className="py-16 bg-gray-900">
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
      className="bg-gray-800 rounded-lg p-6 shadow-md hover:shadow-xl transition-shadow border border-gray-700 hover:border-cyan-600 cursor-pointer"
      onClick={() => window.dispatchEvent(new CustomEvent('openCaseStudy', { detail: study }))}
      >
      <h3 className="text-xl font-semibold text-gray-100 mb-2">{study.title}</h3>
      <p className="text-cyan-400 mb-4">{study.client}</p>
      <p className="text-gray-300 mb-4 line-clamp-3">{study.challenge}</p>
      <div className="flex flex-wrap gap-2">
      {study.results.slice(0, 3).map((result, i) => (
        <span key={i} className="text-xs bg-cyan-600 text-white px-3 py-1 rounded-full">
        {result}
        </span>
      ))}
      </div>
      <Button variant="link" className="mt-4 text-cyan-400 hover:text-cyan-300 p-0">
      Read Full Case Study →
      </Button>
      </motion.div>
    ))}
    </div>
    </div>
    </section>
    
    {/* Footer CTA (unchanged) */}
    <section className="py-16 bg-gray-900 border-t border-gray-800">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
    <h2 className="text-3xl font-bold text-gray-100 mb-4">Ready to Transform Your Business?</h2>
    <p className="text-gray-300 mb-8 max-w-2xl mx-auto">Join leading enterprises leveraging MutSyncHub’s AI and cloud solutions for unparalleled growth.</p>
    <div className="flex flex-col sm:flex-row justify-center gap-4">
    <Button
    onClick={() => {
      setShowAgent(true);
      setTimeout(() => document.querySelector<HTMLInputElement>('#ai-chat-input')?.focus(), 300);
    }}
    className="bg-cyan-600 text-white hover:bg-cyan-700 px-8 py-3 rounded-lg"
    >
    Schedule Free Consultation
    </Button>
    <Button variant="outline" className="border-gray-600 text-gray-200 hover:bg-gray-800 px-8 py-3 rounded-lg" asChild>
    <Link href="/solutions">Explore All Solutions</Link>
    </Button>
    </div>
    </div>
    </section>
    </div>
  );
}