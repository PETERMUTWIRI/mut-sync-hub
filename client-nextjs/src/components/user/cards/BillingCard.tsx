'use client';

import React from 'react';
import { HiCreditCard } from 'react-icons/hi';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useBilling } from '@/hooks/useBilling'; // ← new hook

const BillingCard: React.FC = () => {
  const router = useRouter();
  const { data, isLoading, error } = useBilling();

  if (isLoading) return <div className="h-5 w-32 bg-gray-700 rounded animate-pulse" />;
  if (error) return <div className="text-red-400 text-base">Failed to load billing.</div>;

  const lastPayment = data?.payments?.[0];
  const nextDate = data?.nextBillingDate ? new Date(data.nextBillingDate).toLocaleDateString() : '—';
  const method = data?.cardLast4 ? `•••• ${data.cardLast4}` : 'No card on file';

  return (
    <motion.div
      className="glass-card relative cursor-pointer"
      whileHover={{ scale: 1.02 }}
      onClick={() => router.push('/billing')}
    >
      <HiCreditCard className="text-[#2E7D7D] text-3xl mb-4" />
      <h3 className="text-white font-bold text-xl mb-3">Billing Summary</h3>

      <div className="text-gray-300 text-base mb-1">Last Payment: <span className="text-white font-medium">{lastPayment ? `$${(lastPayment.amount / 100).toFixed(2)}` : '—'}</span></div>
      <div className="text-gray-300 text-base mb-1">Next Date: <span className="text-white font-medium">{nextDate}</span></div>
      <div className="text-gray-300 text-base">Method: <span className="text-white font-medium">{method}</span></div>

      <div className="w-full bg-gray-700 h-2 rounded mt-4">
        <div className="bg-[#2E7D7D] h-2 rounded" style={{ width: '60%' }} />
      </div>
    </motion.div>
  );
};

export default BillingCard;