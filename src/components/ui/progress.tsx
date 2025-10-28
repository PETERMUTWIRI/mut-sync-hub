// src/components/ui/progress.tsx
import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressProps {
  value?: number;        // 0-100
  className?: string;
}

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ value = 0, className }, ref) => {
    const percent = Math.min(Math.max(value, 0), 100);
    return (
      <div
        ref={ref}
        className={cn('relative w-full h-2 bg-gray-700 rounded-full overflow-hidden', className)}
      >
        <div
          className="h-full bg-[#2E7D7D] transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    );
  }
);
Progress.displayName = 'Progress';