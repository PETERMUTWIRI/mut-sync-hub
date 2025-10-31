'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useUser } from '@stackframe/stack';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import { notifyHighRisk } from '@/app/actions/security-notify';
import { createApiKey, revokeApiKey } from '@/app/actions/api-keys';
import { createSupportTicket, agentChat } from '@/app/actions/support';
import dynamic from 'next/dynamic';
// ----- dynamic UI -----
const Card = dynamic(() => import('@/components/ui/card').then(m => m.Card), { ssr: false });
const CardHeader = dynamic(() => import('@/components/ui/card').then(m => m.CardHeader), { ssr: false });
const CardTitle = dynamic(() => import('@/components/ui/card').then(m => m.CardTitle), { ssr: false });
const CardContent = dynamic(() => import('@/components/ui/card').then(m => m.CardContent), { ssr: false });
const Button = dynamic(() => import('@/components/ui/button').then(m => m.Button), { ssr: false });
const Input = dynamic(() => import('@/components/ui/input').then(m => m.Input), { ssr: false });
const Switch = dynamic(() => import('@/components/ui/Switch'), { ssr: false });
const Table = dynamic(() => import('@/components/ui/table').then(m => m.Table), { ssr: false });
const TableBody = dynamic(() => import('@/components/ui/table').then(m => m.TableBody), { ssr: false });
const TableCell = dynamic(() => import('@/components/ui/table').then(m => m.TableCell), { ssr: false });
const TableHead = dynamic(() => import('@/components/ui/table').then(m => m.TableHead), { ssr: false });
const TableHeader = dynamic(() => import('@/components/ui/table').then(m => m.TableHeader), { ssr: false });
const TableRow = dynamic(() => import('@/components/ui/table').then(m => m.TableRow), { ssr: false });
const Spinner = dynamic(() => import('@/components/ui/Spinner'), { ssr: false });

/* ---------- types ---------- */
type SecurityEvent = {
  id: string;
  action: string;
  ip: string;
  userAgent: string;
  createdAt: string;
  risk: 'low' | 'medium' | 'high';
  city?: string;
  country?: string;
  lat?: number;
  lng?: number;
};

type Session = {
  id: string;
  device: string;
  os: string;
  browser: string;
  ip: string;
  lastSeen: string;
  current: boolean;
};

type ApiKey = {
  id: string;
  name: string;
  keyPreview: string;
  scopes: string[];
  createdAt: string;
  lastUsed?: string;
};

