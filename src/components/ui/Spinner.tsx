'use client'; // Required for Client Component in Next.js App Router

import React from 'react';

interface SpinnerProps {
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ className = '' }) => (
  <div
    className={`flex items-center justify-center w-full h-full py-16 ${className}`}
    role="status"
    aria-live="polite"
  >
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-amber-500 border-opacity-80"></div>
    <span className="ml-6 text-xl font-semibold text-white tracking-wide drop-shadow-lg">
      Loading...
    </span>
  </div>
);

export default Spinner;