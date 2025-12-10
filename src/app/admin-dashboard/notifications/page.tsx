// src/app/notifications/page.tsx (SUPERADMIN - Pure SSE)
'use client';

import { useEffect, useState, useCallback } from 'react';
import { toast,Toaster } from 'react-hot-toast';
import { HiBell, HiCheckCircle, HiTrash, HiXMark } from 'react-icons/hi2';
import { HiRefresh, HiGlobe,HiTicket } from 'react-icons/hi';
import { motion, AnimatePresence } from 'framer-motion';

// ──────────────────────────────────────────────────────────────
// TYPES (Global Notifications)
// ──────────────────────────────────────────────────────────────

interface GlobalNotification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'ERROR' | 'SUPPORT' | 'BROADCAST' | 'SYSTEM';
  status: 'READ' | 'UNREAD';
  createdAt: string;
  orgId?: string;
  orgName?: string;
  userId?: string;
  userEmail?: string;
  metadata?: any;
}

// ──────────────────────────────────────────────────────────────
// SUPERADMIN VERIFICATION (Direct)
// ──────────────────────────────────────────────────────────────

async function verifySuperAdminAccess(): Promise<void> {
  const res = await fetch('/api/admin/verify', {
    credentials: 'include',
    headers: { 'Accept': 'application/json' }
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Unauthorized' }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }
}

// ──────────────────────────────────────────────────────────────
// MAIN COMPONENT (Pure SSE + Global State)
// ──────────────────────────────────────────────────────────────

export default function AdminNotificationsPage() {
  // ──────────────────────────────────────────────────────────
  // STATE (Global Scope)
  // ──────────────────────────────────────────────────────────

  const [notifications, setNotifications] = useState<GlobalNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(true);
  const [eventSource, setEventSource] = useState<EventSource | null>(null);

  // ──────────────────────────────────────────────────────────
  // AUTH GUARD (Verify Superadmin FIRST)
  // ──────────────────────────────────────────────────────────

  useEffect(() => {
    verifySuperAdminAccess()
      .then(() => {
        console.log('✅ [AdminNotificationsPage] Superadmin verified');
        fetchNotifications();
      })
      .catch((err) => {
        console.error('❌ [AdminNotificationsPage] Access denied:', err);
        setError(err.message);
        toast.error('🔒 Unauthorized: Super admin access required');
        // Auto-redirect non-admins after 3 seconds
        setTimeout(() => window.location.href = '/user-dashboard-main', 3000);
      });
  }, []);

  // ──────────────────────────────────────────────────────────
  // GLOBAL DATA FETCH (No Org Filtering)
  // ──────────────────────────────────────────────────────────

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/notifications', { 
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      });
      
      if (!res.ok) {
        if (res.status === 401) throw new Error('UNAUTHORIZED');
        throw new Error(`HTTP ${res.status}`);
      }
      
      const data = await res.json();
      // Transform to include org/user names from joins
      setNotifications(Array.isArray(data) ? data.map(n => ({
        ...n,
        orgName: n.organization?.name,
        userEmail: n.userProfile?.email
      })) : []);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch';
      setError(message);
      toast.error(message === 'UNAUTHORIZED' ? '🚫 Access denied' : '❌ Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  // ──────────────────────────────────────────────────────────
  // PURE SSE CONNECTION (/api/admin/stream - No Hooks)
  // ──────────────────────────────────────────────────────────

  useEffect(() => {
    // Only connect after auth succeeds
    if (loading && !error) return;

    const sse = new EventSource('/api/admin/stream', { 
      withCredentials: true 
    });

    const handleMessage = (event: MessageEvent) => {
      // Skip heartbeats and SSE comments
      if (event.data.startsWith(':')) return;
      
      try {
        const parsed = JSON.parse(event.data);
        console.log('[Admin SSE] Received:', parsed.event);
        
        // Global events superadmin should see
        switch (parsed.event) {
          case 'notification:new':
          case 'support:ticket:new':
          case 'notification:broadcast':
            setNotifications(prev => [parsed.data, ...prev]);
            toast(`🔔 ${parsed.data.title || parsed.event}`, { duration: 4000 });
            break;
            
          case 'system:alert':
            toast.error(`⚠️ ${parsed.data.message}`, { duration: 6000 });
            break;

          case 'support:reply':
            // Show which org/user got a reply
            toast.success(`💬 Reply sent to ${parsed.data.userEmail}`, { duration: 4000 });
            break;
        }
      } catch (err) {
        console.error('Admin SSE parse error:', err);
      }
    };

    const handleError = (error: Event) => {
      console.warn('SSE connection error:', error);
      sse.close();
      setIsLive(false);
      toast.error('SSE connection lost. Retrying...');
    };

    sse.addEventListener('message', handleMessage);
    sse.addEventListener('error', handleError);
    
    setEventSource(sse);

    // Cleanup
    return () => {
      sse.close();
      setEventSource(null);
    };
  }, [loading, error]);

  // ──────────────────────────────────────────────────────────
  // GLOBAL ACTIONS (Mark Read/Delete)
  // ──────────────────────────────────────────────────────────

  const markOne = async (id: string) => {
    try {
      // Optimistic update
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, status: 'READ' } : n));
      
      const res = await fetch('/api/admin/notifications', { 
        method: 'PATCH', 
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      toast.success('✅ Marked as read', { duration: 3000 });
    } catch (err) {
      // Revert
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, status: 'UNREAD' } : n));
      toast.error('❌ Failed to mark as read');
    }
  };

  const markAll = async () => {
    try {
      // Optimistic
      setNotifications(prev => prev.map(n => ({ ...n, status: 'READ' })));
      
      const res = await fetch('/api/admin/notifications', { 
        method: 'PUT', 
        credentials: 'include' 
      });
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      toast.success('✅ All marked as read', { duration: 3000 });
    } catch (err) {
      fetchNotifications();
      toast.error('❌ Failed to mark all as read');
    }
  };

  const deleteAll = async () => {
    if (!window.confirm('🗑️ Delete ALL admin notifications? This cannot be undone.')) return;

    try {
      const res = await fetch('/api/admin/notifications', { 
        method: 'DELETE',
        credentials: 'include' 
      });
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setNotifications([]);
      toast.success('🗑️ All admin notifications deleted', { duration: 3000 });
    } catch (err) {
      toast.error('❌ Failed to delete notifications');
      fetchNotifications();
    }
  };

  // ──────────────────────────────────────────────────────────
  // RENDER STATES (Loading, Error, Success)
  // ──────────────────────────────────────────────────────────

  // Loading State (Auth + Data)
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400" />
          <p className="text-cyan-400 font-medium">Authorizing superadmin...</p>
        </div>
      </div>
    );
  }

  // Error State (Unauthorized or other errors)
  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-900/80 border border-red-500/30 rounded-xl p-6 max-w-md w-full"
        >
          <div className="flex items-center gap-3 text-red-400 mb-4">
            <HiXMark className="w-6 h-6" />
            <h2 className="text-lg font-bold">Access Denied</h2>
          </div>
          <p className="text-slate-300 text-sm mb-4">{error}</p>
          {error === 'UNAUTHORIZED' ? (
            <p className="text-xs text-amber-400">Redirecting...</p>
          ) : (
            <button 
              onClick={fetchNotifications}
              className="w-full bg-cyan-500 text-black font-medium py-2 rounded-lg hover:bg-cyan-400 transition"
            >
              <HiRefresh className="inline w-4 h-4 mr-2" /> Retry
            </button>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 space-y-6">
      <Toaster position="top-right" />
      
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900/50 border border-cyan-500/20 rounded-xl p-6 shadow-xl"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 flex items-center gap-3">
              <HiGlobe className="text-cyan-400" /> Global Command Center
            </h1>
            <p className="text-sm text-cyan-200/70 mt-1">
              Platform-wide alerts and support ticket notifications
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Superadmin Badge */}
            <span className="text-xs bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2 py-1 rounded-full font-medium animate-pulse">
              SUPER ADMIN
            </span>

            {/* Live Indicator */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className={`w-3 h-3 rounded-full ${isLive ? 'bg-green-500' : 'bg-slate-500'}`}></div>
                {isLive && <div className="absolute inset-0 bg-green-500 rounded-full animate-ping"></div>}
              </div>
              <span className="text-xs text-cyan-200/70">
                {eventSource ? 'LIVE' : 'DISCONNECTED'}
              </span>
            </div>

            <button
              onClick={markAll}
              disabled={notifications.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-lg hover:bg-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <HiCheckCircle className="w-4 h-4" />
              Mark All Read
            </button>
            
            <button
              onClick={deleteAll}
              disabled={notifications.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <HiTrash className="w-4 h-4" />
              Clear
            </button>
          </div>
        </div>
      </motion.div>

      {/* Notifications List */}
      <AnimatePresence>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-900/50 border border-cyan-500/20 rounded-xl overflow-hidden shadow-xl"
        >
          {notifications.length === 0 ? (
            <div className="p-12 text-center text-cyan-200/60">
              <HiBell className="w-12 h-12 mx-auto mb-3 text-cyan-400/30" />
              <p className="text-lg font-medium mb-1">No global notifications yet</p>
              <p className="text-sm">Platform activity will appear here in real-time</p>
            </div>
          ) : (
            <motion.div className="divide-y divide-cyan-500/10">
              {notifications.map((notif, idx) => (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`p-6 hover:bg-slate-900/40 transition-all group ${
                    notif.status === 'UNREAD' ? 'bg-cyan-400/5 border-l-4 border-cyan-400' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {/* Header */}
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-bold text-white group-hover:text-cyan-200 transition">
                          {notif.title}
                        </h3>
                        
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          notif.type === 'ERROR' ? 'bg-red-500/20 text-red-400' :
                          notif.type === 'WARNING' ? 'bg-amber-500/20 text-amber-400' :
                          notif.type === 'SUPPORT' ? 'bg-purple-500/20 text-purple-400' :
                          notif.type === 'BROADCAST' ? 'bg-cyan-500/20 text-cyan-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>
                          {notif.type}
                        </span>

                        {notif.orgName && (
                          <span className="text-xs bg-slate-700/50 text-slate-300 px-2 py-0.5 rounded-full">
                            {notif.orgName}
                          </span>
                        )}

                        {notif.type === 'SUPPORT' && (
                          <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <HiTicket className="w-3 h-3" /> Support
                          </span>
                        )}
                      </div>

                      {/* Message */}
                      <p className="text-slate-300 text-sm mb-2 group-hover:text-slate-200 transition">
                        {notif.message}
                      </p>

                      {/* Metadata */}
                      <div className="flex items-center gap-4 text-xs text-slate-500 group-hover:text-slate-400 transition flex-wrap">
                        <span>{new Date(notif.createdAt).toLocaleString()}</span>
                        {notif.orgId && <><span>•</span><span>Org: {notif.orgId.slice(0, 8)}…</span></>}
                        {notif.userEmail && <><span>•</span><span>User: {notif.userEmail}</span></>}
                      </div>
                    </div>

                    {/* Actions */}
                    {notif.status === 'UNREAD' && (
                      <button
                        onClick={() => markOne(notif.id)}
                        className="shrink-0 px-3 py-1 bg-cyan-500 text-black text-xs font-bold rounded hover:bg-cyan-400 transition opacity-0 group-hover:opacity-100"
                      >
                        Mark Read
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}