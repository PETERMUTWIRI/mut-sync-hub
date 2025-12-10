// src/app/admin-dashboard/audit-logs/page.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { LogStream } from '@/components/admin/LogStream';
import { HiClipboard } from 'react-icons/hi2';

export default function AuditLogsPage() {
  const { data: logs, isLoading } = useQuery({
    queryKey: ['admin-audit-logs'],
    queryFn: () => fetch('/api/admin/audit-logs', { credentials: 'include' }).then(r => r.json())
  });

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center gap-3">
          <HiClipboard className="text-cyan-400" /> Global Audit Logs
        </h1>
        <p className="text-sm text-cyan-200/70 mt-1">Real-time security and activity monitoring across all organizations</p>
      </div>
      
      <LogStream events={logs || []} className="h-[calc(100vh-200px)]" />
    </div>
  );
}