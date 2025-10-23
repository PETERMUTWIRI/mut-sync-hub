import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressCircleProps {
  value: number;        // 0-100
  size?: number;        // px
  strokeWidth?: number; // px
  color?: string;       // any valid css colour
  className?: string;
}

export function ProgressCircle({
  value,
  size = 64,
  strokeWidth = 6,
  color = '#10b981',
  className,
}: ProgressCircleProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-gray-700"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-300"
        />
      </svg>
      <span className="absolute text-xs font-semibold">{Math.round(value)}%</span>
    </div>
  );
}
