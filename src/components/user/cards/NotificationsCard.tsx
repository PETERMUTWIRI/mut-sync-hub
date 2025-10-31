'use client';

import React, { useEffect, useState } from 'react';
import { HiBell } from 'react-icons/hi';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { io } from 'socket.io-client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface Notification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  status: 'READ' | 'UNREAD';
  type: 'anomaly' | 'system' | 'billing';
  actionUrl?: string;
}

export default function NotificationsCard() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Defensive fetch: API may return either an array or an object like { notifications: [...] }
    fetch('/api/notifications')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) return setNotifications(data);
        if (data && Array.isArray((data as any).notifications)) return setNotifications((data as any).notifications);
        // fallback to empty array
        return setNotifications([]);
      })
      .catch(() => setNotifications([]));

    // Create socket only if window is available and origin is configured; otherwise skip socket usage.
    try {
      const origin = (typeof window !== 'undefined' && window.location?.origin) || process.env.NEXT_PUBLIC_ORIGIN || '';
      if (origin) {
        const socket: any = io(`${origin}/analytics`);
        socket.on('notification:new', (n: Notification) => setNotifications((prev) => [n, ...prev]));
        socket.on('notification:read', (id: string) => setNotifications((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'READ' } : p))));
        socket.on('notification:readAll', () => setNotifications((prev) => prev.map((p) => ({ ...p, status: 'READ' }))));
        return () => {
          socket.disconnect();
        };
      }
    } catch (e) {
      // ignore socket errors; notifications will still render from fetch
      console.warn('Notifications socket disabled', e);
    }
  }, []);

  const unreadCount = notifications.filter((n) => n.status === 'UNREAD').length;
  const latest = notifications[0];

  const getAlertMessage = () => {
    if (!latest) return null;
    if (latest.type === 'anomaly') return `Anomaly: ${latest.message}`;
    if (latest.type === 'billing') return `Billing: ${latest.message}`;
    return latest.message;
  };

  return (
    <motion.div className="glass-card" whileHover={{ scale: 1.02 }} transition={{ type: 'spring', stiffness: 300 }}>
      <div className="flex items-center gap-2 mb-2">
        <HiBell className="text-[#2E7D7D] text-base" />
        <span className="text-white font-inter font-semibold text-base">Notifications</span>
      </div>
      <div className="text-white font-inter font-bold text-base mb-1">Unread: {unreadCount}</div>
      {latest && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-2">
          <Alert className="bg-[#2E7D7D]/20 border-[#2E7D7D] text-gray-100">
            <HiBell className="h-4 w-4 text-[#2E7D7D]" />
            <AlertTitle className="font-inter text-sm">{latest.type === 'anomaly' ? 'Alert' : 'Info'}</AlertTitle>
            <AlertDescription className="font-inter text-xs">
              {getAlertMessage()}
              {latest.actionUrl && (
                <Button variant="link" className="text-[#2E7D7D] pl-1 text-xs" onClick={() => router.push(latest.actionUrl as string)}>
                  →
                </Button>
              )}
            </AlertDescription>
          </Alert>
        </motion.div>
      )}
      <div className="text-xs font-inter text-gray-300">{latest?.message || 'No notifications'}</div>
    </motion.div>
  );
}