/* ---------- page ---------- */
export default function SecurityPage() {
  const user = useUser({ or: 'redirect' });
  const router = useRouter();
  const orgId = (user as any)?.orgId;

  /* ----- live data ----- */
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [riskScore, setRiskScore] = useState<number>(0);
  const mapContainer = useRef<HTMLDivElement>(null);
  const geoEvents = React.useMemo(() => events.filter((ev) => ev.lat != null && ev.lng != null), [events]);

  /* ----- local state ----- */
  const [loading, setLoading] = useState(true);
  const [lockdown, setLockdown] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [selectedScopes, setSelectedScopes] = useState<string[]>(['read']);
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'pdf'>('csv');

  const SCOPES = ['read', 'write', 'admin', 'billing', 'support'];

  /* ---------- data fetching ---------- */
  useEffect(() => {
    (async () => {
      try {
        const [ev, sess, keys] = await Promise.all([
          fetch('/api/security/events').then((r) => r.json()),
          fetch('/api/security/sessions').then((r) => r.json()),
          fetch('/api/security/api-keys').then((r) => r.json()),
        ]);
        setEvents(ev);
        setSessions(sess);
        setApiKeys(keys);
        const highs = ev.filter((e: SecurityEvent) => e.risk === 'high').length;
        setRiskScore(Math.min(100, highs * 20));
      } catch (err) {
        toast.error('Failed to load security data');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ---------- live events poll ---------- */
  useEffect(() => {
    const id = setInterval(async () => {
      const latest = await fetch('/api/security/events?lastId=' + events[0]?.id).then((r) => r.json());
      if (latest.length) {
        setEvents((prev) => {
          const seen = new Set(prev.map((e: SecurityEvent) => e.id));
          const filtered = latest.filter((e: SecurityEvent) => !seen.has(e.id));
          return [...filtered, ...prev];
        });

        /* secure, throttled notification */
        latest
          .filter((e: SecurityEvent) => e.risk === 'high')
          .forEach((e: SecurityEvent) => {
            if (orgId) notifyHighRisk(orgId, e.ip, e.action); // 1/min/IP
          });
      }
    }, 5000);
    return () => clearInterval(id);
  }, [events, orgId]);

  /* ---------- Login Geography – Globe.GL ---------- */
  useEffect(() => {
    if (!mapContainer.current || geoEvents.length === 0) return;
    if (!(window as any).Globe) {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/globe.gl@2.43.0/dist/globe.gl.min.js';
      document.head.appendChild(s);
    }
    const start = () => {
      if (!(window as any).Globe) { setTimeout(start, 300); return; }
      const container = mapContainer.current!;
      container.innerHTML = '';
      const globe = (window as any).Globe()(container)
        .globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
        .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
        .width(container.offsetWidth)
        .height(256);
      const data = geoEvents.map((ev) => ({ lat: ev.lat, lng: ev.lng, size: 0.08, color: ev.risk === 'high' ? 'red' : ev.risk === 'medium' ? 'orange' : 'lime', ip: ev.ip }));
      globe.pointsData(data).pointAltitude('size').pointColor('color').pointLabel('ip').controls().autoRotate = true;
    };
    start();
  }, [geoEvents]);

  /* ---------- actions ---------- */
  const handleCreateApiKey = async () => {
    if (!newKeyName.trim()) return toast.error('Name required');
    try {
      await createApiKey(orgId!, newKeyName, selectedScopes);
      toast.success('Key created');
      setNewKeyName('');
      const keys = await fetch('/api/security/api-keys').then((r) => r.json());
      setApiKeys(keys);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleRevokeApiKey = async (id: string) => {
    await revokeApiKey(orgId!, id);
    toast.success('Key revoked');
    const keys = await fetch('/api/security/api-keys').then((r) => r.json());
    setApiKeys(keys);
  };

  const handleEmergencyLockdown = async () => {
    const ok = confirm('🔒 Emergency lockdown will revoke ALL sessions and freeze the account. Proceed?');
    if (!ok) return;
    setLockdown(true);
    toast.error('Account locked – contact support');
    router.push('/login');
  };

  const handleExportLogs = async () => {
    const logs = await fetch('/api/security/events?format=' + exportFormat).then((r) => r.blob());
    const url = URL.createObjectURL(logs);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security_logs.${exportFormat}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Logs exported');
  };

    /* ---------- fake stubs (wire to real data later) ---------- */
  const usagePercent = 72;
  const monthSpend = 128_500;
  const sparkPoints = '0,40 20,25 40,30 60,15 80,20 100,10';
  const avgQuery = 123;
  const scheduleHealth = Array(20).fill(true);
  const unread = 3;
  const anomalies = 7;
  const confidence = 91;
  const insight = 'Your nightly jobs run 30 % faster on weekdays—consider scaling down on weekends.';

  /* ---------- safety guards ---------- */
  const safeEvents = Array.isArray(events) ? events : [];
  const safeSessions = Array.isArray(sessions) ? sessions : [];
  const safeApiKeys = Array.isArray(apiKeys) ? apiKeys : [];

  if (loading) return <Spinner />;

  return (
    <>
      <Toaster position="top-right" />
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
          <h1 className="text-2xl font-bold">Security Command Center</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-300">Risk Score</span>
              <span
                className={`px-3 py-1 rounded text-xs font-medium ${
                  riskScore > 70
                    ? 'bg-red-500/20 text-red-300'
                    : riskScore > 40
                    ? 'bg-yellow-500/20 text-yellow-300'
                    : 'bg-green-500/20 text-green-300'
                }`}
              >
                {riskScore}/100
              </span>
            </div>
            <Button
              onClick={handleEmergencyLockdown}
              className="bg-red-600 text-white hover:bg-red-500"
            >
              Emergency Lockdown
            </Button>
          </div>
        </motion.header>

        {/* -------------- HIGH-RISK BANNER -------------- */}
        {riskScore > 70 && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mx-6 mt-6 bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-center justify-between backdrop-blur-md"
          >
            <div className="flex items-center gap-3">
              <span className="text-red-400 text-xl">🚨</span>
              <div>
                <p className="text-red-300 font-semibold">High-risk activity detected</p>
                <p className="text-red-400 text-sm">
                  Review recent events and consider enabling stricter policies.
                </p>
              </div>
            </div>
            <Button
              onClick={() => window.scrollTo({ top: 700, behavior: 'smooth' })}
              className="bg-red-600 text-white hover:bg-red-500"
            >
              Review Events
            </Button>
          </motion.div>
        )}

        {/* -------------- MAIN GRID -------------- */}
        <main className="p-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 1️⃣  LEFT – EVENTS & GLOBE  */}
          <div className="lg:col-span-2 space-y-6">
            {/* Live Events */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md"
            >
              <h2 className="text-xl font-semibold text-cyan-400 mb-4">Live Security Events</h2>
              <div className="max-h-[400px] overflow-y-auto pr-2 space-y-3">
                {safeEvents.length === 0 ? (
                  <p className="text-gray-400">No events yet.</p>
                ) : (
                  safeEvents.map((ev) => (
                    <div
                      key={ev.id}
                      className="flex items-start gap-3 py-2 border-b border-white/10 last:border-0"
                    >
                      <span
                        className={`mt-1 text-xs px-2 py-0.5 rounded ${
                          ev.risk === 'high'
                            ? 'bg-red-500/20 text-red-300'
                            : ev.risk === 'medium'
                            ? 'bg-yellow-500/20 text-yellow-300'
                            : 'bg-green-500/20 text-green-300'
                        }`}
                      >
                        {ev.risk}
                      </span>
                      <div className="flex-1">
                        <p className="text-white text-sm">{ev.action}</p>
                        <p className="text-gray-400 text-xs">
                          {ev.ip} • {new Date(ev.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>

            {/* Login Geography */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md"
            >
              <h2 className="text-xl font-semibold text-cyan-400 mb-4">Login Geography</h2>
              <div
                ref={mapContainer}
                className="w-full h-64 rounded-lg overflow-hidden bg-black/20"
              />
            </motion.div>
          </div>

          {/* 2️⃣  RIGHT – QUICK ACTIONS & API KEYS */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md"
            >
              <h2 className="text-xl font-semibold text-cyan-400 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Button
                  onClick={() =>
                    navigator.clipboard.writeText(
                      window.location.origin + '/security/qr-setup'
                    )
                  }
                  className="w-full bg-cyan-500 text-black hover:bg-cyan-400"
                >
                  Copy 2FA Setup Link
                </Button>
                <Button
                  onClick={handleExportLogs}
                  className="w-full bg-gray-700 text-white hover:bg-gray-600"
                >
                  Export Logs
                </Button>
                <Button
                  onClick={() =>
                    agentChat(
                      'Check if my email has been in a breach',
                      user.primaryEmail ?? undefined
                    ).then((r) => toast(r.content))
                  }
                  className="w-full bg-purple-600 text-white hover:bg-purple-500"
                >
                  Dark-Web Check
                </Button>
              </div>
            </motion.div>

            {/* API Keys */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md"
            >
              <h2 className="text-xl font-semibold text-cyan-400 mb-4">API Keys</h2>
              <div className="space-y-3">
                <Input
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="Key name"
                  className="bg-white/5 border border-white/10 text-white"
                />
                <div className="flex flex-wrap gap-2">
                  {SCOPES.map((sc) => (
                    <button
                      key={sc}
                      onClick={() =>
                        setSelectedScopes((prev) =>
                          prev.includes(sc)
                            ? prev.filter((p) => p !== sc)
                            : [...prev, sc]
                        )
                      }
                      className={`px-3 py-1 rounded text-xs font-medium transition ${
                        selectedScopes.includes(sc)
                          ? 'bg-cyan-400 text-black'
                          : 'bg-white/10 text-gray-300 hover:bg-white/20'
                      }`}
                    >
                      {sc}
                    </button>
                  ))}
                </div>
                <Button
                  onClick={handleCreateApiKey}
                  className="w-full bg-cyan-500 text-black hover:bg-cyan-400"
                >
                  Create Key
                </Button>
              </div>

              {safeApiKeys.length > 0 && (
                <div className="mt-4 space-y-2 max-h-48 overflow-y-auto pr-2">
                  {safeApiKeys.map((k) => (
                    <div
                      key={k.id}
                      className="flex items-center justify-between p-2 rounded bg-white/5"
                    >
                      <div>
                        <p className="text-sm text-white">{k.name}</p>
                        <p className="text-xs text-gray-400">{k.keyPreview}</p>
                      </div>
                      <Button
                        onClick={() => handleRevokeApiKey(k.id)}
                        className="bg-red-600 text-white hover:bg-red-500 text-xs px-2 py-1"
                      >
                        Revoke
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </main>

        {/* -------------- 2FA & PASSWORD CARDS -------------- */}
        <div className="p-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md"
          >
            <h2 className="text-xl font-semibold text-cyan-400 mb-4">Two-Factor Authentication</h2>
            <p className="text-gray-300 mb-4">Protect your account with an authenticator app.</p>
            <Button
              onClick={() => router.push('/profile?onboard=true')}
              className="w-full bg-cyan-500 text-black hover:bg-cyan-400"
            >
              Manage 2FA
            </Button>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.01 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md"
          >
            <h2 className="text-xl font-semibold text-cyan-400 mb-4">Change Password</h2>
            <p className="text-gray-300 mb-4">Update your password regularly.</p>
            <Button
              onClick={() => router.push('/user-dashboard-main/profile')}
              className="w-full bg-cyan-500 text-black hover:bg-cyan-400"
            >
              Change Password
            </Button>
          </motion.div>
        </div>

        {/* -------------- ACTIVE SESSIONS -------------- */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="p-6 max-w-7xl mx-auto bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md"
        >
          <h2 className="text-xl font-semibold text-cyan-400 mb-4">Active Sessions</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="pb-2 text-sm text-gray-400">Device / OS</th>
                  <th className="pb-2 text-sm text-gray-400">IP</th>
                  <th className="pb-2 text-sm text-gray-400">Last Seen</th>
                  <th className="pb-2 text-sm text-gray-400"></th>
                </tr>
              </thead>
              <tbody>
                {safeSessions.map((s) => (
                  <tr key={s.id} className="border-b border-white/10 last:border-0">
                    <td className="py-2 text-white text-sm">{s.device} / {s.os}</td>
                    <td className="py-2 text-white text-sm">{s.ip}</td>
                    <td className="py-2 text-white text-sm">{new Date(s.lastSeen).toLocaleString()}</td>
                    <td className="py-2">
                      {!s.current && (
                        <Button
                          onClick={() =>
                            fetch(`/api/security/sessions/${s.id}`, { method: 'DELETE' }).then(() =>
                              toast.success('Session revoked')
                            )
                          }
                          className="bg-red-600 text-white hover:bg-red-500 text-xs px-2 py-1"
                        >
                          Revoke
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}