import { motion } from 'framer-motion';
import { FaUserFriends } from 'react-icons/fa';
import { useOverviewData } from '@/lib/useOverviewData';

export default function UserInsightsCard() {
  const { data, loading, error } = useOverviewData();

  if (loading) return <div className="bg-[#1E2A44] text-white p-6 rounded-xl shadow-lg">Loading insights...</div>;
  if (error) return <div className="bg-[#1E2A44] text-white p-6 rounded-xl shadow-lg">Unable to load insights.</div>;

  return (
    <motion.div
      className="rounded-xl shadow-xl bg-[#1E2A44] border border-[#2E7D7D]/30 p-6 flex flex-col items-start justify-start min-h-[200px] hover:shadow-2xl transition-all duration-300"
      whileHover={{ scale: 1.02, boxShadow: '0 0 15px rgba(46, 125, 125, 0.5)' }}
      transition={{ type: 'spring', stiffness: 400 }}
    >
      <div className="flex items-center gap-3 mb-4">
        <FaUserFriends className="text-[#2E7D7D] text-2xl" />
        <span className="text-white font-inter font-semibold text-lg">User Insights</span>
      </div>
      <div className="text-white font-inter font-bold text-xl mb-2">Top User: {data?.team?.members?.[0] || 'N/A'}</div> {/* Placeholder */}
      <div className="text-gray-300 font-inter text-base">Churn Risk: <span className="text-[#2E7D7D] font-bold">Low</span> | Segment: <span className="text-[#2E7D7D] font-bold">Enterprise</span></div>
    </motion.div>
  );
}