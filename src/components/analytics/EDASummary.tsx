import React from 'react';

interface EDASummaryProps {
  id?: string;
  stats: { 
    count: number; 
    mean: number; 
    std: number; 
    nulls: number;
  };
}

export default function EDASummary({ id, stats }: EDASummaryProps) {
  const summaryItems = [
    { label: 'Count', value: stats.count.toLocaleString(), color: 'text-white' },
    { label: 'Mean', value: stats.mean.toFixed(2), color: 'text-white' },
    { label: 'Std Dev', value: stats.std.toFixed(2), color: 'text-white' },
    { label: 'Nulls', value: stats.nulls.toLocaleString(), color: 'text-orange-400' },
  ];
  
  return (
    <div 
      id={id}
      className="rounded-2xl bg-gradient-to-br from-slate-800/70 to-indigo-900/80 p-6 shadow flex flex-col gap-2"
    >
      <div className="text-white font-bold mb-2">EDA Summary</div>
      {summaryItems.map(item => (
        <div key={item.label} className="text-slate-300 text-sm">
          {item.label}: <span className={`font-bold ${item.color}`}>{item.value}</span>
        </div>
      ))}
    </div>
  );
}