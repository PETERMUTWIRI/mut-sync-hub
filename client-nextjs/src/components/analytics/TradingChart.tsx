import { useEffect, useRef } from 'react';
import { createChart } from 'lightweight-charts';

// Define the candlestick type
export type Candlestick = {
  time: number;  // Unix timestamp (recommended in v5)
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
};

interface TradingChartProps {
  candles: Candlestick[];
  blur?: boolean;
}

const TradingChart: React.FC<TradingChartProps> = ({ candles, blur }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);  // use any to avoid type mismatch

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Remove old chart
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.offsetWidth,
      height: 320,
      layout: {
        background: { color: '#18181b' },
        textColor: '#fff',
      },
      grid: { vertLines: { color: '#27272a' }, horzLines: { color: '#27272a' } },
      crosshair: { mode: 1 },
      rightPriceScale: { borderColor: '#6b7280' },
      timeScale: { borderColor: '#6b7280' },
    });

    chartRef.current = chart;

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#22d3ee',
      downColor: '#f472b6',
      borderUpColor: '#22d3ee',
      borderDownColor: '#f472b6',
      wickUpColor: '#22d3ee',
      wickDownColor: '#f472b6',
    });

    // Normalize and sort candle data for lightweight-charts v5
    const normalizedCandles = candles
      .map(candle => ({
        time: typeof candle.time === 'number'
          ? candle.time
          : Math.floor(new Date(candle.time).getTime() / 1000),
        open: Number(candle.open),
        high: Number(candle.high),
        low: Number(candle.low),
        close: Number(candle.close),
        volume: candle.volume ? Number(candle.volume) : undefined,
      }))
      .sort((a, b) => a.time - b.time); // Sort strictly ascending by time

    candleSeries.setData(normalizedCandles as any);

    return () => {
      chart.remove();
      chartRef.current = null;
    };
  }, [candles]);

  return (
    <div
      ref={chartContainerRef}
      className={`w-full h-80 rounded-2xl shadow-xl border border-blue-500/30 relative ${blur ? 'blur-sm pointer-events-none' : ''}`}
      style={{ overflow: 'hidden' }}
    >
      {blur && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <span className="bg-black/60 text-white px-6 py-2 rounded-xl text-lg font-bold">
            Upgrade to view full chart
          </span>
        </div>
      )}
    </div>
  );
};

export default TradingChart; TradingChart;
