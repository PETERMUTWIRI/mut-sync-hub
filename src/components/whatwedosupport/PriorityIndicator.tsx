// src/components/support/PriorityIndicator.tsx
import React from 'react';

interface PriorityIndicatorProps {
  priority: 'critical' | 'high' | 'medium' | 'low';
}

const PriorityIndicator: React.FC<PriorityIndicatorProps> = ({ priority }) => {
  const getPriorityClass = () => {
    switch (priority) {
      case 'critical':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className={`w-3 h-3 rounded-full ${getPriorityClass()}`}></div>
  );
};

export default PriorityIndicator;