import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, Area 
} from 'recharts';

interface ForecastChartProps {
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      borderColor?: string;
      backgroundColor?: string;
      fill?: boolean;
      borderDash?: number[];
    }[];
  };
  title: string;
}

export default function ForecastChart({ data, title }: ForecastChartProps) {
  // Transform data
  const chartData = data.labels.map((label, index) => {
    const point: { [key: string]: string | number } = { name: label };
    data.datasets.forEach(dataset => {
      point[dataset.label] = dataset.data[index];
    });
    return point;
  });

  const mainLine = data.datasets.find(d => d.label === 'Forecast');
  const lowerBound = data.datasets.find(d => d.label === 'Lower Bound');
  const upperBound = data.datasets.find(d => d.label === 'Upper Bound');

  return (
    <div className="bg-slate-800 p-6 rounded-2xl shadow-lg">
      <h3 className="text-lg font-bold text-white mb-4">{title}</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }}
              itemStyle={{ color: '#f1f5f9' }}
            />
            <Legend />
            {/* Confidence Area */}
            {lowerBound && upperBound && (
              <Area
                type="monotone"
                dataKey={upperBound.label}
                stroke="none"
                fill="#60a5fa"
                fillOpacity={0.1}
                activeDot={false}
                connectNulls
                stackId="confidence"
              />
            )}
            
            {/* Forecast lines */}
            {mainLine && (
              <Line
                type="monotone"
                dataKey={mainLine.label}
                stroke={mainLine.borderColor || '#34d399'}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            )}
            
            {lowerBound && (
              <Line
                type="monotone"
                dataKey={lowerBound.label}
                stroke={lowerBound.borderColor || '#f87171'}
                strokeDasharray={lowerBound.borderDash?.join(',')}
                strokeWidth={1}
                dot={false}
              />
            )}
            
            {upperBound && (
              <Line
                type="monotone"
                dataKey={upperBound.label}
                stroke={upperBound.borderColor || '#60a5fa'}
                strokeDasharray={upperBound.borderDash?.join(',')}
                strokeWidth={1}
                dot={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}