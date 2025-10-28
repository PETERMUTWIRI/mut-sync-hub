'use client';

import React from 'react';
import { HiChartPie } from 'react-icons/hi';
import { motion } from 'framer-motion';
import { useUsage } from '@/hooks/useUsage'; // ← new hook

const UsageCard: React.FC = () => {
  const { data, isLoading, error } = useUsage();

  if (isLoading) return <div className="h-5 w-32 bg-gray-700 rounded animate-pulse" />;
  if (error) return <div className="text-red-400 text-base">Failed to load usage.</div>;

  const used = data?.used ?? 0;
  const limit = data?.limit ?? 0;
  const pct = limit ? Math.min((used / limit) * 100, 100) : 0;

  return (
    <motion.div className="glass-card" whileHover={{ scale: 1.02 }}>
      <div className="flex items-center gap-3 mb-4">
        <HiChartPie className="text-[#2E7D7D] text-2xl" />
        <span className="text-white font-semibold text-lg">Usage</span>
      </div>
      <div className="text-white font-bold text-xl mb-2">{used} / {limit} queries</div>
      <div className="w-full h-4 bg-gray-700 rounded-full overflow-hidden">
        <div className="h-4 bg-[#2E7D7D] rounded-full" style={{ width: `${pct}%` }} />
      </div>
    </motion.div>
  );
};

export default UsageCard;