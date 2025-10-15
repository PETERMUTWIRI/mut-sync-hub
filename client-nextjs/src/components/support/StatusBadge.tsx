// src/components/support/StatusBadge.tsx
import React from 'react';
import { CheckCircle2, Clock, AlertCircle, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: 'operational' | 'degraded' | 'maintenance' | 'outage';
}

const statusConfig: Record<StatusBadgeProps['status'], { 
  label: string; 
  icon: React.ReactNode; 
  bg: string; 
  text: string; 
  pulse?: boolean; 
}> = {
  operational:  { label: 'Operational',  icon: <CheckCircle2 size={14} />, bg: 'bg-green-500/10', text: 'text-green-300' },
  degraded:     { label: 'Degraded',     icon: <AlertCircle size={14} />,  bg: 'bg-yellow-500/10', text: 'text-yellow-300' },
  maintenance:  { label: 'Maintenance',  icon: <Clock size={14} />,        bg: 'bg-blue-500/10', text: 'text-blue-300' },
  outage:       { label: 'Outage',       icon: <XCircle size={14} />,      bg: 'bg-red-500/10', text: 'text-red-300', pulse: true },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const cfg = statusConfig[status];

  return (
    <span 
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${cfg.bg} ${cfg.text} border-current/20`}
    >
      {cfg.pulse && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-current" />
        </span>
      )}
      {!cfg.pulse && cfg.icon}
      {cfg.label}
    </span>
  );
}