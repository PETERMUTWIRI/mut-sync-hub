'use client';

import React, { useEffect, useState } from 'react';
import { useUser } from '@stackframe/stack';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import { Tooltip } from 'react-tooltip';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '@/lib/user';

// Dynamic imports
const Card = dynamic(() => import('@/components/ui/card').then((mod) => mod.Card), { ssr: false });
const CardHeader = dynamic(() => import('@/components/ui/card').then((mod) => mod.CardHeader), { ssr: false });
const CardTitle = dynamic(() => import('@/components/ui/card').then((mod) => mod.CardTitle), { ssr: false });
const CardContent = dynamic(() => import('@/components/ui/card').then((mod) => mod.CardContent), { ssr: false });
const Button = dynamic(() => import('@/components/ui/button').then((mod) => mod.Button), { ssr: false });
const Spinner = dynamic(() => import('@/components/ui/Spinner'), { ssr: false });

// Error Boundary
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="min-h-screen bg-[#1E2A44] flex items-center justify-center text-white"
        >
          <div className="text-center bg-[#2E7D7D]/10 rounded-xl p-8 border border-[#2E7D7D]/30">
            <p className="text-red-400 font-inter text-lg">Failed to load notifications</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 bg-[#2E7D7D] text-white px-6 py-2 rounded-lg hover:bg-[#2E7D7D]/80"
            >
              Retry
            </button>
          </div>
        </motion.div>
      );
    }
    return this.props.children;
  }
}

