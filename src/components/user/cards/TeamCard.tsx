import React from 'react';
import { HiUserGroup } from 'react-icons/hi';
import { motion } from 'framer-motion';
import { useOverviewData } from '@/lib/useOverviewData';

const TeamCard: React.FC = () => {
  const { data, loading, error } = useOverviewData();

  if (loading) return <div className="bg-[#1E2A44] text-white p-6 rounded-xl shadow-lg">Loading team...</div>;
  if (error) return <div className="bg-[#1E2A44] text-white p-6 rounded-xl shadow-lg">Unable to load team info.</div>;

  return (
    <motion.div
      className="rounded-xl shadow-xl bg-[#1E2A44] border border-[#2E7D7D]/30 p-6 flex flex-col items-start justify-start min-h-[200px] hover:shadow-2xl transition-all duration-300"
      whileHover={{ scale: 1.02, boxShadow: '0 0 15px rgba(46, 125, 125, 0.5)' }}
      transition={{ type: 'spring', stiffness: 400 }}
    >
      <div className="flex items-center gap-3 mb-4">
        <HiUserGroup className="text-[#2E7D7D] text-2xl" />
        <span className="text-white font-inter font-semibold text-lg">Team</span>
      </div>
      <div className="text-white font-inter font-bold text-xl mb-2">Members: {data?.activity?.recent?.length || 0}</div> {/* Placeholder */}
      <ul className="text-gray-300 list-disc pl-5 space-y-2">
        {(!data?.activity?.recent || data.activity.recent.length === 0) ? (
          <li className="text-base">No team members</li>
        ) : (
          data.activity.recent.map((m, i) => <li key={i} className="text-base">{m}</li>)
        )}
      </ul>
      <button
        className="px-4 py-2 rounded-xl bg-[#2E7D7D] text-white font-inter font-semibold mt-4 hover:bg-[#1E2A44] hover:text-[#2E7D7D] transition-all duration-200"
        onClick={() => console.log('Invite Member clicked')}
        aria-label="Invite Member"
      >
        Invite Member
      </button>
    </motion.div>
  );
};
export default TeamCard;