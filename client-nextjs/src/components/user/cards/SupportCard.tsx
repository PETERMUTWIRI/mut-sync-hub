import React from 'react';
import { HiQuestionMarkCircle } from 'react-icons/hi';
import { motion } from 'framer-motion';
import { useOverviewData } from '@/lib/useOverviewData';

const SupportCard: React.FC = () => {
  const { data, loading, error } = useOverviewData();

  if (loading) return <div className="bg-[#1E2A44] text-white p-6 rounded-xl shadow-lg">Loading support...</div>;
  if (error) return <div className="bg-[#1E2A44] text-white p-6 rounded-xl shadow-lg">Unable to load support info.</div>;

  return (
    <motion.div
      className="rounded-xl shadow-xl bg-[#1E2A44] border border-[#2E7D7D]/30 p-6 flex flex-col items-start justify-start min-h-[200px] hover:shadow-2xl transition-all duration-300"
      whileHover={{ scale: 1.02, boxShadow: '0 0 15px rgba(46, 125, 125, 0.5)' }}
      transition={{ type: 'spring', stiffness: 400 }}
    >
      <div className="flex items-center gap-3 mb-4">
        <HiQuestionMarkCircle className="text-[#2E7D7D] text-2xl" />
        <span className="text-white font-inter font-semibold text-lg">Support</span>
      </div>
      <div className="text-white font-inter font-bold text-xl mb-2">Open Tickets: {data?.anomaly?.detected ? 1 : 0}</div> {/* Placeholder */}
      <button
        className="px-4 py-2 rounded-xl bg-[#2E7D7D] text-white font-inter font-semibold mt-4 hover:bg-[#1E2A44] hover:text-[#2E7D7D] transition-all duration-200"
        onClick={() => console.log('Contact Support clicked')}
        aria-label="Contact Support"
      >
        Contact Support
      </button>
    </motion.div>
  );
};
export default SupportCard;