// src/components/home/SolutionsOverview.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Cloud, Bot, Database, Cpu, LayoutGrid, Code, ArrowRight, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SolutionsOverview = () => {
  const solutions = [
    {
      id: 'ai-agent-ecosystems',
      icon: <Cpu className="h-6 w-6 text-[#2E7D7D]" />,
      title: 'AI Agent Ecosystems',
      desc: 'Autonomous AI systems that collaborate to solve complex business problems',
      category: 'ai',
      accent: 'from-[#2A3756] to-[#1E2A44]',
    },
    {
      id: 'cloud-architecture',
      icon: <Cloud className="h-6 w-6 text-[#2E7D7D]" />,
      title: 'Cloud Architecture',
      desc: 'Design and implement resilient, scalable cloud infrastructures',
      category: 'cloud',
      accent: 'from-[#2A3756] to-[#1E2A44]',
    },
    {
      id: 'data-engineering',
      icon: <Database className="h-6 w-6 text-[#2E7D7D]" />,
      title: 'Data Engineering',
      desc: 'Build robust pipelines that transform information into intelligence',
      category: 'data',
      accent: 'from-[#2A3756] to-[#1E2A44]',
    },
    {
      id: 'enterprise-chatbots',
      icon: <Bot className="h-6 w-6 text-[#2E7D7D]" />,
      title: 'Enterprise Chatbots',
      desc: 'AI-powered conversational interfaces for complex workflows',
      category: 'automation',
      accent: 'from-[#2A3756] to-[#1E2A44]',
    },
    {
      id: 'multi-tenant-saas',
      icon: <LayoutGrid className="h-6 w-6 text-[#2E7D7D]" />,
      title: 'Multi-Tenant SaaS',
      desc: 'Build scalable SaaS solutions with efficient resource sharing',
      category: 'web',
      accent: 'from-[#2A3756] to-[#1E2A44]',
    },
    {
      id: 'api-integrations',
      icon: <Code className="h-6 w-6 text-[#2E7D7D]" />,
      title: 'API Integrations',
      desc: 'Connect your ecosystem with robust, secure API integrations',
      category: 'integrations',
      accent: 'from-[#2A3756] to-[#1E2A44]',
    },
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState<'up' | 'down'>('down');
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleScroll = (e: React.WheelEvent<HTMLDivElement>) => {
    if (scrollTimeout.current) return;

    if (e.deltaY > 0) {
      setDirection('down');
      setActiveIndex((prev) => (prev + 1) % solutions.length);
    } else {
      setDirection('up');
      setActiveIndex((prev) => (prev - 1 + solutions.length) % solutions.length);
    }

    scrollTimeout.current = setTimeout(() => {
      scrollTimeout.current = null;
    }, 800);
  };

  useEffect(() => {
    return () => {
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    };
  }, []);

  return (
    <section className="relative bg-white py-16 px-6 text-[#1E2A44] overflow-hidden min-h-screen flex items-center pb-0">
      {/* Subtle geometric background */}
      <div className="absolute inset-0 z-0 opacity-[0.05]">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1000 1000"
          className="w-full h-full text-[#2E7D7D]"
        >
          <defs>
            <pattern
              id="mut-pattern"
              width="80"
              height="80"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(15)"
            >
              <path d="M0,0 L80,0 L80,80 Z" fill="none" stroke="currentColor" strokeWidth="1" />
              <circle cx="40" cy="40" r="3" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#mut-pattern)" />
        </svg>
      </div>

      {/* Subtle gradient overlays */}
      <div
        className="pointer-events-none absolute top-0 left-0 w-full h-64 z-5"
        style={{ background: 'linear-gradient(to bottom, rgba(46, 125, 125, 0.1) 0%, transparent 100%)' }}
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 w-full h-64 z-5"
        style={{ background: 'linear-gradient(to top, rgba(46, 125, 125, 0.1) 0%, transparent 100%)' }}
      />

      <div className="max-w-7xl mx-auto w-full relative z-10 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 min-h-[70vh]">
          {/* Left: Elevated message panel */}
          <div className="relative flex flex-col justify-between p-12 bg-white rounded-l-3xl shadow-[0_10px_20px_-5px_rgba(0,0,0,0.05)] border-r border-[#E2E8F0] min-h-[60vh]">
            {/* Subtle corner elements */}
            <div className="absolute top-8 left-8 w-12 h-12 border-t-2 border-l-2 border-[#2E7D7D]/50 rounded-tl-lg"></div>
            <div className="absolute bottom-8 right-8 w-12 h-12 border-b-2 border-r-2 border-[#2E7D7D]/50 rounded-br-lg"></div>

            <div className="pb-2">
              <div className="inline-flex items-center bg-[#2E7D7D]/10 px-5 py-2 rounded-full text-base font-semibold text-[#2E7D7D] mb-6">
                <span className="mr-2">✦</span> Enterprise Excellence
              </div>
              <motion.h2
                className="text-4xl md:text-5xl font-bold text-[#1E2A44] mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                MutSyncHub: Where Vision Meets Execution
              </motion.h2>
              <motion.p
                className="text-lg text-[#4A5568] mb-10 leading-relaxed max-w-2xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.8 }}
              >
                We architect digital transformations that propel enterprises forward. Our solutions blend cutting-edge technology with strategic insight to create sustainable competitive advantages.
              </motion.p>

              <div className="flex flex-wrap gap-3 mb-10">
                {['AI Innovation', 'Cloud Mastery', 'Data Intelligence', 'Automation Excellence'].map((tag, i) => (
                  <motion.span
                    key={tag}
                    className="px-4 py-2 bg-[#E2E8F0]/50 border border-[#E2E8F0] rounded-full text-[#2E7D7D] text-sm font-medium"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                  >
                    {tag}
                  </motion.span>
                ))}
              </div>
            </div>

            <div className="pb-2">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mb-8"
              >
                <Button
                  size="lg"
                  className="group bg-[#2E7D7D] text-white px-8 py-6 text-base font-semibold rounded-md hover:bg-[#256363] transition-colors duration-200 shadow-sm hover:shadow-md"
                  onClick={() => router.push('/solutions')}
                >
                  Explore Our Solutions
                  <ArrowRight className="ml-3 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </motion.div>
              {/* Compact solution list */}
              <div className="pt-4 border-t border-[#E2E8F0]">
                <h3 className="text-base font-semibold text-[#1E2A44] mb-4">Our Solutions</h3>
                <div className="grid grid-cols-2 gap-3">
                  {solutions.map((solution, idx) => (
                    <motion.button
                      key={solution.id}
                      className={`flex items-center px-4 py-2 rounded-md text-left transition-all ${
                        activeIndex === idx
                          ? 'bg-[#2E7D7D]/10 border border-[#2E7D7D]/50 shadow-sm'
                          : 'hover:bg-[#2E7D7D]/5'
                      }`}
                      onClick={() => {
                        setDirection(activeIndex < idx ? 'down' : 'up');
                        setActiveIndex(idx);
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span className="mr-3 text-[#2E7D7D]">{solution.icon}</span>
                      <span className="text-sm font-medium text-[#1E2A44]">{solution.title}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Premium solution showcase */}
          <div
            className="relative h-full overflow-hidden rounded-r-3xl bg-[#2A3756] border border-[#E2E8F0]/30"
            onWheel={handleScroll}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Active solution showcase */}
            <div className="absolute inset-0 flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={{
                    opacity: 0,
                    y: direction === 'down' ? 100 : -100,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.7, ease: [0.33, 1, 0.68, 1] },
                  }}
                  exit={{
                    opacity: 0,
                    y: direction === 'down' ? -100 : 100,
                    transition: { duration: 0.4 },
                  }}
                  className={`absolute inset-0 bg-gradient-to-br ${solutions[activeIndex].accent} flex flex-col justify-center items-center text-center p-12`}
                >
                  <div className="mb-8">
                    <div className="w-20 h-20 rounded-md bg-[#E2E8F0]/10 backdrop-blur-sm flex items-center justify-center mb-6 mx-auto border border-[#E2E8F0]/20">
                      {solutions[activeIndex].icon}
                    </div>
                    <h3 className="text-2xl font-semibold text-white mb-4">{solutions[activeIndex].title}</h3>
                    <p className="text-base text-[#A0AEC0] max-w-md">{solutions[activeIndex].desc}</p>
                  </div>

                  <Button
                    className="group bg-[#2E7D7D] text-white px-8 py-5 text-base font-semibold rounded-md hover:bg-[#256363] border border-[#E2E8F0]/20 transition-colors duration-200 shadow-sm hover:shadow-md"
                    onClick={() => router.push(`/solutions?id=${solutions[activeIndex].id}`)}
                  >
                    Discover More
                    <ArrowRight className="ml-3 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Floating solution stack preview */}
            <div className="absolute right-8 top-1/2 transform -translate-y-1/2 flex flex-col gap-2 z-20">
              {solutions.map((solution, idx) => (
                <motion.button
                  key={solution.id}
                  className={`w-3 h-3 rounded-full transition-all ${
                    activeIndex === idx ? 'bg-[#2E7D7D] scale-125' : 'bg-[#A0AEC0] hover:bg-[#2E7D7D]/60'
                  }`}
                  onClick={() => {
                    setDirection(activeIndex < idx ? 'down' : 'up');
                    setActiveIndex(idx);
                    router.push(`/solutions?id=${solution.id}`);
                  }}
                  whileHover={{ scale: 1.3 }}
                  aria-label={`View ${solution.title}`}
                />
              ))}
            </div>

            {/* Scroll indicators */}
            <AnimatePresence>
              {isHovered && (
                <>
                  <motion.div
                    className="absolute top-8 left-1/2 transform -translate-x-1/2 flex items-center justify-center bg-[#1E2A44]/50 backdrop-blur-sm rounded-md px-4 py-2 text-sm text-white"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <ChevronUp className="mr-2" />
                    <span>Scroll to navigate</span>
                    <ChevronDown className="ml-2" />
                  </motion.div>

                  <motion.div
                    className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-[#A0AEC0] text-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {activeIndex + 1} / {solutions.length}
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* Subtle next/prev preview */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {activeIndex > 0 && (
                <div className="absolute top-0 left-0 w-full h-[30%] opacity-20 bg-gradient-to-b from-[#2A3756] to-transparent"></div>
              )}
              {activeIndex < solutions.length - 1 && (
                <div className="absolute bottom-0 left-0 w-full h-[30%] opacity-20 bg-gradient-to-t from-[#2A3756] to-transparent"></div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Subtle shadow at bottom for smooth transition */}
      <div
        className="absolute bottom-0 left-0 w-full h-8 z-20 pointer-events-none"
        style={{ boxShadow: '0 12px 32px 0 rgba(46, 125, 125, 0.2)' }}
      />
    </section>
  );
};

export default SolutionsOverview;