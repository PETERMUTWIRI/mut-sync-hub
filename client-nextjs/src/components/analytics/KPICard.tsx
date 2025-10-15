import React from 'react';

interface KPICardProps {
  id?: string;
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  description?: string;
}

const TrendIcon: React.FC<{ trend?: 'up' | 'down' | 'neutral' }> = ({ trend }) => {
  if (trend === 'up') return <span className="text-green-400">▲</span>;
  if (trend === 'down') return <span className="text-red-400">▼</span>;
  return null;
};

export default function KPICard({ id, label, value, trend, description }: KPICardProps) {
  const formattedValue = typeof value === 'number' ? value.toLocaleString() : value;
  
  return (
    <div 
      id={id}
      className="rounded-xl bg-gradient-to-br from-indigo-800/70 to-slate-900/80 p-4 shadow flex flex-col items-start min-w-[120px]"
      aria-label={`${label}: ${formattedValue}${trend ? `, trend ${trend}` : ''}`}
    >
      <div className="text-xs text-slate-400 mb-1">{label}</div>
      <div className="text-2xl font-bold text-white flex items-center gap-2">
        {formattedValue}
        <TrendIcon trend={trend} />
      </div>
      {description && <div className="text-xs text-slate-500 mt-1">{description}</div>}
    </div>
  );
}