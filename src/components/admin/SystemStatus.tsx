// src/components/admin/SystemStatus.tsx
'use client';

import { motion, Variants } from 'framer-motion';
import { 
  HiCheckCircle, HiExclamationCircle, HiServer, HiSignal,
  HiCpuChip, HiArchiveBox, HiCloud, HiClock
} from 'react-icons/hi2';
import { IconType } from 'react-icons';

// Service status type
export type ServiceState = 'OPERATIONAL' | 'DEGRADED' | 'MAINTENANCE' | 'OUTAGE';

interface BaseStatusProps {
  status: ServiceState;
}

interface ServiceProps extends BaseStatusProps {
  service: string;
  latency: string;
  icon: React.ReactNode;
  lastChecked?: string;
}


interface SystemStatusIndicatorProps {
  status: ServiceState;
}
// Service icon mapping
const serviceIcons: Record<string, React.ReactNode> = {
  api: <HiSignal className="text-xl" />,
  database: <HiArchiveBox className="text-xl" />,
  redis: <HiServer className="text-xl" />,
  cache: <HiCpuChip className="text-xl" />,
  cloud: <HiCloud className="text-xl" />,
  qstash: <HiClock className="text-xl" />,
  gateway: <HiSignal className="text-xl" />
};

// Status styles
const statusStyles = {
  OPERATIONAL: 'bg-green-500/10 text-green-400 border-green-500/30',
  DEGRADED: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  MAINTENANCE: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  OUTAGE: 'bg-red-500/10 text-red-400 border-red-500/30'
};

const pingVariants: Variants = {
  healthy: { scale: 1 },
  warning: { scale: [1, 1.2, 1], transition: { duration: 1.5, repeat: Infinity } }
};

/**
 * Main SystemStatus Component
 * Usage: <SystemStatus health="OPERATIONAL" />
 */
export function SystemStatus({ status }: SystemStatusIndicatorProps) {
  const style = statusStyles[status] || statusStyles.OUTAGE;
  const isHealthy = status === 'OPERATIONAL';
  
  return (
    <motion.div
      variants={pingVariants}
      animate={isHealthy ? 'healthy' : 'warning'}
      className={`flex items-center gap-3 px-6 py-3 rounded-2xl backdrop-blur border ${style}`}
    >
      {isHealthy ? 
        <HiCheckCircle className="text-2xl text-green-400" /> : 
        <HiExclamationCircle className="text-2xl text-red-400" />
      }
      <div>
        <div className={`font-bold ${isHealthy ? 'text-green-400' : 'text-red-400'}`}>
          {status} {/* ✅ Changed from health to status */}
        </div>
        <div className="text-xs text-gray-500">
          {isHealthy ? 'All systems nominal' : 'Investigating issues'}
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Individual Service Status Card
 * Usage: <SystemStatus service="API Gateway" status="OPERATIONAL" latency="12ms" icon={<HiSignal />} />
 */
export function ServiceStatus({ service, status, latency, icon, lastChecked }: ServiceProps) {
  const style = statusStyles[status] || statusStyles.OUTAGE;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex items-center justify-between p-4 bg-cockpit-panel rounded-xl border ${style}`}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${style}`}>
          {icon}
        </div>
        <div>
          <div className="text-gray-200 font-medium capitalize">
            {service}
          </div>
          <div className="text-xs text-gray-500">
            Last checked: {lastChecked || new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <span className={`text-sm font-mono ${status === 'OPERATIONAL' ? 'text-green-400' : 'text-red-400'}`}>
          {latency || '--'}
        </span>
        <motion.div 
          className={`w-2 h-2 rounded-full ${
            status === 'OPERATIONAL' ? 'bg-green-400' : 'bg-red-400'
          }`}
          animate={status === 'OPERATIONAL' ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </div>
    </motion.div>
  );
}

/**
 * Grid of all services
 * Usage: <SystemStatusGrid services={[...]} />
 */
export function SystemStatusGrid({ services }: { services?: ServiceProps[] }) {
  if (!services || services.length === 0) {
    return (
      <div className="bg-cockpit-panel rounded-2xl p-6 border border-cyan-500/10">
        <h3 className="text-lg font-bold text-cyan-400 mb-4">System Services</h3>
        <div className="text-gray-500">No service data available</div>
      </div>
    );
  }

  return (
    <div className="bg-cockpit-panel/50 rounded-2xl p-6 border border-cyan-500/10 backdrop-blur">
      <h3 className="text-lg font-bold text-cyan-400 mb-6 flex items-center gap-2">
        <HiServer /> Service Health
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((service) => (
          <ServiceStatus key={service.service} {...service} />
        ))}
      </div>
    </div>
  );
}

// Default export for simple usage
export default SystemStatus;

// Static property for backward compatibility
SystemStatus.Details = SystemStatusGrid;