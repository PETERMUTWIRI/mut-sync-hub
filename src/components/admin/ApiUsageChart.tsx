'use client';

import { useState, useMemo, useEffect } from 'react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  Cell 
} from 'recharts';
import { HiSignal, HiExclamationTriangle, HiClock, HiBolt, HiTrophy } from 'react-icons/hi2';

interface EndpointUsage {
  endpoint: string;
  requests: number;
  errors: number;
  errorRate: number;
  latency: number;
}

interface ApiUsageChartProps {
  endpoints?: EndpointUsage[];
  isLoading?: boolean;
}

// Animated counter component
function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    const start = displayValue;
    const end = value;
    const duration = 800;
    const startTime = performance.now();
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      
      setDisplayValue(Math.floor(start + (end - start) * easeOutQuart));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [value]);
  
  return <span>{displayValue.toLocaleString()}{suffix}</span>;
}

export function ApiUsageChart({ endpoints = [], isLoading = false }: ApiUsageChartProps) {
  const [selectedEndpoint, setSelectedEndpoint] = useState<string | null>(null);

  const chartData = useMemo(() => {
    return endpoints.map(ep => ({
      name: ep.endpoint.replace('/api/', ''),
      fullName: ep.endpoint,
      requests: ep.requests,
      errorRate: ep.errorRate,
      latency: ep.latency,
      errors: ep.errors,
      // Calculate performance score (0-100)
      performance: Math.max(0, 100 - (ep.errorRate * 2) - (ep.latency / 10))
    }));
  }, [endpoints]);

  const stats = useMemo(() => {
    if (!chartData.length) return null;
    
    const totalRequests = chartData.reduce((sum, d) => sum + d.requests, 0);
    const avgLatency = Math.round(chartData.reduce((sum, d) => sum + d.latency, 0) / chartData.length);
    const avgErrorRate = Number((chartData.reduce((sum, d) => sum + d.errorRate, 0) / chartData.length).toFixed(1));
    
    // Find best and worst performers
    const best = chartData.reduce((best, current) => current.performance > best.performance ? current : best);
    const worst = chartData.reduce((worst, current) => current.performance < worst.performance ? current : worst);
    
    return { totalRequests, avgLatency, avgErrorRate, best, worst };
  }, [chartData]);

  // Performance badge component
  const PerformanceBadge = ({ endpoint }: { endpoint: typeof chartData[0] }) => {
    const isBest = endpoint.fullName === stats?.best.fullName;
    const isWorst = endpoint.fullName === stats?.worst.fullName;
    
    if (isBest) {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
          <HiTrophy className="w-3 h-3" />
          BEST
        </span>
      );
    }
    if (isWorst) {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-bold text-red-400 bg-red-400/10 px-2 py-1 rounded-full">
          <HiExclamationTriangle className="w-3 h-3" />
          SLOWEST
        </span>
      );
    }
    return null;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900/95 border border-cyan-500/30 rounded-lg p-4 shadow-2xl backdrop-blur">
        <div className="text-cyan-400 font-bold mb-2 flex items-center gap-2">
          <HiBolt className="text-yellow-400" />
          {data.fullName}
          <PerformanceBadge endpoint={data} />
        </div>
        <div className="space-y-1 text-sm text-cyan-200">
          <div className="flex justify-between gap-4">
            <span className="text-slate-400">Requests:</span>
            <span className="font-mono text-cyan-300">{data.requests.toLocaleString()}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-400">Errors:</span>
            <span className="font-mono text-red-400">{data.errors}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-400">Error Rate:</span>
            <span className="font-mono text-amber-400">{data.errorRate}%</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-400">Latency:</span>
            <span className="font-mono text-green-400">{data.latency}ms</span>
          </div>
          <div className="pt-2 mt-2 border-t border-cyan-500/20">
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Performance:</span>
              <span className={`font-mono font-bold ${
                data.performance >= 80 ? 'text-green-400' : 
                data.performance >= 50 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {Math.round(data.performance)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading || !stats) {
    return (
      <div className="bg-slate-900/50 border border-cyan-500/20 rounded-xl p-6 shadow-xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-cyan-500/20 rounded w-1/3"></div>
          <div className="h-64 bg-slate-800/50 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Real-time Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-slate-900/60 border border-cyan-500/20 rounded-lg p-4 shadow-lg hover:shadow-cyan-500/20 transition-all duration-300">
          <div className="flex items-center gap-2 text-cyan-400 text-sm mb-1">
            <HiSignal className="w-4 h-4" />
            <span>Total Requests</span>
          </div>
          <div className="text-2xl font-bold text-cyan-300 font-mono">
            <AnimatedCounter value={stats.totalRequests} />
          </div>
          <div className="text-xs text-green-400 mt-1">+15% vs last hour</div>
        </div>

        <div className="bg-slate-900/60 border border-cyan-500/20 rounded-lg p-4 shadow-lg hover:shadow-cyan-500/20 transition-all duration-300">
          <div className="flex items-center gap-2 text-amber-400 text-sm mb-1">
            <HiExclamationTriangle className="w-4 h-4" />
            <span>Avg Error Rate</span>
          </div>
          <div className="text-2xl font-bold text-amber-300 font-mono">
            {stats.avgErrorRate}%
          </div>
          <div className="text-xs text-green-400 mt-1">-0.2% improvement</div>
        </div>

        <div className="bg-slate-900/60 border border-cyan-500/20 rounded-lg p-4 shadow-lg hover:shadow-cyan-500/20 transition-all duration-300">
          <div className="flex items-center gap-2 text-green-400 text-sm mb-1">
            <HiClock className="w-4 h-4" />
            <span>Avg Latency</span>
          </div>
          <div className="text-2xl font-bold text-green-300 font-mono">
            {stats.avgLatency}ms
          </div>
          <div className="text-xs text-green-400 mt-1">-5ms improvement</div>
        </div>

        <div className="bg-slate-900/60 border border-green-500/30 rounded-lg p-4 shadow-lg">
          <div className="flex items-center gap-2 text-green-400 text-sm mb-1">
            <HiTrophy className="w-4 h-4" />
            <span>Best Performer</span>
          </div>
          <div className="text-lg font-bold text-white truncate" title={stats.best.fullName}>
            {stats.best.name}
          </div>
          <div className="text-xs text-green-400 mt-1">{Math.round(stats.best.performance)}% score</div>
        </div>

        <div className="bg-slate-900/60 border border-red-500/30 rounded-lg p-4 shadow-lg">
          <div className="flex items-center gap-2 text-red-400 text-sm mb-1">
            <HiExclamationTriangle className="w-4 h-4" />
            <span>Needs Attention</span>
          </div>
          <div className="text-lg font-bold text-white truncate" title={stats.worst.fullName}>
            {stats.worst.name}
          </div>
          <div className="text-xs text-red-400 mt-1">{Math.round(stats.worst.performance)}% score</div>
        </div>
      </div>

      {/* Main Chart */}
      <div className="bg-slate-900/50 border border-cyan-500/20 rounded-xl p-6 shadow-xl relative overflow-hidden">
        {/* Glow effect via pseudo-element simulation */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent pointer-events-none"></div>
        
        <div className="flex justify-between items-center mb-4 relative z-10">
          <h2 className="text-xl font-bold text-cyan-400 flex items-center gap-2">
            <HiSignal className="w-5 h-5" />
            Endpoint Performance Matrix
          </h2>
          <div className="text-xs text-cyan-200/70">
            Last Hour • Live Updates
          </div>
        </div>

        <div className="relative z-10">
          <ResponsiveContainer width="100%" height={420}>
            <ComposedChart 
              data={chartData}
              onMouseMove={(state: any) => {
                if (state?.activePayload?.[0]?.payload) {
                  setSelectedEndpoint(state.activePayload[0].payload.fullName);
                }
              }}
              onMouseLeave={() => setSelectedEndpoint(null)}
            >
              <CartesianGrid stroke="rgba(0, 255, 255, 0.05)" vertical={false} />
              <XAxis 
                dataKey="name" 
                stroke="#00ffff"
                tick={{ fill: '#00ffff', fontSize: 11 }}
                angle={-35}
                textAnchor="end"
                height={70}
                interval={0}
              />
              <YAxis yAxisId="left" stroke="#00ffff" tick={{ fill: '#00ffff' }} />
              <YAxis yAxisId="right" orientation="right" stroke="#ffaa00" tick={{ fill: '#ffaa00' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: '#00ffff' }} />
              
              <Bar 
                yAxisId="left"
                dataKey="requests" 
                name="Total Requests" 
                radius={[6, 6, 0, 0]}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`}
                    fill={selectedEndpoint === entry.fullName ? 
                      'rgba(0, 255, 255, 0.9)' : 'rgba(0, 255, 255, 0.6)'}
                    stroke={selectedEndpoint === entry.fullName ? 
                      'rgba(0, 255, 255, 1)' : 'rgba(0, 255, 255, 0.8)'}
                    strokeWidth={selectedEndpoint === entry.fullName ? 2 : 1}
                  />
                ))}
              </Bar>
              
              <Line 
                yAxisId="right"
                type="monotone"
                dataKey="errorRate" 
                name="Error Rate (%)" 
                stroke="#ffaa00"
                strokeWidth={3}
                dot={{ fill: '#ffaa00', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
              />
              
              <Line 
                yAxisId="right"
                type="monotone"
                dataKey="latency" 
                name="Avg Latency (ms)" 
                stroke="#00ff88"
                strokeWidth={3}
                dot={{ fill: '#00ff88', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Interactive Legend */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-cyan-200 relative z-10">
          <div className="flex items-center gap-3 p-2 rounded hover:bg-cyan-500/10 transition-colors cursor-default">
            <div className="w-4 h-4 rounded bg-gradient-to-br from-cyan-400 to-cyan-600"></div>
            <div>
              <div className="font-medium">Request Volume</div>
              <div className="text-xs text-slate-400">Total calls per endpoint</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-2 rounded hover:bg-amber-500/10 transition-colors cursor-default">
            <div className="w-4 h-4 rounded bg-gradient-to-br from-amber-400 to-amber-600"></div>
            <div>
              <div className="font-medium">Error Rate</div>
              <div className="text-xs text-slate-400">Percentage of failures</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-2 rounded hover:bg-green-500/10 transition-colors cursor-default">
            <div className="w-4 h-4 rounded bg-gradient-to-br from-green-400 to-green-600"></div>
            <div>
              <div className="font-medium">Response Time</div>
              <div className="text-xs text-slate-400">Average latency in ms</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}