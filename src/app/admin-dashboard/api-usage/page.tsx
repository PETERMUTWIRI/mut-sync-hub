// src/app/admin-dashboard/api-usage/page.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { ApiUsageChart } from '@/components/admin/ApiUsageChart';
import { MetricCard } from '@/components/admin/MetricCard';
import { HiSignal, HiExclamationTriangle, HiClock } from 'react-icons/hi2';

export default function ApiUsagePage() {
  const { data: usage, isLoading } = useQuery({
    queryKey: ['admin-api-usage'],
    queryFn: () => fetch('/api/admin/api-usage', { credentials: 'include' }).then(r => r.json())
  });

  return (
    <div className="min-h-screen bg-slate-950 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
          API Usage Command Center
        </h1>
        <div className="text-xs text-cyan-200/60">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          icon={<HiSignal className="text-2xl" />}
          title="Total Requests"
          value={usage?.totalRequests?.toLocaleString() || <span className="animate-pulse">...</span>}
          change="+15%"
          color="cyan"
        />
        <MetricCard
          icon={<HiExclamationTriangle className="text-2xl" />}
          title="Global Error Rate"
          value={usage?.errorRate !== undefined ? `${usage.errorRate}%` : "..."}
          change="-0.2%"
          color="amber"
        />
        <MetricCard
          icon={<HiClock className="text-2xl" />}
          title="Avg Latency"
          value={usage?.avgLatency || <span className="animate-pulse">...</span>}
          change="-5ms"
          color="green"
        />
      </div>

      <ApiUsageChart endpoints={usage?.byEndpoint} isLoading={isLoading} />
    </div>
  );
}