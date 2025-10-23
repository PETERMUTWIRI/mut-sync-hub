import React from 'react';

interface StackedBarChartProps {
  id: string;
  data: {
    labels: string[];
    series: Array<{
      label: string;
      values: number[];
      color: string;
    }>;
  };
  title: string;
}

export default function StackedBarChart({ id, data, title }: StackedBarChartProps) {
  const max = Math.max(...data.series.flatMap(s => s.values));

  return (
    <div className="bg-slate-800 p-6 rounded-2xl shadow-lg h-full">
      <div className="text-lg font-bold text-white mb-4">{title}</div>
      <div className="flex flex-col gap-4">
        {data.labels.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div className="w-24 text-slate-300 text-sm">{label}</div>
            <div className="flex-1 flex h-8 rounded overflow-hidden">
              {data.series.map((series, j) => (
                <div
                  key={series.label}
                  style={{
                    width: `${(series.values[i] / max) * 100}%`,
                    background: series.color,
                  }}
                  className="h-full"
                  title={`${series.label}: ${series.values[i]}`}
                />
              ))}
            </div>
            <div className="w-16 text-right text-slate-400 text-xs">
              {data.series.map(series => series.values[i]).reduce((a, b) => a + b, 0)}
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-4 mt-4">
        {data.series.map(series => (
          <div key={series.label} className="flex items-center gap-2">
            <span className="inline-block w-4 h-4 rounded" style={{ background: series.color }} />
            <span className="text-slate-300 text-xs">{series.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
