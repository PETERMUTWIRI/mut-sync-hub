import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

export type ChartPoint = { date: string; value: number };

interface AnalyticsLineChartProps {
  data: ChartPoint[];
  color?: string;
  label?: string;
}

const AnalyticsLineChart: React.FC<AnalyticsLineChartProps> = ({ data, color = '#06b6d4', label }) => (
  <ResponsiveContainer width="100%" height={220}>
    <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
      <XAxis dataKey="date" tick={{ fill: '#cbd5e1', fontSize: 12 }} />
      <YAxis tick={{ fill: '#cbd5e1', fontSize: 12 }} />
      <Tooltip contentStyle={{ background: '#232347', border: 'none', color: '#fff' }} />
      <Line type="monotone" dataKey="value" stroke={color} strokeWidth={3} dot={false} name={label} />
    </LineChart>
  </ResponsiveContainer>
);

export default AnalyticsLineChart;
