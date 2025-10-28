import { motion } from 'framer-motion';
import { FaChartLine } from 'react-icons/fa';
import { useOverviewData } from '@/lib/useOverviewData';

export default function ForecastCard() {
  const { data, loading, error } = useOverviewData();

  if (loading) return <div className="bg-[#1E2A44] text-white p-6 rounded-xl shadow-lg">Loading forecast...</div>;
  if (error) return <div className="bg-[#1E2A44] text-white p-6 rounded-xl shadow-lg">Unable to load forecast.</div>;

  return (
    <motion.div
      className="rounded-xl shadow-xl bg-[#1E2A44] border border-[#2E7D7D]/30 p-6 flex flex-col items-start justify-start min-h-[200px] hover:shadow-2xl transition-all duration-300"
      whileHover={{ scale: 1.02, boxShadow: '0 0 15px rgba(46, 125, 125, 0.5)' }}
      transition={{ type: 'spring', stiffness: 400 }}
    >
      <div className="flex items-center gap-3 mb-4">
        <FaChartLine className="text-[#2E7D7D] text-2xl" />
        <span className="text-white font-inter font-semibold text-lg">Forecast</span>
      </div>
      <div className="text-white font-inter font-bold text-xl mb-2">Next Month: {data?.billing?.nextPayment ? '2,800 API calls' : 'N/A'}</div>
      <div className="text-gray-300 font-inter text-base">AI predicts a 10% increase in usage and billing.</div>
    </motion.div>
  );
}