// src/app/notifications/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useUser } from '@stackframe/stack';
import { toast,Toaster } from 'react-hot-toast';
import { HiBell, HiCheckCircle, HiTrash, HiXMark, HiArrowPath } from 'react-icons/hi2';
import { motion } from 'framer-motion';

// ──────────────────────────────────────────────────────────────
// TYPES & INTERFACES (Production-Ready)
// ──────────────────────────────────────────────────────────────

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'ERROR' | 'SUPPORT';
  status: 'READ' | 'UNREAD';
  createdAt: string;
  isOrgWide: boolean;
  orgId: string;
}

interface OrgProfile {
  userId: string;
  profileId: string;
  orgId: string;
  role: string;
  email: string;
}

// ──────────────────────────────────────────────────────────────
// ORG PROFILE FETCHER (Consistent Pattern)
// ──────────────────────────────────────────────────────────────

async function getOrgProfile(): Promise<OrgProfile> {
  const res = await fetch('/api/org-profile', {
    credentials: 'include',
    headers: { 'Accept': 'application/json' }
  });
  
  if (!res.ok) {
    throw new Error(`Failed to fetch org profile: HTTP ${res.status}`);
  }
  
  return res.json();
}

// ──────────────────────────────────────────────────────────────
// MAIN COMPONENT (Enterprise Grade)
// ──────────────────────────────────────────────────────────────

