import React from 'react';
import { HiClipboardList } from 'react-icons/hi';
import { motion } from 'framer-motion';
import { useOverviewData } from '@/lib/useOverviewData';

const RecentActivityCard: React.FC = () => {
  const { data, loading, error } = useOverviewData();

  if (loading) return <div className="bg-[#1E2A44] text-white p-6 rounded-xl shadow-lg">Loading activity...</div>;
  if (error) return <div className="bg-[#1E2A44] text-white p-6 rounded-xl shadow-lg">Unable to load activity.</div>;

  return (
    <motion.div
      className="rounded-xl shadow-xl bg-[#1E2A44] border border-[#2E7D7D]/30 p-6 flex flex-col items-start justify-start min-h-[200px] hover:shadow-2xl transition-all duration-300"
      whileHover={{ scale: 1.02, boxShadow: '0 0 15px rgba(46, 125, 125, 0.5)' }}
      transition={{ type: 'spring', stiffness: 400 }}
    >
      <div className="flex items-center gap-3 mb-4">
        <HiClipboardList className="text-[#2E7D7D] text-2xl" />
        <span className="text-white font-inter font-semibold text-lg">Recent Activity</span>
      </div>
      <div className="text-white font-inter font-bold text-xl mb-2">Last Login: {data?.billing?.lastInvoice || 'N/A'}</div> {/* Placeholder */}
      <ul className="text-gray-300 list-disc pl-5 space-y-2">
        {data?.anomaly?.detected ? <li className="text-base">Anomaly detected at 2:14 PM</li> : <li className="text-base">No recent actions</li>}
      </ul>
    </motion.div>
  );
};
export default RecentActivityCard;