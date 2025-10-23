import React from 'react';
import { HiLockClosed } from 'react-icons/hi';
import { motion } from 'framer-motion';
import { useOverviewData } from '@/lib/useOverviewData';

const SecurityCard: React.FC = () => {
  const { data, loading, error } = useOverviewData();

  if (loading) return <div className="bg-[#1E2A44] text-white p-6 rounded-xl shadow-lg">Loading security...</div>;
  if (error) return <div className="bg-[#1E2A44] text-white p-6 rounded-xl shadow-lg">Unable to load security info.</div>;

  return (
    <motion.div
      className="rounded-xl shadow-xl bg-[#1E2A44] border border-[#2E7D7D]/30 p-6 flex flex-col items-start justify-start min-h-[200px] hover:shadow-2xl transition-all duration-300"
      whileHover={{ scale: 1.02, boxShadow: '0 0 15px rgba(46, 125, 125, 0.5)' }}
      transition={{ type: 'spring', stiffness: 400 }}
    >
      <div className="flex items-center gap-3 mb-4">
        <HiLockClosed className="text-[#2E7D7D] text-2xl" />
        <span className="text-white font-inter font-semibold text-lg">Security</span>
      </div>
      <div className="text-white font-inter font-bold text-xl mb-2">2FA: {data?.anomaly?.detected ? 'Enabled' : 'Disabled'}</div> {/* Placeholder */}
      <div className="text-gray-300 font-inter text-base mb-2">Active Sessions: {data?.billing?.lastInvoice ? 2 : 0}</div> {/* Placeholder */}
      <div className="text-gray-300 font-inter text-base">API Keys: {data?.billing?.nextPayment ? 3 : 0}</div> {/* Placeholder */}
    </motion.div>
  );
};
export default SecurityCard;