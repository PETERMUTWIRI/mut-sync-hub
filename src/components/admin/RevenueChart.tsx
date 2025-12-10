// src/components/admin/RevenueChart.tsx
'use client';

import { useMemo } from 'react';
import { ResponsiveContainer, ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { HiTrendingUp, HiCalendar } from 'react-icons/hi';

interface TimelinePoint {
  date: string;
  revenue: number;
  transactions: number;
}

interface RevenueChartProps {
  data?: TimelinePoint[];
  isLoading?: boolean;
}

export function RevenueChart({ data = [], isLoading = false }: RevenueChartProps) {
  const chartData = useMemo(() => {
    return data.map(point => ({
      ...point,
      date: new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }));
  }, [data]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 border border-cyan-500/30 rounded-lg p-3 shadow-2xl">
          <p className="text-cyan-400 font-semibold mb-2 flex items-center gap-2">
            <HiCalendar className="w-4 h-4" />
            {label}
          </p>
          {payload.map((entry: any) => (
            <p key={entry.dataKey} className="text-sm text-cyan-200">
              <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }} />
              {entry.name}: {entry.dataKey === 'revenue' 
                ? `$${entry.value.toLocaleString()}` 
                : entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="bg-slate-900/50 border border-cyan-500/20 rounded-xl p-6 shadow-xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-cyan-500/20 rounded w-1/3"></div>
          <div className="h-64 bg-slate-800/50 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!chartData.length) {
    return (
      <div className="bg-slate-900/50 border border-cyan-500/20 rounded-xl p-12 shadow-xl">
        <div className="text-center text-cyan-200/60">
          <HiTrendingUp className="w-12 h-12 mx-auto mb-3 text-cyan-400/30" />
          <p className="text-lg font-medium mb-1">No revenue data yet</p>
          <p className="text-sm">Start processing payments to see insights</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/50 border border-cyan-500/20 rounded-xl p-6 shadow-xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-cyan-400 flex items-center gap-2">
          <HiTrendingUp className="w-5 h-5" /> Revenue Timeline
        </h2>
        <div className="text-xs text-cyan-200/70">
          Last {chartData.length} days
        </div>
      </div>

      <div className="relative">
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart data={chartData}>
            <CartesianGrid stroke="rgba(0, 255, 255, 0.05)" vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="#00ffff"
              tick={{ fill: '#00ffff', fontSize: 11 }}
              angle={-45}
              textAnchor="end"
              height={60}
              interval={0}
            />
            <YAxis 
              yAxisId="left" 
              stroke="#00ffff" 
              tick={{ fill: '#00ffff' }}
              tickFormatter={(v) => `$${v.toLocaleString()}`}
            />
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              stroke="#ffaa00" 
              tick={{ fill: '#ffaa00' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ color: '#00ffff' }} />
            
            <Bar 
              yAxisId="right"
              dataKey="transactions" 
              name="Transactions" 
              fill="rgba(255, 170, 0, 0.6)"
              stroke="rgba(255, 170, 0, 0.8)"
              radius={[6, 6, 0, 0]}
            />
            
            <Line 
              yAxisId="left"
              type="monotone"
              dataKey="revenue" 
              name="Revenue ($)" 
              stroke="#00ffff"
              strokeWidth={3}
              dot={{ fill: '#00ffff', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-cyan-200">
        <div className="flex items-center gap-3 p-2 rounded hover:bg-cyan-500/10 transition-colors">
          <div className="w-4 h-4 rounded bg-gradient-to-br from-amber-400 to-amber-600"></div>
          <span>Transaction Volume</span>
        </div>
        <div className="flex items-center gap-3 p-2 rounded hover:bg-cyan-500/10 transition-colors">
          <div className="w-4 h-4 rounded bg-gradient-to-br from-cyan-400 to-cyan-600"></div>
          <span>Revenue (KSH)</span>
        </div>
      </div>
    </div>
  );
}