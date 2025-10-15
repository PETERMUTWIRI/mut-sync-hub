'use client';

import React, { useEffect, useState } from 'react';
import { useUser } from '@stackframe/stack';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import { Tooltip } from 'react-tooltip';
import { getSecuritySettings, enable2FA, disable2FA, getSessions, revokeSession, getApiKeys, createApiKey, revokeApiKey } from '@/lib/user';

// Dynamic imports
const Card = dynamic(() => import('@/components/ui/card').then((mod) => mod.Card), { ssr: false });
const CardHeader = dynamic(() => import('@/components/ui/card').then((mod) => mod.CardHeader), { ssr: false });
const CardTitle = dynamic(() => import('@/components/ui/card').then((mod) => mod.CardTitle), { ssr: false });
const CardContent = dynamic(() => import('@/components/ui/card').then((mod) => mod.CardContent), { ssr: false });
const Button = dynamic(() => import('@/components/ui/button').then((mod) => mod.Button), { ssr: false });
const Input = dynamic(() => import('@/components/ui/input').then((mod) => mod.Input), { ssr: false });
const Switch = dynamic(() => import('@/components/ui/Switch'), { ssr: false });
const Table = dynamic(() => import('@/components/ui/table').then((mod) => mod.Table), { ssr: false });
const TableBody = dynamic(() => import('@/components/ui/table').then((mod) => mod.TableBody), { ssr: false });
const TableCell = dynamic(() => import('@/components/ui/table').then((mod) => mod.TableCell), { ssr: false });
const TableHead = dynamic(() => import('@/components/ui/table').then((mod) => mod.TableHead), { ssr: false });
const TableHeader = dynamic(() => import('@/components/ui/table').then((mod) => mod.TableHeader), { ssr: false });
const TableRow = dynamic(() => import('@/components/ui/table').then((mod) => mod.TableRow), { ssr: false });
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
            <p className="text-red-400 font-inter text-lg">Failed to load security settings</p>
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

