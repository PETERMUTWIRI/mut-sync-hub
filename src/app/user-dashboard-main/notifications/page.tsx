"use client";

import React, { useEffect, useState } from 'react';
import { useUser } from '@stackframe/stack';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import { Tooltip } from 'react-tooltip';
import { io } from 'socket.io-client';

// Dynamic imports
const Card = dynamic(() => import('@/components/ui/card').then((m) => m.Card), { ssr: false });
const CardHeader = dynamic(() => import('@/components/ui/card').then((m) => m.CardHeader), { ssr: false });
const CardTitle = dynamic(() => import('@/components/ui/card').then((m) => m.CardTitle), { ssr: false });
const CardContent = dynamic(() => import('@/components/ui/card').then((m) => m.CardContent), { ssr: false });
const Button = dynamic(() => import('@/components/ui/button').then((m) => m.Button), { ssr: false });
const Spinner = dynamic(() => import('@/components/ui/Spinner').then((m) => m.Spinner), { ssr: false });

// Error Boundary
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError)
      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-[#1E2A44] flex items-center justify-center text-white">
          <div className="text-center bg-[#2E7D7D]/10 rounded-xl p-8 border border-[#2E7D7D]/30">
            <p className="text-red-400 font-inter text-lg">Failed to load notifications</p>
            <button onClick={() => window.location.reload()} className="mt-4 bg-[#2E7D7D] text-white px-6 py-2 rounded-lg hover:bg-[#2E7D7D]/80">Retry</button>
          </div>
        </motion.div>
      );
    return this.props.children;
  }
}

export default function NotificationsPage() {
  useUser({ or: 'redirect' });
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  /* ----------  initial fetch  ---------- */
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/notifications').then((r) => r.json());
      setNotifications(res);
    } catch {
      toast.error('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  /* ----------  real-time updates  ---------- */
  useEffect(() => {
    const socket = io(`${process.env.NEXT_PUBLIC_ORIGIN}/analytics`);
    socket.on('notification:new', (n: any) => setNotifications((prev) => [n, ...prev]));
    socket.on('notification:read', (id: string) =>
      setNotifications((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'READ', readAt: new Date() } : p)))
    );
    socket.on('notification:readAll', () =>
      setNotifications((prev) => prev.map((p) => ({ ...p, status: 'READ', readAt: new Date() })))
    );
    return () => { socket.disconnect(); };
  }, []);

  /* ----------  actions  ---------- */
  const markOne = async (id: string) => {
    await fetch('/api/notifications', { method: 'PATCH', body: JSON.stringify({ id }) });
    setNotifications((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'READ', readAt: new Date() } : p)));
    toast.success('Marked as read');
  };

  const markAll = async () => {
    await fetch('/api/notifications', { method: 'PUT' });
    setNotifications((prev) => prev.map((p) => ({ ...p, status: 'READ', readAt: new Date() })));
    toast.success('All marked as read');
  };

  const deleteAll = async () => {
    if (!window.confirm('Delete all notifications?')) return;
    await fetch('/api/notifications', { method: 'DELETE' });
    setNotifications([]);
    toast.success('Deleted');
  };

  /* ----------  loading / empty  ---------- */
  if (loading)
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-[#1E2A44] flex items-center justify-center w-full">
        <div className="text-center"><Spinner /><p className="mt-4 text-gray-300 font-inter text-lg">Loading Notifications...</p></div>
      </motion.div>
    );

    /* ---------- safety guards ---------- */
  const safeNotifications = Array.isArray(notifications) ? notifications : [];

  return (
    <ErrorBoundary>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-[#0B1020] text-gray-100 font-inter"
      >
        {/* -------------- HEADER -------------- */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-[#0B1020]/80 backdrop-blur-xl border-b border-white/10"
        >
          <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Notifications
          </h1>
          <div className="flex items-center gap-3">
            <Button
              onClick={markAll}
              className="bg-cyan-500 text-black hover:bg-cyan-400"
            >
              Mark all as read
            </Button>
            <Button
              onClick={deleteAll}
              className="bg-red-600 text-white hover:bg-red-500"
            >
              Delete all
            </Button>
            <Button
              onClick={fetchNotifications}
              className="bg-white/10 text-white hover:bg-white/20"
            >
              Refresh
            </Button>
          </div>
        </motion.header>

        {/* -------------- MAIN GRID -------------- */}
        <main className="p-6 max-w-7xl mx-auto grid gap-8">
          {/* 1️⃣  PREFERENCES  */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md"
          >
            <h2 className="text-xl font-semibold text-cyan-400 mb-4">
              Notification Preferences
            </h2>
            <p className="text-sm text-gray-400 mb-4">
              Choose which notifications you want to receive and how.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {['Product Updates', 'Billing Alerts', 'Support Messages'].map((label) => (
                <div key={label} className="space-y-2">
                  <label className="text-cyan-300 font-medium">{label}</label>
                  <select className="bg-white/5 border border-white/10 text-white rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-cyan-400">
                    <option>Email</option>
                    <option>In-App</option>
                    <option>SMS</option>
                  </select>
                </div>
              ))}
            </div>
          </motion.div>

          {/* 2️⃣  NOTIFICATIONS  */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md"
          >
            <h2 className="text-xl font-semibold text-cyan-400 mb-4">
              All Notifications
            </h2>
            {safeNotifications.length === 0 ? (
              <p className="text-gray-400">No notifications available.</p>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {safeNotifications.map((n) => (
                  <motion.div
                    key={n.id}
                    whileHover={{ scale: 1.01 }}
                    className={`flex items-start gap-4 p-4 rounded-lg border border-white/10 ${
                      n.status === 'READ'
                        ? 'bg-white/5'
                        : 'bg-cyan-400/10 border-cyan-400/30'
                    }`}
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-white">{n.title}</p>
                      <p className="text-gray-300 text-sm">{n.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(n.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {n.status !== 'READ' && (
                      <Button
                        onClick={() => markOne(n.id)}
                        className="bg-cyan-500 text-black hover:bg-cyan-400 text-xs px-3 py-1"
                      >
                        Mark as read
                      </Button>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* 3️⃣  INTEGRATIONS  */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md"
          >
            <h2 className="text-xl font-semibold text-cyan-400 mb-4">
              Integrations
            </h2>
            <p className="text-sm text-gray-400 mb-4">
              Forward notifications to your favourite apps:
            </p>
            <div className="flex flex-wrap gap-3">
              {['Slack', 'Teams', 'Email'].map((app) => (
                <Button
                  key={app}
                  onClick={() => toast(`${app} integration coming soon!`)}
                  className="bg-white/10 text-white hover:bg-white/20"
                >
                  Connect {app}
                </Button>
              ))}
            </div>
          </motion.div>
        </main>
      </motion.div>
    </ErrorBoundary>
  );
}