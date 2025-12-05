// src/components/home/AboutSection.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Database, BarChart, Clock, Users, Lock, Cpu, LineChart, PieChart, Globe, MessageSquare, ArrowRight, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import LottieSectionAnimation from '@/components/animations/LottieSectionAnimation';

const AboutSection: React.FC = () => {
  const sections = [
    {
      title: 'Empowering Businesses with Intelligent Technology',
      content:
        "At MutSyncHub, we're not just building software; we're crafting intelligent ecosystems that help businesses grow with confidence. From real-time data automation to smart cloud solutions, our approach is always tailored and future-forward.",
      animation: 'intelligent-technology.json',
    },
    {
      title: 'The Data Challenge Enterprises Face',
      content:
        'For too long, businesses have wrestled with data scattered across systems, struggling to extract timely, actionable insights. Manual reporting delays crucial decisions, and the true potential of your operations remains locked away. This is where MutSyncHub steps in, transforming your raw data into your most strategic asset.',
      animation: 'data-silos.json',
    },
    {
      title: 'The AI-Powered Intelligence Platform',
      content:
        "We've engineered an enterprise-grade AI Data Analytics Platform designed for the core of your business. Whether you're a major wholesaler, a dynamic retail chain, a bustling supermarket, or a manufacturing powerhouse, if you possess data – from intricate databases to daily POS transactions – MutSyncHub is built for you.",
      animation: 'ai-powered-intelligence.json',
    },
    {
      title: 'Unrivaled Data Exploration',
      content:
        "Our engine dives deep, generating advanced statistics (mean, std, skewness, kurtosis), mapping crucial correlations, and highlighting feature importance. We pinpoint outliers and anomalies with precision using advanced statistical and machine learning methods, ensuring your data's integrity. We even perform distribution tests and dimensionality reduction (PCA) to give you a crystal-clear understanding of your data's underlying structure.",
      animation: 'statistical-analysis.json',
    },
    {
      title: 'Strategic Forecasting & Market Insights',
      content:
        'Look to the future with confidence. MutSyncHub expertly analyzes temporal patterns, decomposes time series for trends and seasonality, and integrates with cutting-edge tools like Prophet for advanced forecasting. Understand your customers and products like never before. Our platform employs powerful clustering algorithms to segment your market with unparalleled accuracy, providing the insights needed for hyper-targeted strategies.',
      animation: 'time-series-prediction.json',
    },
    {
      title: 'Your Trusted AI Partner: The Contextual Agent',
      content:
        "Imagine having a data analyst on demand, available 24/7. Our groundbreaking contextual-aware agent makes this a reality. Simply query it using natural language, and it delves into the analyzed data, delivering comprehensive reports and answers to your questions instantly. Crucially, in an era where AI adoption can raise concerns about data privacy, we've prioritized your peace of mind. Our agent operates locally, meaning your sensitive enterprise data remains within your secure environment.",
      animation: 'ai-partner.json', // You'll need to download this
    },
  ];

  const router = useRouter();

  return (
    <section className="relative bg-white py-16 px-6 text-[#1E2A44] overflow-hidden">
      {/* Subtle gradient overlays */}
      <div
        className="pointer-events-none absolute top-0 left-0 w-full h-16 z-10"
        style={{ background: 'linear-gradient(to bottom, rgba(46, 125, 125, 0.1) 0%, transparent 100%)' }}
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 w-full h-16 z-10"
        style={{ background: 'linear-gradient(to top, rgba(46, 125, 125, 0.1) 0%, transparent 100%)' }}
      />

      <div className="max-w-7xl mx-auto">
        {sections.map((section, index) => (
          <div
            key={index}
            className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16 ${index % 2 === 0 ? '' : 'lg:grid-flow-col-dense'}`}
          >
            {/* Text content - alternates sides */}
            <div className={`${index % 2 === 0 ? 'lg:order-1' : 'lg:order-2'}`}>
              <motion.h2
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="text-3xl md:text-4xl font-bold mb-6 text-[#1E2A44]"
              >
                {section.title}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="text-lg text-[#4A5568] leading-relaxed"
              >
                {section.content}
              </motion.p>
            </div>
            
            {/* Lottie Animation - alternates sides */}
            <motion.div
              className={`${index % 2 === 0 ? 'lg:order-2' : 'lg:order-1'}`}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <LottieSectionAnimation 
                animationPath={section.animation}
                delay={0.3}
                className="rounded-2xl shadow-sm border border-[#E2E8F0]"
              />
            </motion.div>
          </div>
        ))}
        
        {/* Final CTA */}
        <div className="text-center mt-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="inline-block bg-[#2E7D7D]/10 px-6 py-2 rounded-full text-base font-semibold text-[#2E7D7D] mb-6"
          >
            Ready to unlock the full power of your data?
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Button
              className="group bg-[#2E7D7D] text-white px-8 py-3 text-base font-semibold rounded-md hover:bg-[#256363] transition-colors duration-200 shadow-sm hover:shadow-md"
              onClick={() => router.push('/signup')}
            >
              Launch Analytics Engine
              <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;