const Notifications: React.FC = () => {
  const user = useUser({ or: 'redirect' });
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await getNotifications();
      setNotifications(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setError('Failed to fetch notifications');
      toast.error('Failed to fetch notifications');
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)));
      toast.success('Notification marked as read');
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
      toast.error('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(notifications.map((n) => ({ ...n, read: true })));
      toast.success('All notifications marked as read');
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
      toast.error('Failed to mark all notifications as read');
    }
  };

  const handleDeleteAll = async () => {
    try {
      if (window.confirm('Are you sure you want to delete all notifications? This cannot be undone.')) {
        // await deleteAllNotifications(); // Uncomment when backend is ready
        setNotifications([]);
        toast.success('All notifications deleted');
      }
    } catch (err) {
      console.error('Failed to delete all notifications:', err);
      toast.error('Failed to delete all notifications');
    }
  };

  const handleRefresh = () => {
    fetchNotifications();
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-[#1E2A44] flex items-center justify-center w-full"
      >
        <div className="text-center">
          <Spinner />
          <p className="mt-4 text-gray-300 font-inter text-lg">Loading Notifications...</p>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-[#1E2A44] flex items-center justify-center w-full"
      >
        <div className="text-center bg-[#2E7D7D]/10 rounded-xl p-8 border border-[#2E7D7D]/30">
          <p className="text-red-400 font-inter text-lg">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 bg-[#2E7D7D] text-white px-6 py-2 rounded-lg hover:bg-[#2E7D7D]/80"
          >
            Return to Home
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <ErrorBoundary>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto py-10 px-6 bg-[#1E2A44] text-white font-inter w-full"
      >
        {/* Sticky Header */}
        <header className="sticky top-0 z-20 bg-[#1E2A44]/95 backdrop-blur-md border-b border-[#2E7D7D]/30 py-4 px-6">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold">Notifications</h1>
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Search notifications..."
                className="bg-[#2E7D7D]/20 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D7D]"
                aria-label="Search notifications"
              />
              <Button
                className="bg-[#2E7D7D] text-white hover:bg-[#2E7D7D]/80"
                aria-label="Search notifications"
                data-tooltip-id="search-notifications"
                data-tooltip-content="Search notifications"
              >
                Search
              </Button>
              <Tooltip id="search-notifications" />
            </div>
          </div>
        </header>

        <h1 className="text-3xl font-bold mb-6 mt-8">Notifications</h1>

        {/* Notification Preferences */}
        <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
          <Card className="mb-8 bg-[#2E7D7D]/10 border-0 shadow-lg rounded-xl">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-[#2E7D7D]">Notification Preferences</CardTitle>
              <p className="text-sm text-gray-400 mt-2">
                Choose which notifications you want to receive and how you want to receive them.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <label className="text-[#2E7D7D] font-medium">Product Updates</label>
                  <select
                    className="bg-[#2E7D7D]/20 text-white rounded-lg p-2 w-full border border-[#2E7D7D]/30 focus:ring-2 focus:ring-[#2E7D7D]"
                    aria-label="Product Updates notification preference"
                  >
                    <option>Email</option>
                    <option>In-App</option>
                    <option>SMS</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[#2E7D7D] font-medium">Billing Alerts</label>
                  <select
                    className="bg-[#2E7D7D]/20 text-white rounded-lg p-2 w-full border border-[#2E7D7D]/30 focus:ring-2 focus:ring-[#2E7D7D]"
                    aria-label="Billing Alerts notification preference"
                  >
                    <option>Email</option>
                    <option>In-App</option>
                    <option>SMS</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[#2E7D7D] font-medium">Support Messages</label>
                  <select
                    className="bg-[#2E7D7D]/20 text-white rounded-lg p-2 w-full border border-[#2E7D7D]/30 focus:ring-2 focus:ring-[#2E7D7D]"
                    aria-label="Support Messages notification preference"
                  >
                    <option>Email</option>
                    <option>In-App</option>
                    <option>SMS</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* All Notifications */}
        <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
          <Card className="bg-[#2E7D7D]/10 border-0 shadow-lg rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <CardTitle className="text-xl font-semibold text-[#2E7D7D]">All Notifications</CardTitle>
              <div className="flex gap-2">
                <Button
                  className="bg-[#2E7D7D] text-white hover:bg-[#2E7D7D]/80 transition-colors"
                  onClick={handleMarkAllAsRead}
                  aria-label="Mark all notifications as read"
                  data-tooltip-id="mark-all-read"
                  data-tooltip-content="Mark all notifications as read"
                >
                  Mark all as read
                </Button>
                <Button
                  className="bg-[#2E7D7D] text-white hover:bg-[#2E7D7D]/80 transition-colors"
                  onClick={handleDeleteAll}
                  aria-label="Delete all notifications"
                  data-tooltip-id="delete-all"
                  data-tooltip-content="Delete all notifications"
                >
                  Delete all
                </Button>
                <Button
                  className="bg-[#2E7D7D] text-white hover:bg-[#2E7D7D]/80 transition-colors"
                  onClick={handleRefresh}
                  disabled={loading}
                  aria-label="Refresh notifications"
                  data-tooltip-id="refresh-notifications"
                  data-tooltip-content="Refresh notifications"
                >
                  {loading ? 'Refreshing...' : 'Refresh'}
                </Button>
                <Tooltip id="mark-all-read" />
                <Tooltip id="delete-all" />
                <Tooltip id="refresh-notifications" />
              </div>
            </CardHeader>
            <CardContent>
              {notifications.length === 0 ? (
                <p className="text-gray-400">No notifications available.</p>
              ) : (
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      className={`flex items-start p-4 rounded-lg ${notification.read ? 'bg-[#2E7D7D]/5' : 'bg-[#2E7D7D]/10'}`}
                      whileHover={{ scale: 1.01 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-white">{notification.title}</p>
                        <p className="text-gray-300">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-[#2E7D7D] hover:text-white"
                          onClick={() => handleMarkAsRead(notification.id)}
                          aria-label={`Mark notification "${notification.title}" as read`}
                          data-tooltip-id={`mark-read-${notification.id}`}
                          data-tooltip-content="Mark as read"
                        >
                          Mark as read
                        </Button>
                      )}
                      <Tooltip id={`mark-read-${notification.id}`} />
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Integrations */}
        <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
          <Card className="mt-8 bg-[#2E7D7D]/10 border-0 shadow-lg rounded-xl">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-[#2E7D7D]">Integrations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 mb-2">Forward notifications to your favorite apps:</p>
              <div className="flex gap-4">
                <Button
                  className="bg-[#2E7D7D] text-white hover:bg-[#2E7D7D]/80 transition-colors"
                  size="sm"
                  onClick={() => toast('Slack integration coming soon!')}
                  aria-label="Connect Slack"
                  data-tooltip-id="connect-slack"
                  data-tooltip-content="Connect Slack"
                >
                  Connect Slack
                </Button>
                <Button
                  className="bg-[#2E7D7D] text-white hover:bg-[#2E7D7D]/80 transition-colors"
                  size="sm"
                  onClick={() => toast('Teams integration coming soon!')}
                  aria-label="Connect Teams"
                  data-tooltip-id="connect-teams"
                  data-tooltip-content="Connect Teams"
                >
                  Connect Teams
                </Button>
                <Button
                  className="bg-[#2E7D7D] text-white hover:bg-[#2E7D7D]/80 transition-colors"
                  size="sm"
                  onClick={() => toast('Email integration coming soon!')}
                  aria-label="Connect Email"
                  data-tooltip-id="connect-email"
                  data-tooltip-content="Connect Email"
                >
                  Connect Email
                </Button>
                <Tooltip id="connect-slack" />
                <Tooltip id="connect-teams" />
                <Tooltip id="connect-email" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* About Notifications */}
        <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
          <Card className="mt-8 bg-[#2E7D7D]/10 border-0 shadow-lg rounded-xl">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-[#2E7D7D]">About Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400">
                Notifications keep you updated on important events, product changes, billing alerts, and support messages. You can customize your preferences and delivery channels above. All notifications are stored here for your reference.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <Toaster position="top-right" />
      </motion.div>
    </ErrorBoundary>
  );
};

export default Notifications;