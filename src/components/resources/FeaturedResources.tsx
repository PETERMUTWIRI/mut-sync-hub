// src/components/resources/FeaturedResources.tsx
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ResourceCard from './ResourceCard';

// Use the Resource type from ResourceCard for compatibility
import type { Resource } from './ResourceCard';

const FeaturedResources = () => {
  // In a real app, this would come from an API
  const featuredResources: Resource[] = [
    {
      id: 'guide-dashboard',
      title: 'Building Custom Dashboards',
      description: 'Step-by-step tutorial for creating advanced analytics dashboards',
      category: 'guides',
      type: 'tutorial',
      url: '/guides/dashboards',
      date: '2025-06-22',
      tags: ['dashboard', 'analytics', 'visualization'],
      featured: true,
    },
    {
      id: 'whitepaper-ai',
      title: 'AI-Powered Data Integration Patterns',
      description: 'Research paper on next-gen data integration using machine learning',
      category: 'whitepapers',
      type: 'whitepaper',
      url: '/whitepapers/ai-integration',
      date: '2025-05-30',
      tags: ['AI', 'machine learning', 'data integration'],
      featured: true,
    },
    {
      id: 'doc-security',
      title: 'Enterprise Security Framework',
      description: 'Comprehensive guide to our security protocols and compliance standards',
      category: 'documentation',
      type: 'pdf',
      url: '/docs/security',
      date: '2025-07-10',
      tags: ['security', 'compliance', 'GDPR'],
      featured: true,
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="mb-12 rounded-2xl shadow-xl bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 p-8"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white drop-shadow-lg">Featured Resources</h2>
        <div className="flex gap-2">
          <button className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white">
            <ChevronLeft size={20} />
          </button>
          <button className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {featuredResources.map(resource => (
          <div className="rounded-2xl shadow-lg bg-gradient-to-br from-blue-800 via-indigo-900 to-purple-900 p-6 transition-transform duration-200 hover:scale-105">
            <ResourceCard key={resource.id} resource={resource} />
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default FeaturedResources;