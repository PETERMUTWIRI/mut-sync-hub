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

  return (
    <ErrorBoundary>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto py-10 px-6 bg-[#1E2A44] text-white font-inter w-full">
        {/* sticky header */}
        <header className="sticky top-0 z-20 bg-[#1E2A44]/95 backdrop-blur-md border-b border-[#2E7D7D]/30 py-4 px-6">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold">Notifications</h1>
            <div className="flex gap-2">
              <Button onClick={markAll} className="bg-[#2E7D7D] text-white hover:bg-[#2E7D7D]/80">Mark all as read</Button>
              <Button onClick={deleteAll} className="bg-red-600 text-white hover:bg-red-500">Delete all</Button>
              <Button onClick={() => fetchNotifications()} className="bg-[#2E7D7D] text-white hover:bg-[#2E7D7D]/80">Refresh</Button>
            </div>
          </div>
        </header>

        <h1 className="text-3xl font-bold mb-6 mt-8">Notifications</h1>

        {/* preferences card */}
        <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
          <Card className="mb-8 bg-[#2E7D7D]/10 border-0 shadow-lg rounded-xl">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-[#2E7D7D]">Notification Preferences</CardTitle>
              <p className="text-sm text-gray-400 mt-2">Choose which notifications you want to receive and how.</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {['Product Updates', 'Billing Alerts', 'Support Messages'].map((label) => (
                  <div key={label} className="space-y-2">
                    <label className="text-[#2E7D7D] font-medium">{label}</label>
                    <select className="bg-[#2E7D7D]/20 text-white rounded-lg p-2 w-full border border-[#2E7D7D]/30 focus:ring-2 focus:ring-[#2E7D7D]">
                      <option>Email</option><option>In-App</option><option>SMS</option>
                    </select>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* all notifications */}
        <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
          <Card className="bg-[#2E7D7D]/10 border-0 shadow-lg rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-semibold text-[#2E7D7D]">All Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              {notifications.length === 0 ? (
                <p className="text-gray-400">No notifications available.</p>
              ) : (
                <div className="space-y-4">
                  {notifications.map((n) => (
                    <motion.div
                      key={n.id}
                      className={`flex items-start p-4 rounded-lg ${n.status === "READ" ? "bg-[#2E7D7D]/5" : "bg-[#2E7D7D]/10"}`}
                      whileHover={{ scale: 1.01 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-white">{n.title}</p>
                        <p className="text-gray-300">{n.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                      </div>
                      {n.status !== "READ" && (
                        <Button
                          onClick={() => markOne(n.id)}
                          className="ml-4 bg-[#2E7D7D] text-white hover:bg-[#2E7D7D]/80"
                        >
                          Mark as read
                        </Button>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* integrations placeholder */}
        <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
          <Card className="mt-8 bg-[#2E7D7D]/10 border-0 shadow-lg rounded-xl">
            <CardHeader><CardTitle className="text-xl font-semibold text-[#2E7D7D]">Integrations</CardTitle></CardHeader>
            <CardContent>
              <p className="text-gray-400 mb-2">Forward notifications to your favourite apps:</p>
              <div className="flex gap-2">
                {["Slack", "Teams", "Email"].map((app) => (
                  <Button
                    key={app}
                    onClick={() => toast(`${app} integration coming soon!`)}
                    className="bg-[#2E7D7D] text-white hover:bg-[#2E7D7D]/80"
                  >
                    Connect {app}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <Toaster position="top-right" />
      </motion.div>
    </ErrorBoundary>
  );
}