const Security: React.FC = () => {
  const user = useUser({ or: 'redirect' });
  const router = useRouter();
  const [settings, setSettings] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [settingsRes, sessionsRes, apiKeysRes] = await Promise.all([
          getSecuritySettings(),
          getSessions(),
          getApiKeys(),
        ]);
        setSettings(settingsRes.data);
        setSessions(sessionsRes.data);
        setApiKeys(apiKeysRes.data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch security data:', err);
        setError('Failed to fetch security data');
        toast.error('Failed to fetch security data');
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handle2FAChange = async (enabled: boolean) => {
    try {
      const action = enabled ? enable2FA : disable2FA;
      await action();
      setSettings({ ...settings, '2fa_enabled': enabled });
      toast.success(`2FA ${enabled ? 'enabled' : 'disabled'} successfully`);
    } catch (err) {
      console.error('Failed to update 2FA:', err);
      toast.error(`Failed to ${enabled ? 'enable' : 'disable'} 2FA`);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
    setPasswordError('');
    setPasswordSuccess('');
  };

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError('All password fields are required');
      toast.error('All password fields are required');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New password and confirmation do not match');
      toast.error('New password and confirmation do not match');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters');
      toast.error('New password must be at least 8 characters');
      return;
    }
    try {
      await fetch('/api/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      setPasswordSuccess('Password changed successfully');
      toast.success('Password changed successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPasswordSuccess(''), 3000);
    } catch (err) {
      console.error('Failed to change password:', err);
      setPasswordError('Failed to change password');
      toast.error('Failed to change password');
      setTimeout(() => setPasswordError(''), 3000);
    }
  };

  const handleLoginAlertsChange = async (enabled: boolean) => {
    try {
      await fetch('/api/login-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login_alerts: enabled }),
      });
      setSettings({ ...settings, login_alerts: enabled });
      toast.success(`Login alerts ${enabled ? 'enabled' : 'disabled'} successfully`);
    } catch (err) {
      console.error('Failed to update login alerts:', err);
      toast.error(`Failed to ${enabled ? 'enable' : 'disable'} login alerts`);
    }
  };

  const handleRevokeSession = async (id: string) => {
    try {
      await revokeSession(id);
      setSessions(sessions.filter((s) => s.id !== id));
      toast.success('Session revoked successfully');
    } catch (err) {
      console.error('Failed to revoke session:', err);
      toast.error('Failed to revoke session');
    }
  };

  const handleCreateApiKey = async () => {
    try {
      const response = await createApiKey('New Key');
      setApiKeys([...apiKeys, response.data]);
      toast.success('API key created successfully');
    } catch (err) {
      console.error('Failed to create API key:', err);
      toast.error('Failed to create API key');
    }
  };

  const handleRevokeApiKey = async (id: string) => {
    try {
      await revokeApiKey(id);
      setApiKeys(apiKeys.filter((k) => k.id !== id));
      toast.success('API key revoked successfully');
    } catch (err) {
      console.error('Failed to revoke API key:', err);
      toast.error('Failed to revoke API key');
    }
  };

  const handleExportLogs = async () => {
    try {
      const response = await fetch('/api/export-logs', { method: 'GET' });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'security_logs.csv';
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Security logs exported successfully');
    } catch (err) {
      console.error('Failed to export logs:', err);
      toast.error('Failed to export logs');
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto py-12 bg-[#1E2A44] text-white font-inter w-full"
      >
        <header className="sticky top-0 z-20 bg-[#1E2A44]/95 backdrop-blur-md border-b border-[#2E7D7D]/30 py-4 px-6">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="h-8 bg-[#2E7D7D]/20 rounded w-1/4 animate-pulse"></div>
          </div>
        </header>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-[#2E7D7D]/10 rounded-lg p-4 animate-pulse">
              <div className="h-6 bg-[#2E7D7D]/20 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-[#2E7D7D]/20 rounded w-3/4"></div>
            </div>
          ))}
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
        className="max-w-7xl mx-auto py-12 bg-[#1E2A44] text-white font-inter w-full"
      >
        {/* Sticky Header */}
        <header className="sticky top-0 z-20 bg-[#1E2A44]/95 backdrop-blur-md border-b border-[#2E7D7D]/30 py-4 px-6">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold">Security Settings</h1>
            <div className="flex gap-4">
              <Input
                type="text"
                placeholder="Search security settings..."
                className="bg-[#2E7D7D]/20 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D7D]"
                aria-label="Search security settings"
              />
              <Button
                className="bg-[#2E7D7D] text-white hover:bg-[#2E7D7D]/80"
                aria-label="Search security settings"
                data-tooltip-id="search-security"
                data-tooltip-content="Search security settings"
              >
                Search
              </Button>
              <Tooltip id="search-security" />
            </div>
          </div>
        </header>

        <h1 className="text-4xl font-extrabold text-[#2E7D7D] tracking-tight drop-shadow-lg mb-8 text-left mt-8">
          Security Settings
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* 2FA Card */}
          <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
            <Card className="bg-[#2E7D7D]/10 border-0 shadow-lg rounded-xl w-full">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-[#2E7D7D]">
                  Two-Factor Authentication (2FA)
                </CardTitle>
                <p className="text-sm text-gray-300 mt-2">
                  Add an extra layer of protection to your account. Toggle to enable or disable 2FA.
                </p>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <span className="text-gray-200">
                  Status: {settings && settings['2fa_enabled'] ? 'Enabled' : 'Disabled'}
                </span>
                <Switch
                  checked={!!settings && !!settings['2fa_enabled']}
                  onCheckedChange={handle2FAChange}
                  disabled={!settings}
                  aria-label="Toggle 2FA"
                  data-tooltip-id="toggle-2fa"
                  data-tooltip-content={settings && settings['2fa_enabled'] ? 'Disable 2FA' : 'Enable 2FA'}
                />
                <Tooltip id="toggle-2fa" />
              </CardContent>
            </Card>
          </motion.div>

          {/* Password Change Card */}
          <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
            <Card className="bg-[#2E7D7D]/10 border-0 shadow-lg rounded-xl w-full">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-[#2E7D7D]">
                  Change Password
                </CardTitle>
                <p className="text-sm text-gray-300 mt-2">
                  Update your password regularly to keep your account secure.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {passwordSuccess && (
                  <div className="text-green-400 text-sm mb-2">{passwordSuccess}</div>
                )}
                {passwordError && (
                  <div className="text-red-400 text-sm mb-2">{passwordError}</div>
                )}
                <div>
                  <Input
                    type="password"
                    name="currentPassword"
                    placeholder="Current Password"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    className="bg-[#2E7D7D]/20 border-[#2E7D7D]/30 text-white rounded-lg w-full p-2 focus:ring-2 focus:ring-[#2E7D7D]"
                    aria-label="Current Password"
                  />
                </div>
                <div>
                  <Input
                    type="password"
                    name="newPassword"
                    placeholder="New Password"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    className="bg-[#2E7D7D]/20 border-[#2E7D7D]/30 text-white rounded-lg w-full p-2 focus:ring-2 focus:ring-[#2E7D7D]"
                    aria-label="New Password"
                  />
                </div>
                <div>
                  <Input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm New Password"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    className="bg-[#2E7D7D]/20 border-[#2E7D7D]/30 text-white rounded-lg w-full p-2 focus:ring-2 focus:ring-[#2E7D7D]"
                    aria-label="Confirm New Password"
                  />
                </div>
                <Button
                  className="w-full bg-[#2E7D7D] text-white hover:bg-[#2E7D7D]/80"
                  onClick={handleChangePassword}
                  aria-label="Change Password"
                  data-tooltip-id="change-password"
                  data-tooltip-content="Change Password"
                >
                  Change Password
                </Button>
                <Tooltip id="change-password" />
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Device Management Card */}
          <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
            <Card className="bg-[#2E7D7D]/10 border-0 shadow-lg rounded-xl w-full">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-[#2E7D7D]">
                  Device Management
                </CardTitle>
                <p className="text-sm text-gray-300 mt-2">
                  View and manage devices that have accessed your account.
                </p>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-[#2E7D7D]">Device</TableHead>
                      <TableHead className="text-[#2E7D7D]">Last Seen</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessions.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell className="text-gray-200">{session.device}</TableCell>
                        <TableCell className="text-gray-200">
                          {new Date(session.lastSeen).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRevokeSession(session.id)}
                            aria-label={`Revoke session for ${session.device}`}
                            data-tooltip-id={`revoke-session-${session.id}`}
                            data-tooltip-content={`Revoke session for ${session.device}`}
                          >
                            Revoke
                          </Button>
                          <Tooltip id={`revoke-session-${session.id}`} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>

          {/* Login Alerts Card */}
          <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
            <Card className="bg-[#2E7D7D]/10 border-0 shadow-lg rounded-xl w-full">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-[#2E7D7D]">
                  Login Alerts
                </CardTitle>
                <p className="text-sm text-gray-300 mt-2">
                  Get notified when your account is accessed from a new device or location.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-200">
                    Enable login alerts
                  </span>
                  <Switch
                    checked={settings && settings['login_alerts']}
                    onCheckedChange={handleLoginAlertsChange}
                    disabled={!settings}
                    aria-label="Toggle login alerts"
                    data-tooltip-id="toggle-login-alerts"
                    data-tooltip-content={settings && settings['login_alerts'] ? 'Disable login alerts' : 'Enable login alerts'}
                  />
                  <Tooltip id="toggle-login-alerts" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* API Keys Card */}
          <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
            <Card className="bg-[#2E7D7D]/10 border-0 shadow-lg rounded-xl w-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-semibold text-[#2E7D7D]">
                  API Keys
                </CardTitle>
                <Button
                  onClick={handleCreateApiKey}
                  className="bg-[#2E7D7D] text-white hover:bg-[#2E7D7D]/80"
                  aria-label="Generate new API key"
                  data-tooltip-id="generate-api-key"
                  data-tooltip-content="Generate new API key"
                >
                  Generate New Key
                </Button>
                <Tooltip id="generate-api-key" />
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-[#2E7D7D]">Key</TableHead>
                      <TableHead className="text-[#2E7D7D]">Created</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {apiKeys.map((key) => (
                      <TableRow key={key.id}>
                        <TableCell className="text-gray-200">{key.value}</TableCell>
                        <TableCell className="text-gray-200">
                          {new Date(key.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRevokeApiKey(key.id)}
                            aria-label={`Revoke API key ${key.value}`}
                            data-tooltip-id={`revoke-api-key-${key.id}`}
                            data-tooltip-content={`Revoke API key ${key.value}`}
                          >
                            Revoke
                          </Button>
                          <Tooltip id={`revoke-api-key-${key.id}`} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>

          {/* Export Logs Card */}
          <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
            <Card className="bg-[#2E7D7D]/10 border-0 shadow-lg rounded-xl w-full">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-[#2E7D7D]">
                  Export Security Logs
                </CardTitle>
                <p className="text-sm text-gray-300 mt-2">
                  Download a record of recent security events for auditing.
                </p>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full bg-[#2E7D7D] text-white hover:bg-[#2E7D7D]/80"
                  onClick={handleExportLogs}
                  aria-label="Export security logs"
                  data-tooltip-id="export-logs"
                  data-tooltip-content="Export security logs"
                >
                  Export Logs
                </Button>
                <Tooltip id="export-logs" />
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <Toaster position="top-right" />
      </motion.div>
    </ErrorBoundary>
  );
};

export default Security;