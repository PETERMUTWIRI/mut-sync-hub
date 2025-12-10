// src/app/admin-dashboard/system-status/page.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { ServiceStatus } from '@/components/admin/SystemStatus'; // ← CHANGED from SystemStatus
import { HiServer, HiWifi, HiShieldCheck } from 'react-icons/hi2';
import { HiDatabase } from 'react-icons/hi';

export default function SystemStatusPage() {
  const { data: services, isLoading } = useQuery({
    queryKey: ['system-status'],
    queryFn: () => fetch('/api/admin/system-status', { credentials: 'include' }).then(r => r.json())
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 space-y-6">
      <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center gap-3">
        <HiShieldCheck className="text-cyan-400" /> System Health
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <ServiceStatus 
          service="API Gateway" 
          status={services?.api?.status || 'OPERATIONAL'} 
          latency={services?.api?.latency || '--'}
          icon={<HiWifi className="text-xl" />}
        />
        <ServiceStatus 
          service="Database" 
          status={services?.database?.status || 'OPERATIONAL'} 
          latency={services?.database?.latency || '--'}
          icon={<HiDatabase className="text-xl" />}
        />
        <ServiceStatus 
          service="Redis" 
          status={services?.redis?.status || 'OPERATIONAL'} 
          latency={services?.redis?.latency || '--'}
          icon={<HiServer className="text-xl" />}
        />
        <ServiceStatus 
          service="QStash" 
          status={services?.qstash?.status || 'OPERATIONAL'} 
          latency={services?.qstash?.latency || '--'}
          icon={<HiWifi className="text-xl" />}
        />
      </div>

      <div className="mt-8 bg-slate-900/50 rounded-2xl p-6 border border-cyan-500/20">
        <h2 className="text-xl font-bold text-cyan-400 mb-4">Incident History</h2>
        <p className="text-slate-500 text-sm">No incidents in the last 24 hours</p>
      </div>
    </div>
  );
}