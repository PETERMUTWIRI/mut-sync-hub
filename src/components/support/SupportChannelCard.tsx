// client-nextjs/src/components/support/SupportChannelCard.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

interface SupportChannelCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionText: string;
  onClick: () => void;
  color: string;
}

export default function SupportChannelCard({ icon, title, description, actionText, onClick, color }: SupportChannelCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="group relative bg-[#1E2A44] border border-[#2E7D7D]/30 rounded-xl shadow-lg overflow-hidden cursor-pointer"
      onClick={onClick}
    >
      {/* subtle glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#2E7D7D]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative p-6">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${color}`}>{icon}</div>
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <p className="text-gray-300 text-sm mb-4">{description}</p>
        <div className="flex items-center gap-1 text-[#2E7D7D] group-hover:text-teal-300 font-medium text-sm transition-colors">
          {actionText}
          <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </motion.div>
  );
}