import { motion } from 'framer-motion';
import { FaExclamationTriangle } from 'react-icons/fa';

export default function AnomalyDetectionCard() {
  return (
    <motion.div
      className="rounded-xl shadow-xl bg-[#1E2A44] border border-[#2E7D7D]/30 p-6 flex flex-col items-start justify-start min-h-[200px] hover:shadow-2xl transition-all duration-300"
      whileHover={{ scale: 1.02, boxShadow: '0 0 15px rgba(46, 125, 125, 0.5)' }}
      transition={{ type: 'spring', stiffness: 400 }}
    >
      <div className="flex items-center gap-3 mb-4">
        <FaExclamationTriangle className="text-[#2E7D7D] text-2xl" />
        <span className="text-white font-inter font-semibold text-lg">Anomaly Detection</span>
      </div>
      <div className="text-white font-inter font-bold text-xl mb-2">Usage Spike Detected</div>
      <div className="text-gray-300 font-inter text-base">
        AI flagged a 35% increase in API calls at 2:14 PM.{' '}
        <span className="text-[#2E7D7D] font-bold cursor-pointer hover:underline">Investigate Now</span>
      </div>
    </motion.div>
  );
}