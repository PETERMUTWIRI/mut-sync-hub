'use client';

import React from 'react';
import { useBilling } from '@/hooks/useBilling';

const BillingSummary: React.FC = () => {
  const { data, isLoading, error } = useBilling();

  if (isLoading) return <div className="h-4 w-24 bg-gray-700 rounded animate-pulse" />;
  if (error) return <div className="text-red-400 text-sm">{error.message}</div>;

  const lastAmount = data?.payments?.[0]?.amount ? (data.payments[0].amount / 100).toFixed(2) : '0.00';
  const nextDate = data?.nextBillingDate ? new Date(data.nextBillingDate).toLocaleDateString() : '—';

  return (
    <div className="text-center bg-[#1E2A44] p-4 rounded-xl shadow-xl border border-[#2E7D7D]/30">
      <div className="text-base font-inter font-bold text-[#2E7D7D] mb-1">Billing Summary</div>
      <div className="text-2xl font-inter font-extrabold text-white mb-1">KES {lastAmount}</div>
      <div className="text-xs font-inter text-gray-300">Next bill on {nextDate}</div>
    </div>
  );
};

export default BillingSummary;