'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { HiExclamationCircle } from 'react-icons/hi';

/*  real shape from /api/usage  */
interface UsageData {
  usage: number;
  limit: number;
  trend: number; // 0-1
  predictedDaysLeft: number;
}

/*  –––––––––––––––  REAL FETCH  –––––––––––––––  */
const fetchUsage = async (): Promise<UsageData> => {
  const res = await fetch('/api/usage', { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch usage');
  const { used, limit, remaining, locked } = await res.json();

  // TODO – compute trend from last-7-days once you have the endpoint
  const trend = 0.08; // placeholder
  const predictedDaysLeft = limit ? Math.max(0, remaining / (used / 30)) : 999;

  return { usage: used, limit: limit, trend, predictedDaysLeft };
};

/*  –––––––––––––––  COMPONENT  –––––––––––––––  */
export default function UsageProgressBar() {
  const router = useRouter();
  const { data, isLoading, error } = useQuery({
    queryKey: ['usage'],
    queryFn: fetchUsage,
    staleTime: 60_000,
  });

  if (isLoading) return <div className="h-5 w-32 bg-gray-700 rounded animate-pulse" />;
  if (error) return <div className="text-red-400 text-base">{error.message}</div>;

  const percentage = data && data.limit > 0 ? (data.usage / data.limit) * 100 : 0;
  const showAlert = data && (percentage > 80 || data.predictedDaysLeft < 7);

  const getAlertMessage = () => {
    if (!data) return '';
    if (percentage > 80) {
      return `You're at ${Math.round(percentage)}% of your usage limit! Upgrade to avoid disruptions.`;
    }
    if (data.predictedDaysLeft < 7) {
      return `Based on your ${Math.round(data.trend * 100)}% daily usage growth, you'll hit your limit in ~${Math.round(data.predictedDaysLeft)} days. Upgrade now!`;
    }
    return '';
  };

  return (
    <motion.div
      className="glass-card relative cursor-pointer"
      whileHover={{ scale: 1.02, boxShadow: '0 0 15px rgba(46, 125, 125, 0.5)' }}
      transition={{ type: 'spring', stiffness: 300 }}
      onClick={() => router.push('/payment')}
    >
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold text-gray-200 font-inter">Usage</h2>
        <Button size="sm" variant="outline" className="border-[#2E7D7D] text-[#2E7D7D] hover:bg-[#2E7D7D]/20 font-inter text-base">
          Upgrade Plan
        </Button>
      </div>

      {showAlert && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
          <Alert className="bg-[#2E7D7D]/20 border-[#2E7D7D] text-gray-100">
            <HiExclamationCircle className="h-5 w-5 text-[#2E7D7D]" />
            <AlertTitle className="font-inter text-base">Usage Alert</AlertTitle>
            <AlertDescription className="font-inter text-sm">
              {getAlertMessage()}
              <Button variant="link" className="text-[#2E7D7D] pl-2" onClick={(e) => { e.stopPropagation(); router.push('/payment'); }}>
                Upgrade Now →
              </Button>
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      <div className="w-full bg-gray-700 rounded-full h-4">
        <motion.div
          className="bg-[#2E7D7D] h-4 rounded-full"
          style={{ width: `${percentage}%` }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <div className="flex justify-between text-base text-gray-300 font-inter mt-2">
        <span>{data?.usage} / {data?.limit}</span>
        <span>{Math.round(100 - percentage)}% remaining</span>
      </div>
    </motion.div>
  );
};