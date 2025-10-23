'use client';
export const dynamic = 'force-dynamic';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Search, BookOpen, Code, Video, LifeBuoy, Newspaper, FileText, Library,
  Filter, Grid, List, ChevronRight, ArrowRight, Star, Cpu, Cloud, Database,
  Bot, Globe, Code2, LayoutGrid
} from 'lucide-react';
import { SiHiveBlockchain, SiKubernetes, SiTerraform, SiReact, SiNodedotjs, SiRedis, SiPython, SiTensorflow, SiApachekafka } from 'react-icons/si';
import { resources } from '@/data/resources'; // your data stays

/* ----------  THEME CONSTANTS (same as solutions page) ---------- */
const DEEP_NAVY = '#1E2A44';
const TEAL = '#2E7D7D';
const TEXT_MAIN = 'text-gray-100';
const TEXT_SEC = 'text-gray-300';

export default function ResourcesPage() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams?.get('category') || 'all';
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  useEffect(() => setActiveCategory(searchParams?.get('category') || 'all'), [searchParams]);

  const filteredResources = useMemo(() => {
    return resources.filter(r =>
      (r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
       r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
       r.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))) &&
      (activeCategory === 'all' || r.category === activeCategory)
    );
  }, [searchTerm, activeCategory]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    resources.forEach(r => { counts[r.category] = (counts[r.category] || 0) + 1; });
    return counts;
  }, []);

  const categories = [
    { id: 'all', name: 'All Resources', icon: <Library size={18} />, count: resources.length },
    { id: 'documentation', name: 'Documentation', icon: <BookOpen size={18} />, count: categoryCounts.documentation || 0 },
    { id: 'api', name: 'API Reference', icon: <Code size={18} />, count: categoryCounts.api || 0 },
    { id: 'guides', name: 'Guides & Tutorials', icon: <Video size={18} />, count: categoryCounts.guides || 0 },
    { id: 'support', name: 'Support', icon: <LifeBuoy size={18} />, count: categoryCounts.support || 0 },
    { id: 'blog', name: 'Blog', icon: <Newspaper size={18} />, count: categoryCounts.blog || 0 },
    { id: 'whitepapers', name: 'White Papers', icon: <FileText size={18} />, count: categoryCounts.whitepapers || 0 },
  ];

  /* ----------  TRUST BAR (icons instead of broken svgs) ---------- */
  const TrustIcons = () => (
    <div className="flex justify-center gap-8 flex-wrap text-3xl text-teal-400">
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

  /* ----------  RESOURCE CARD (enterprise skin) ---------- */
  const ResourceCard = ({ r }: { r: any }) => (
    <Card className="bg-[#1E2A44]/30 border border-[#2E7D7D]/30 shadow-md hover:shadow-xl transition-shadow rounded-xl">
      <CardHeader>
        <CardTitle className="text-gray-100">{r.title}</CardTitle>
        <p className="text-sm text-gray-300 mt-1">{r.description}</p>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <span className="text-xs bg-teal-600/10 text-teal-300 px-2 py-1 rounded">{r.category}</span>
          <Link href={`/resources/${r.id}`} className="text-teal-400 hover:text-teal-300 flex items-center gap-1 text-sm">
            Read <ArrowRight size={14} />
          </Link>
        </div>
      </CardContent>
    </Card>
  );

  /* ----------  MAIN RETURN (enterprise theme) ---------- */
  return (
    <div className="min-h-screen bg-[#1E2A44] text-gray-100 font-inter">
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
                      className="bg-[#2E7D7D]/20 border-[#2E7D7D] text-gray-100 placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-[#2E7D7D] w-64"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Button asChild className="bg-teal-600 text-white hover:bg-teal-700 px-4 py-2 rounded-lg">
                      <Link href="/what-we-do-support">Contact Sales</Link>
                    </Button>
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
            Knowledge Hub
          </motion.h1>
          <p className="mt-4 text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto">
            Explore 500+ resources to master integrations, analytics, and AI with MutSyncHub’s enterprise-grade solutions.
          </p>
          <div className="mt-8 max-w-2xl mx-auto">
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search documentation, APIs, guides..."
              className="bg-[#2E7D7D]/20 border-[#2E7D7D] text-gray-100 placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-[#2E7D7D]"
            />
          </div>
          <div className="mt-8 flex justify-center gap-6 text-sm font-medium text-gray-400">
            <Link href="/" className="hover:text-cyan-400 transition-colors">Home</Link>
            <Link href="/solutions" className="hover:text-cyan-400 transition-colors">Solutions</Link>
            <Link href="/what-we-do-support" className="hover:text-cyan-400 transition-colors">Support</Link>
          </div>
        </div>
      </section>

      {/* TRUST BAR (icons, no 404s) */}
      <section className="py-12 bg-[#1E2A44]/50 border-t border-[#2E7D7D]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-semibold text-gray-100 mb-6">Trusted by Industry Leaders</h2>
          <TrustIcons />
        </div>
      </section>

      {/* METRICS */}
      <section className="py-16 bg-[#1E2A44]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-100 mb-8">A Wealth of Knowledge</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[ {n: '500+', l: 'Resources'}, {n: '1000+', l: 'Downloads'}, {n: '50+', l: 'Contributors'} ].map(m => (
              <div key={m.l} className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                <h3 className="text-4xl font-extrabold text-cyan-400">{m.n}</h3>
                <p className="text-gray-300 mt-2">{m.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FILTER + GRID */}
      <section className="py-16 bg-[#1E2A44]/30 border-t border-[#2E7D7D]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <aside className="lg:w-1/4">
              <div className="sticky top-24 bg-[#1E2A44]/50 rounded-lg p-6 border border-[#2E7D7D]/30 shadow-md">
                <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-100 mb-4"><Filter size={20} /> Filter</h2>
                <div className="space-y-2">
                  {categories.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setActiveCategory(c.id)}
                      className={`flex items-center justify-between w-full p-3 rounded-lg text-left transition-all ${
                        activeCategory === c.id ? 'bg-cyan-600/10 text-cyan-300' : 'text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-3"><span className="text-cyan-400">{c.icon}</span><span>{c.name}</span></div>
                      <span className="bg-gray-700 text-gray-300 rounded-full px-2 py-1 text-xs">{c.count}</span>
                    </button>
                  ))}
                </div>
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-100 mb-3">Popular Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {['API', 'Integration', 'Dashboard', 'Analytics', 'Security', 'Onboarding', 'Best Practices', 'Data Models'].map(tag => (
                      <button key={tag} onClick={() => setSearchTerm(tag)} className="text-xs bg-gray-700 text-gray-300 hover:bg-cyan-600/20 hover:text-cyan-300 px-3 py-1 rounded-full transition-colors">{tag}</button>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* Content */}
            <main className="lg:w-3/4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-100">
                  {activeCategory === 'all' ? 'All Resources' : categories.find(c => c.id === activeCategory)?.name}
                  <span className="text-gray-400 text-lg font-normal ml-2">({filteredResources.length})</span>
                </h2>
                <div className="flex gap-2">
                  <Button variant={viewMode === 'grid' ? 'default' : 'outline'} onClick={() => setViewMode('grid')} className={`${viewMode === 'grid' ? 'bg-teal-600 text-white' : 'border-gray-600 text-gray-200'}`}>Grid</Button>
                  <Button variant={viewMode === 'table' ? 'default' : 'outline'} onClick={() => setViewMode('table')} className={`${viewMode === 'table' ? 'bg-teal-600 text-white' : 'border-gray-600 text-gray-200'}`}>Table</Button>
                </div>
              </div>

              {filteredResources.length === 0 ? (
                <div className="bg-gray-800/50 rounded-lg p-12 text-center border border-gray-700">
                  <Search size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-100 mb-2">No resources found</h3>
                  <p className="text-gray-400">Try adjusting your search or filter criteria</p>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredResources.map(r => (
                    <motion.div key={r.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                      <ResourceCard r={r} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden">
                  <table className="min-w-full text-sm text-left text-gray-300">
                    <thead className="bg-gray-700/50 text-xs uppercase"><tr>
                      <th className="px-4 py-3">Title</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Action</th>
                    </tr></thead>
                    <tbody>
                      {filteredResources.map(r => (
                        <tr key={r.id} className="border-b border-gray-700 hover:bg-gray-700/30">
                          <td className="px-4 py-3 text-gray-100">{r.title}</td>
                          <td className="px-4 py-3"><span className="bg-teal-600/10 text-teal-300 px-2 py-1 rounded text-xs">{r.category}</span></td>
                          <td className="px-4 py-3 text-gray-400">{r.type}</td>
                          <td className="px-4 py-3"><Link href={`/resources/${r.id}`} className="text-teal-400 hover:text-teal-300 flex items-center gap-1 text-xs">View <ArrowRight size={12}/></Link></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </main>
          </div>
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="py-16 bg-[#1E2A44]/50 border-t border-[#2E7D7D]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-100 mb-4">Need More Help?</h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">Connect with our 24/7 support team or dive deeper into our resources for expert guidance.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild className="bg-teal-600 text-white hover:bg-teal-700 px-8 py-3 rounded-lg">
              <Link href="/what-we-do-support">Contact Support</Link>
            </Button>
            <Button variant="outline" asChild className="border-teal-600 text-teal-400 hover:bg-teal-600/20 px-8 py-3 rounded-lg">
              <Link href="/resources/api-guide">Download API Guide</Link>
            </Button>
          </div>
          <div className="mt-8 flex justify-center gap-6 text-sm font-medium text-gray-400">
            <Link href="/" className="hover:text-cyan-400 transition-colors">Home</Link>
            <Link href="/solutions" className="hover:text-cyan-400 transition-colors">Solutions</Link>
            <Link href="/what-we-do-support" className="hover:text-cyan-400 transition-colors">Support</Link>
            <Link href="/resources" className="hover:text-cyan-400 transition-colors">Resources</Link>
          </div>
        </div>
      </section>
    </div>
  );
}