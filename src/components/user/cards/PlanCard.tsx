'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { HiExclamationCircle } from 'react-icons/hi';

/*  real shape from /api/subscription  */
interface SubscriptionData {
  title: string;
  features: string[];
  expiresAt: string | null;
  subscriptionId: string | null;
  status: string;
}

/*  –––––––––––––––  REAL FETCH  –––––––––––––––  */
const fetchSubscription = async (): Promise<SubscriptionData> => {
  const res = await fetch('/api/subscription', { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch subscription');
  return res.json();
};

/*  –––––––––––––––  COMPONENT  –––––––––––––––  */
export default function PlanStatus() {
  const router = useRouter();
  const { data, isLoading, error } = useQuery({
    queryKey: ['subscription'],
    queryFn: fetchSubscription,
    staleTime: 60_000,
  });

  if (isLoading) return <div className="h-4 w-24 bg-gray-700 rounded animate-pulse" />;
  if (error) return <div className="text-red-400 text-sm">{error.message}</div>;

  const planName = data?.title || 'Free';
  const expires = data?.expiresAt ? new Date(data.expiresAt).toLocaleDateString() : '—';
  const showAlert = data && data.features.length > 0;

  return (
    <motion.div
      className="glass-card relative cursor-pointer"
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300 }}
      onClick={() => router.push('/payment')}
    >
      <div className="text-center">
        <h3 className="text-base font-bold text-gray-200 font-inter mb-1">Plan Status</h3>
        <div className="text-lg font-extrabold text-white font-inter mb-1">{planName}</div>
        <div className="text-sm text-gray-300 font-inter mb-2">Expires {expires}</div>

        {showAlert && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-2">
            <Alert className="bg-[#2E7D7D]/20 border-[#2E7D7D] text-gray-100">
              <HiExclamationCircle className="h-4 w-4 text-[#2E7D7D]" />
              <AlertTitle className="font-inter text-sm">Included Features</AlertTitle>
              <AlertDescription className="font-inter text-xs">
                <ul className="list-disc pl-3">
                  {data.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                <Button variant="link" className="text-[#2E7D7D] pl-1 text-xs" onClick={(e) => { e.stopPropagation(); router.push('/payment'); }}>
                  Upgrade →
                </Button>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}