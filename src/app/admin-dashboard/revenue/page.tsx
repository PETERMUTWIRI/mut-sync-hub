// src/app/admin-dashboard/revenue/page.tsx
'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MetricCard } from '@/components/admin/MetricCard';
import { RevenueChart } from '@/components/admin/RevenueChart';
import { TransactionFeed } from '@/components/admin/TransactionFeed';
import { HiBanknotes, HiArrowTrendingUp, HiArrowTrendingDown, HiCurrencyDollar } from 'react-icons/hi2';

export default function RevenueDashboard() {
  const [period, setPeriod] = useState<'24h' | '7d' | '30d' | '1y'>('30d');

  const { data: revenue } = useQuery({
    queryKey: ['admin-revenue', period],
    queryFn: () => fetch(`/api/admin/revenue?period=${period}`, { credentials: 'include' }).then(r => r.json())
  });

  return (
    <div className="min-h-screen bg-cockpit-bg p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-cyan-400">Revenue Command Center</h1>
        <select 
          value={period} 
          onChange={(e) => setPeriod(e.target.value as any)}
          className="bg-cockpit-panel border border-cyan-500/30 rounded-lg px-4 py-2 text-white"
        >
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="1y">Last Year</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          icon={<HiBanknotes />}
          title="Total Revenue"
          value={`$${(revenue?.total || 0).toLocaleString()}`}
          change="+23.4%"
          color="green"
        />
        <MetricCard
          icon={<HiArrowTrendingUp />}
          title="MRR"
          value={`$${(revenue?.mrr || 0).toLocaleString()}`}
          change="+5.2%"
          color="cyan"
        />
        <MetricCard
          icon={<HiArrowTrendingDown />}
          title="Churn"
          value={`${revenue?.churn || 0}%`}
          change="-0.8%"
          color="purple"
        />
        <MetricCard
          icon={<HiCurrencyDollar />}
          title="ARPU"
          value={`$${revenue?.arpu || 0}`}
          change="+12.1%"
          color="amber"
        />
      </div>

      <RevenueChart data={revenue?.timeline} />
      <TransactionFeed transactions={revenue?.recentTransactions} />
    </div>
  );
}