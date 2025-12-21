// src/app/admin-dashboard/audit-logs/page.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { LogStream } from '@/components/admin/LogStream';
import { SRELiveStream } from '@/components/admin/SRELiveStream';
import { HiClipboard, HiTerminal } from 'react-icons/hi';

export default function AuditLogsPage() {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['admin-audit-logs'],
    queryFn: () => fetch('/api/admin/audit-logs', { credentials: 'include' }).then(r => r.json())
  });

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center gap-3">
          <HiClipboard className="text-cyan-400" /> Global Audit & Monitoring
        </h1>
        <p className="text-sm text-cyan-200/70 mt-1">
          Historical audit logs (left) + Live SRE events (right)
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Persistent Audit Logs */}
        <div className="bg-slate-900/30 border border-cyan-500/20 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-cyan-500/20 bg-slate-900/50">
            <h2 className="text-lg font-semibold text-cyan-300 flex items-center gap-2">
              <HiClipboard className="text-cyan-400" /> Audit Logs
            </h2>
            <p className="text-xs text-slate-400 mt-1">Compliance & security events (last 100)</p>
          </div>
          <LogStream events={logs} className="h-[calc(100vh-300px)]" isLive={false} />
        </div>

        {/* Right: Live SRE Stream */}
        <div className="bg-slate-900/30 border border-cyan-500/20 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-cyan-500/20 bg-slate-900/50">
            <h2 className="text-lg font-semibold text-green-300 flex items-center gap-2">
              <HiTerminal className="text-green-400 animate-pulse" /> Live Events
            </h2>
            <p className="text-xs text-slate-400 mt-1">Real-time SRE metrics & events</p>
          </div>
          <SRELiveStream className="h-[calc(100vh-300px)]" />
        </div>
      </div>
    </div>
  );
}