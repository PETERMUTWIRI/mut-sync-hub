// src/app/admin-dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MetricCard } from '@/components/admin/MetricCard';
import { SystemStatus } from '@/components/admin/SystemStatus';
import { TopOrganizationsTable } from '@/components/admin/TopOrganizationsTable';
import { ActivityFeed } from '@/components/admin/ActivityFeed';
import { 
  HiUserGroup, HiCurrencyDollar, HiShieldCheck, 
  HiServer, HiSignal, HiExclamationTriangle, HiCog
} from 'react-icons/hi2';

export default function OwnerDashboard() {
  const [events, setEvents] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);

  // Global metrics query (fallback polling)
  const { data: initialMetrics } = useQuery({
    queryKey: ['owner-metrics'],
    queryFn: () => fetch('/api/admin/metrics', { credentials: 'include' }).then(r => r.json()),
    refetchInterval: 30000 // 30s fallback
  });

  // SSE connection for real-time events
  useEffect(() => {
    const eventSource = new EventSource('/api/admin/stream', { 
      withCredentials: true 
    });

    eventSource.onopen = () => {
      console.log('[OwnerDashboard] SSE connected');
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'history') {
          setEvents(data.events || []);
        } else if (data.type === 'event') {
          setEvents(prev => [data, ...prev.slice(0, 99)]);
          
          // Update metrics if it's a metrics update
          if (data.event === 'metrics:update') {
            setMetrics(data.data);
          }
        }
      } catch (error) {
        console.error('[OwnerDashboard] SSE parse error:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('[OwnerDashboard] SSE error:', error);
      eventSource.close();
      // Reconnect after 3s
      setTimeout(() => {
        if (document.visibilityState === 'visible') {
          window.location.reload();
        }
      }, 3000);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  // Use SSE data if available, else fallback to polling
  const data = metrics || initialMetrics;

  if (!data) {
    return (
      <div className="flex items-center justify-center h-screen bg-cockpit-bg">
        <div className="text-cyan-400">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          Initializing Mission Control...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cockpit-bg p-6 space-y-8">
      {/* Hero Bar */}
      <div className="bg-gradient-to-r from-blue-900/30 to-indigo-900/30 backdrop-blur rounded-3xl p-8 border border-cyan-500/20">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-cockpit-cyan mb-2 flex items-center gap-3">
              <HiCog className="animate-spin-slow text-3xl" />
              Platform Mission Control
            </h1>
            <p className="text-gray-400 text-lg">Global overview - All organizations</p>
            <span className="text-xs text-green-400 mt-2 block">
              Live updates via EventStream
            </span>
          </div>
          <SystemStatus status={data.system.status} />
        </div>
      </div>

      {/* Global Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          icon={<HiUserGroup className="text-3xl" />}
          title="Platform Users"
          value={data.users.total.toLocaleString()}
          change={data.users.growth}
          color="cyan"
        />
        <MetricCard
          icon={<HiCurrencyDollar className="text-3xl" />}
          title="24h Revenue"
          value={`$${Number(data.revenue.day).toFixed(2)}`}
          change={data.revenue.growth}
          color="green"
        />
        <MetricCard
          icon={<HiSignal className="text-3xl" />}
          title="API Requests"
          value={data.api.requests.toLocaleString()}
          change={`${data.api.errorRate}% errors`}
          color="amber"
        />
        <MetricCard
          icon={<HiServer className="text-3xl" />}
          title="Organizations"
          value={data.topOrganizations?.length || 0}
          change="Active"
          color="purple"
        />
      </div>

      {/* Platform Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopOrganizationsTable organizations={data.topOrganizations} />
        <SystemStatus.Details services={data.system.services} />
      </div>

      {/* Global Activity Feed */}
      <div className="bg-cockpit-panel/50 rounded-2xl p-6 border border-cyan-500/10">
        <h2 className="text-xl font-bold text-cyan-400 mb-4">Global Activity Feed</h2>
        <ActivityFeed events={events} global={true} />
      </div>
    </div>
  );
}