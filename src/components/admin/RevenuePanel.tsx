"use client";
import React, { useEffect, useState } from 'react';
// Removed useNeonUser import

interface RevenuePanelProps {
  user?: any;
  isAuthenticated?: boolean;
  loading?: boolean;
}

const RevenuePanel: React.FC<RevenuePanelProps> = ({ user, isAuthenticated, loading }) => {
  const [revenue, setRevenue] = useState<any>({ total: 0, byOrg: [] });

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    const fetchRevenue = async () => {
      try {
        // Replace with your Next.js API route for revenue
        const res = await fetch('/api/admin/revenue');
        const data = await res.json();
        setRevenue(data);
      } catch (error) {
        console.error('Error fetching revenue:', error);
      }
    };
    fetchRevenue();
  }, [isAuthenticated, user]);

  if (loading)
    return <div className="text-center text-gray-400">Loading...</div>;

  return (
    <div
      className="rounded-2xl shadow-xl"
      style={{ background: '#1A1A2E', padding: 32 }}
    >
      <div className="text-lg font-bold text-gray-200 mb-2">
        Revenue This Month
      </div>
      <div className="text-4xl font-extrabold text-white mb-1">
        ${revenue.total.toLocaleString()}
      </div>
      <div className="text-sm text-gray-400">Enterprise & SaaS Plans</div>
      <div className="text-xs text-green-400 mt-2">
        +8% since last month
      </div>
    </div>
  );
};

export default RevenuePanel;
