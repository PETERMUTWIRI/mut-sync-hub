// src/components/support/SystemStatusCard.tsx
import React from 'react';
import { CheckCircle2, AlertCircle, Wrench, XCircle } from 'lucide-react';

interface SystemStatusCardProps {
  service: string;
  status: 'operational' | 'degraded' | 'maintenance' | 'outage';
  lastUpdated: string;
}

const SystemStatusCard: React.FC<SystemStatusCardProps> = ({ service, status, lastUpdated }) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'operational':
        return <CheckCircle2 size={16} className="text-green-500" />;
      case 'degraded':
        return <AlertCircle size={16} className="text-yellow-500" />;
      case 'maintenance':
        return <Wrench size={16} className="text-blue-500" />;
      case 'outage':
        return <XCircle size={16} className="text-red-500" />;
      default:
        return <AlertCircle size={16} className="text-gray-500" />;
    }
  };

  const getStatusClass = () => {
    switch (status) {
      case 'operational':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'degraded':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'maintenance':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'outage':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        {getStatusIcon()}
        <span className="text-gray-700 dark:text-gray-300">{service}</span>
      </div>
      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${getStatusClass()}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    </div>
  );
};

export default SystemStatusCard;