// src/components/home/CTASection.tsx
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export const CTASection: React.FC = () => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { y: 10, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { duration: 0.3 } },
  };

  return (
    <section className="bg-white py-16 px-6">
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="mx-auto max-w-6xl text-center"
      >
        <motion.h2
          variants={item}
          className="text-3xl md:text-4xl font-bold text-[#1E2A44] mb-4"
        >
          Ready to Transform Your Business?
        </motion.h2>

        <motion.p
          variants={item}
          className="text-lg text-[#4A5568] max-w-2xl mx-auto mt-4 leading-relaxed"
        >
          Join industry leaders who rely on MutSyncHub for intelligent automation, seamless integrations, and powerful insights.
        </motion.p>

        <motion.div
          variants={item}
          className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4"
        >
          <Button
            asChild
            size="lg"
            className="rounded-md bg-[#2E7D7D] text-white font-semibold hover:bg-[#256363] px-8 text-base transition-colors duration-200 shadow-sm hover:shadow-md"
          >
            <a href="/signup">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="rounded-md border-2 border-[#2E7D7D] bg-white text-[#2E7D7D] font-semibold hover:bg-[#2E7D7D]/10 hover:border-[#256363] hover:text-[#256363] text-base"
            onClick={() => {
              if (window && window.dispatchEvent) {
                window.dispatchEvent(new CustomEvent('openConsultationModal', { detail: { preselect: 'analytics-demo' } }));
              }
            }}
          >
            Schedule Demo
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
};