import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const RecentActivity: React.FC = () => {
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivity = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/activity/recent');
        if (!res.ok) throw new Error('Failed to fetch recent activity');
        const data = await res.json();
        setCount(data.count);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchActivity();
  }, []);

  return (
    <motion.div
      className="bg-[#1E2A44] rounded-xl shadow-xl p-6 min-h-[200px] flex flex-col justify-center items-center"
      whileHover={{ scale: 1.02, boxShadow: '0 0 15px rgba(46, 125, 125, 0.5)' }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      {loading ? (
        <div className="text-center text-gray-300 font-inter text-base">Loading...</div>
      ) : error ? (
        <div className="text-center text-red-400 font-inter text-base">{error}</div>
      ) : (
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-200 font-inter mb-2">Recent Activity</h2>
          <div className="text-lg font-extrabold text-white font-inter mb-1">{count}</div>
          <div className="text-base text-gray-300 font-inter">New Activities</div>
        </div>
      )}
    </motion.div>
  );
};

export default RecentActivity;