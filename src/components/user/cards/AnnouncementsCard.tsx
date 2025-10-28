import React from 'react';
import { HiSpeakerphone } from 'react-icons/hi';
import { motion } from 'framer-motion';

const AnnouncementsCard: React.FC<{ updates?: string[]; loading?: boolean; error?: boolean }> = ({ updates = [], loading, error }) => {
  if (loading) return <div className="card skeleton bg-[#1E2A44] text-white p-6 rounded-xl shadow-lg">Loading announcements...</div>;
  if (error) return <div className="card error bg-[#1E2A44] text-white p-6 rounded-xl shadow-lg">Unable to load announcements.</div>;
  return (
    <motion.div
      className="rounded-xl shadow-xl bg-[#1E2A44] border border-[#2E7D7D]/30 p-6 flex flex-col items-start justify-start min-h-[200px] hover:shadow-2xl transition-all duration-300"
      whileHover={{ scale: 1.02, boxShadow: '0 0 15px rgba(46, 125, 125, 0.5)' }}
      transition={{ type: 'spring', stiffness: 400 }}
    >
      <HiSpeakerphone className="text-[#2E7D7D] text-3xl mb-4" />
      <h3 className="text-white font-inter font-bold text-xl mb-3">Announcements</h3>
      <ul className="text-gray-200 list-disc pl-5 space-y-2">
        {updates.length === 0 ? <li className="text-sm">No announcements</li> : updates.map((u, i) => <li key={i} className="text-sm">{u}</li>)}
      </ul>
    </motion.div>
  );
};
export default AnnouncementsCard;