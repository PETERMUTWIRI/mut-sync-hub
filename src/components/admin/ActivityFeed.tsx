// src/components/admin/ActivityFeed.tsx
'use client';

import { motion } from 'framer-motion';
import { HiUser, HiCurrencyDollar, HiServer, HiExclamationTriangle } from 'react-icons/hi2';

interface ActivityFeedProps {
  events: any[];
  global?: boolean;
}

export function ActivityFeed({ events, global = false }: ActivityFeedProps) {
  const formatEvent = (event: any) => {
    switch (event.event) {
      case 'user:new':
        return { icon: <HiUser className="text-blue-400" />, text: `New user: ${event.data.email}`, color: 'border-blue-400' };
      case 'payment:new':
        return { icon: <HiCurrencyDollar className="text-green-400" />, text: `Payment $${event.data.amount}`, color: 'border-green-400' };
      case 'support:new':
        return { icon: <HiExclamationTriangle className="text-red-400" />, text: `Support: ${event.data.title}`, color: 'border-red-400' };
      case 'support:reply':
        return { icon: <HiServer className="text-purple-400" />, text: `Reply to ${event.data.userEmail}`, color: 'border-purple-400' };
      default:
        return { icon: <HiServer className="text-gray-400" />, text: event.event, color: 'border-gray-400' };
    }
  };

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {events.map((event) => {
        const formatted = formatEvent(event);
        return (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`flex items-center gap-4 p-4 bg-cockpit-panel rounded-lg border-l-4 ${formatted.color}`}
          >
            {formatted.icon}
            <div className="flex-1">
              <p className="text-gray-200">{formatted.text}</p>
              <span className="text-xs text-gray-500">{new Date(event.timestamp).toLocaleString()}</span>
            </div>
            {global && event.data.orgId && (
              <span className="text-xs px-2 py-1 bg-gray-700 rounded">{event.data.orgId.substring(0, 8)}</span>
            )}
          </motion.div>
        );
      })}
      {events.length === 0 && (
        <div className="text-center py-8 text-gray-500">No activity yet</div>
      )}
    </div>
  );
}