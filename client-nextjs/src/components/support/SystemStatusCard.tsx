// client-nextjs/src/components/support/SystemStatusCard.tsx
import React from 'react';
import { CheckCircle2, AlertCircle, Wrench, XCircle } from 'lucide-react';

interface SystemStatusCardProps {
  service: string;
  status: 'operational' | 'degraded' | 'maintenance' | 'outage';
  lastUpdated: string;
}

const statusMeta: Record<SystemStatusCardProps['status'], {
  label: string;
  icon: React.ReactNode;
  bg: string;
  text: string;
  pulse?: boolean;
}> = {
  operational:  { label: 'Operational',  icon: <CheckCircle2 size={16} />, bg: 'bg-green-500/10',  text: 'text-green-300' },
  degraded:     { label: 'Degraded',     icon: <AlertCircle size={16} />,  bg: 'bg-yellow-500/10', text: 'text-yellow-300' },
  maintenance:  { label: 'Maintenance',  icon: <Wrench size={16} />,        bg: 'bg-blue-500/10',  text: 'text-blue-300' },
  outage:       { label: 'Outage',       icon: <XCircle size={16} />,       bg: 'bg-red-500/10',   text: 'text-red-300', pulse: true },
};

export default function SystemStatusCard({ service, status, lastUpdated }: SystemStatusCardProps) {
  const meta = statusMeta[status];

  return (
    <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-[#2E7D7D]/20 hover:border-[#2E7D7D]/50 transition-colors">
      <div className="flex items-center gap-3">
        {meta.pulse ? (
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-current" />
          </span>
        ) : (
          <span className={meta.text}>{meta.icon}</span>
        )}
        <div>
          <p className="text-white font-medium">{service}</p>
          <p className="text-xs text-gray-400">Updated {new Date(lastUpdated).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
        </div>
      </div>
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${meta.bg} ${meta.text} border-current/20`}>
        {meta.label}
      </span>
    </div>
  );
}