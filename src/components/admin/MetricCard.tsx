// src/components/admin/MetricCard.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';

interface MetricCardProps {
  icon: ReactNode;
  title: string;
  value: string | number;
  change?: string;
  color: 'cyan' | 'green' | 'amber' | 'purple' | 'red';
}

const colorMap = {
  cyan: {
    bg: 'bg-cyan-400/10',
    text: 'text-cyan-400',
    border: 'border-cyan-400/30'
  },
  green: {
    bg: 'bg-teal-400/10',
    text: 'text-teal-400',
    border: 'border-teal-400/30'
  },
  amber: {
    bg: 'bg-amber-400/10',
    text: 'text-amber-400',
    border: 'border-amber-400/30'
  },
  purple: {
    bg: 'bg-purple-400/10',
    text: 'text-purple-400',
    border: 'border-purple-400/30'
  },
  red: {
    bg: 'bg-red-400/10',
    text: 'text-red-400',
    border: 'border-red-400/30'
  }
};

export function MetricCard({ icon, title, value, change, color }: MetricCardProps) {
  const colors = colorMap[color];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      whileHover={{ scale: 1.02, y: -4 }}
      className={`bg-cockpit-panel rounded-2xl p-6 border ${colors.border} backdrop-blur shadow-xl transition-all`}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-gray-400 text-sm font-medium tracking-wide">
          {title}
        </span>
        <div className={`p-3 rounded-xl ${colors.bg}`}>
          {icon}
        </div>
      </div>
      
      <AnimatePresence mode="wait">
        <motion.div 
          key={typeof value === 'string' ? value : value.toString()}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="text-3xl font-bold text-white font-mono"
        >
          {value}
        </motion.div>
      </AnimatePresence>

      {change && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className={`text-sm mt-3 font-semibold ${
            change.toString().startsWith('+') ? 'text-teal-400' : 
            change.toString().startsWith('-') ? 'text-red-400' : 
            'text-gray-400'
          }`}
        >
          {change}
        </motion.div>
      )}
    </motion.div>
  );
}