export default function UserNotificationsPage() {
  // Stack user for auth guard (redirect if not logged in)
  useUser({ or: 'redirect' });

  // ──────────────────────────────────────────────────────────
  // STATE MANAGEMENT (Single Source of Truth)
  // ──────────────────────────────────────────────────────────

  const [orgProfile, setOrgProfile] = useState<OrgProfile | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(true);

  // ──────────────────────────────────────────────────────────
  // ORG PROFILE LOADING (Pattern from DataSourcesPage)
  // ──────────────────────────────────────────────────────────

  useEffect(() => {
    getOrgProfile()
      .then((profile) => {
        console.log('✅ [NotificationsPage] orgId loaded:', profile.orgId);
        setOrgProfile(profile);
      })
      .catch((err) => {
        console.error('❌ [NotificationsPage] org profile error:', err);
        setError('Failed to load organization profile');
        toast.error('Authentication error');
      });
  }, []);

  // ──────────────────────────────────────────────────────────
  // DATA FETCHING (Dependent on orgId)
  // ──────────────────────────────────────────────────────────

  const fetchNotifications = useCallback(async () => {
    if (!orgProfile?.orgId) return;

    try {
      setLoading(true);
      const res = await fetch('/api/notifications', { 
        credentials: 'include',
        headers: { 
          'Accept': 'application/json',
          'x-org-id': orgProfile.orgId // Explicit header for consistency
        }
      });
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setNotifications(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch';
      setError(message);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [orgProfile?.orgId]);

  // Load notifications once orgId is available
  useEffect(() => {
    if (orgProfile?.orgId) {
      fetchNotifications();
    }
  }, [orgProfile?.orgId, fetchNotifications]);

  // ──────────────────────────────────────────────────────────
  // SSE REAL-TIME UPDATES (QStash + Upstash)
  // ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (!orgProfile?.orgId) return;

    const eventSource = new EventSource('/api/notifications/stream', { 
      withCredentials: true 
    });

    const handleMessage = (event: MessageEvent) => {
      // Skip heartbeats and SSE comments
      if (event.data.startsWith(':')) return;
      
      try {
        const parsed = JSON.parse(event.data);
        
        // Only process events for this org
        if (parsed.data?.orgId && parsed.data.orgId !== orgProfile.orgId) {
          return;
        }

        switch (parsed.event) {
          case 'notification:new':
            setNotifications(prev => [parsed.data, ...prev]);
            toast(`New: ${parsed.data.title}`, {
              icon: '🔔',
              duration: 5000
            });
            break;
            
          case 'notification:read':
            setNotifications(prev => prev.map(n => 
              n.id === parsed.data.id ? { ...n, status: 'READ' } : n
            ));
            break;
            
          case 'notification:readAll':
            setNotifications(prev => prev.map(n => ({ ...n, status: 'READ' })));
            break;

          case 'support:reply':
            // Handle owner replies to user's tickets
            if (parsed.data.userEmail === orgProfile.email) {
              toast.success(`Owner replied to your support ticket`, {
                icon: '💬',
                duration: 5000
              });
              // Refresh to show new notification
              fetchNotifications();
            }
            break;
        }
      } catch (err) {
        console.error('SSE parse error:', err);
      }
    };

    eventSource.addEventListener('message', handleMessage);
    
    eventSource.onerror = () => {
      console.warn('SSE connection error, retrying...');
      eventSource.close();
      setIsLive(false);
      
      // Exponential backoff reconnect
      setTimeout(() => {
        setIsLive(true);
        window.location.reload();
      }, 3000);
    };

    return () => eventSource.close();
  }, [orgProfile?.orgId, orgProfile?.email, fetchNotifications]);

  // ──────────────────────────────────────────────────────────
  // ACTIONS (Optimistic + Transactional)
  // ──────────────────────────────────────────────────────────

  const markOne = async (id: string) => {
    if (!orgProfile?.orgId) return;

    try {
      // Optimistic update
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, status: 'READ' } : n));
      
      const res = await fetch('/api/notifications', { 
        method: 'PATCH', 
        credentials: 'include',
        headers: { 
          'Content-Type': 'application/json',
          'x-org-id': orgProfile.orgId
        },
        body: JSON.stringify({ id })
      });
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
      // Broadcast to other user sessions
      await fetch('/api/webhooks/notify-org', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orgId: orgProfile.orgId,
          event: 'notification:read',
          data: { id }
        })
      });
      
      toast.success('Marked as read', { icon: '✅' });
    } catch (err) {
      // Revert optimistic update
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, status: 'UNREAD' } : n));
      toast.error('Failed to mark as read');
    }
  };

  const markAll = async () => {
    if (!orgProfile?.orgId) return;

    try {
      // Optimistic update
      setNotifications(prev => prev.map(n => ({ ...n, status: 'READ' })));
      
      const res = await fetch('/api/notifications', { 
        method: 'PUT', 
        credentials: 'include',
        headers: { 'x-org-id': orgProfile.orgId }
      });
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
      toast.success('All marked as read', { icon: '✅' });
    } catch (err) {
      // Revert
      fetchNotifications();
      toast.error('Failed to mark all as read');
    }
  };

  const deleteAll = async () => {
    if (!orgProfile?.orgId) return;
    if (!window.confirm('⚠️ Delete all notifications? This cannot be undone.')) return;

    try {
      setLoading(true);
      const res = await fetch('/api/notifications', { 
        method: 'DELETE',
        credentials: 'include',
        headers: { 'x-org-id': orgProfile.orgId }
      });
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
      setNotifications([]);
      toast.success('All notifications deleted', { icon: '🗑️' });
    } catch (err) {
      toast.error('Failed to delete notifications');
      fetchNotifications();
    } finally {
      setLoading(false);
    }
  };

  // ──────────────────────────────────────────────────────────
  // RENDER STATES (Loading, Error, Empty, Data)
  // ──────────────────────────────────────────────────────────

  // Loading State (Initial Mount)
  if (loading && !orgProfile) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400" />
          <p className="text-cyan-400 font-medium">Authenticating...</p>
        </div>
      </div>
    );
  }

  // Loading State (Notifications)
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400" />
          <p className="text-cyan-400 font-medium">Loading notifications...</p>
        </div>
      </div>
    );
  }

  // Error State
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
            <h2 className="text-lg font-bold">Error Loading Notifications</h2>
          </div>
          <p className="text-slate-300 text-sm mb-4">{error}</p>
          <div className="flex gap-3">
            <button 
              onClick={fetchNotifications}
              className="flex-1 bg-cyan-500 text-black font-medium py-2 rounded-lg hover:bg-cyan-400 transition"
            >
              <HiArrowPath className="inline w-4 h-4 mr-2" /> Retry
            </button>
            <button 
              onClick={() => window.location.href = '/'}
              className="flex-1 bg-slate-800 text-white font-medium py-2 rounded-lg hover:bg-slate-700 transition"
            >
              Go Home
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────
  // MAIN RENDER (Success State)
  // ──────────────────────────────────────────────────────────

  const unreadCount = notifications.filter(n => n.status === 'UNREAD').length;

  return (
    <div className="min-h-screen bg-slate-950 p-6 space-y-6">
      {/* Toaster for notifications */}
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: '#0f172a',
            color: '#e2e8f0',
            border: '1px solid rgba(6, 182, 212, 0.3)',
          },
        }}
      />
      
      {/* Header Card */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900/50 border border-cyan-500/20 rounded-xl p-6 shadow-xl"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center gap-3">
              <HiBell className="text-cyan-400" /> Notifications
            </h1>
            <p className="text-sm text-cyan-200/70 mt-1">
              {unreadCount} unread message{unreadCount !== 1 ? 's' : ''}
            </p>
          </div>
          
          {/* Status & Actions */}
          <div className="flex items-center gap-3">
            {/* Live Indicator */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className={`w-3 h-3 rounded-full ${isLive ? 'bg-green-500' : 'bg-slate-500'}`}></div>
                {isLive && (
                  <div className="absolute inset-0 bg-green-500 rounded-full animate-ping"></div>
                )}
              </div>
              <span className="text-xs text-cyan-200/70">
                {isLive ? 'LIVE' : 'DISCONNECTED'}
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
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-slate-900/50 border border-cyan-500/20 rounded-xl overflow-hidden shadow-xl"
      >
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-cyan-200/60">
            <HiBell className="w-12 h-12 mx-auto mb-3 text-cyan-400/30" />
            <p className="text-lg font-medium mb-1">No notifications yet</p>
            <p className="text-sm">You'll see updates here as they arrive</p>
          </div>
        ) : (
          <div className="divide-y divide-cyan-500/10">
            {notifications.map((notif) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className={`p-6 hover:bg-slate-900/40 transition-all group ${
                  notif.status === 'UNREAD' 
                    ? 'bg-cyan-400/5 border-l-4 border-cyan-400' 
                    : ''
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-white group-hover:text-cyan-300 transition">
                        {notif.title}
                      </h3>
                      
                      {notif.isOrgWide && (
                        <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full font-medium">
                          Organization
                        </span>
                      )}

                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        notif.type === 'ERROR' ? 'bg-red-500/20 text-red-400' :
                        notif.type === 'WARNING' ? 'bg-amber-500/20 text-amber-400' :
                        notif.type === 'SUPPORT' ? 'bg-purple-500/20 text-purple-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {notif.type}
                      </span>
                    </div>

                    {/* Message */}
                    <p className="text-slate-300 text-sm mb-2 group-hover:text-slate-200 transition">
                      {notif.message}
                    </p>

                    {/* Metadata */}
                    <div className="flex items-center gap-4 text-xs text-slate-500 group-hover:text-slate-400 transition">
                      <span>{new Date(notif.createdAt).toLocaleString()}</span>
                      <span>•</span>
                      <span>Org: {notif.orgId.slice(0, 8)}...</span>
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
          </div>
        )}
      </motion.div>
    </div>
  );
}