// src/components/home/EnterpriseTrust.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Globe, BarChart, Cpu, Server } from 'lucide-react';

const EnterpriseTrust = () => {
  const stats = [
    { value: '99.99%', label: 'Uptime', icon: <Server className="h-6 w-6 text-[#2E7D7D]" /> },
    { value: '256-bit', label: 'Encryption', icon: <Lock className="h-6 w-6 text-[#2E7D7D]" /> },
    { value: 'ISO 27001', label: 'Certified', icon: <ShieldCheck className="h-6 w-6 text-[#2E7D7D]" /> },
    { value: '50+', label: 'Global Clients', icon: <Globe className="h-6 w-6 text-[#2E7D7D]" /> },
    { value: '4.9/5', label: 'Satisfaction', icon: <BarChart className="h-6 w-6 text-[#2E7D7D]" /> },
    { value: 'AI-Powered', label: 'Security', icon: <Cpu className="h-6 w-6 text-[#2E7D7D]" /> },
  ];

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
    <section className="bg-[#1E2A44] py-16 px-6 text-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Trusted by Enterprise Leaders
          </h2>
          <p className="text-base text-[#A0AEC0] max-w-3xl mx-auto mt-2">
            Built with enterprise-grade security, reliability, and scalability at its core.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              variants={item}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="bg-[#2A3756] rounded-lg p-6 text-center border border-[#E2E8F0]/20 shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div className="w-12 h-12 rounded-md bg-[#E2E8F0]/10 flex items-center justify-center mx-auto mb-4">
                {stat.icon}
              </div>
              <div className="text-xl font-semibold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-[#A0AEC0]">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EnterpriseTrust;