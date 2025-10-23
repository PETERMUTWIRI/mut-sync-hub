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

  /* ---------- render ---------- */
  if (loading) return <Spinner />;
  return (
    <>
      <Toaster position="top-right" />
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto px-6 py-10 bg-[#1E2A44] text-white font-inter">
        <header className="sticky top-0 z-20 bg-[#1E2A44]/95 backdrop-blur-md border-b border-[#2E7D7D]/30 py-4 px-6">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold">Security Command Center</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-300">Risk Score</span>
                <div className={`px-3 py-1 rounded text-xs font-medium ${riskScore > 70 ? 'bg-red-500/20 text-red-300' : riskScore > 40 ? 'bg-yellow-500/20 text-yellow-300' : 'bg-green-500/20 text-green-300'}`}>{riskScore}/100</div>
              </div>
              <Button onClick={handleEmergencyLockdown} className="bg-red-600 hover:bg-red-500 text-white">Emergency Lockdown</Button>
            </div>
          </div>
        </header>

        {riskScore > 70 && (
          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mt-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-red-400 text-xl">🚨</span>
              <div>
                <p className="text-red-300 font-semibold">High-risk activity detected</p>
                <p className="text-red-400 text-sm">Review recent events and consider enabling stricter policies.</p>
              </div>
            </div>
            <Button onClick={() => window.scrollTo({ top: 700, behavior: 'smooth' })} className="bg-red-600 hover:bg-red-500 text-white">Review Events</Button>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <Card className="bg-[#1E2A44] border border-[#2E7D7D]/30 rounded-xl">
            <CardHeader><CardTitle className="text-[#2E7D7D]">Live Security Events</CardTitle></CardHeader>
            <CardContent className="max-h-[400px] overflow-y-auto pr-2">
              {!events ? <Spinner /> : events.length === 0 ? <p className="text-gray-400">No events yet.</p> : events.map((ev) => (
                <div key={ev.id} className="flex items-start gap-3 py-2 border-b border-[#2E7D7D]/20 last:border-0">
                  <span className={`mt-1 text-xs px-2 py-0.5 rounded ${ev.risk === 'high' ? 'bg-red-500/20 text-red-300' : ev.risk === 'medium' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-green-500/20 text-green-300'}`}>{ev.risk}</span>
                  <div className="flex-1">
                    <p className="text-white text-sm">{ev.action}</p>
                    <p className="text-gray-400 text-xs">{ev.ip} • {new Date(ev.createdAt).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-[#1E2A44] border border-[#2E7D7D]/30 rounded-xl">
            <CardHeader><CardTitle className="text-[#2E7D7D]">Login Geography</CardTitle></CardHeader>
            <CardContent><div ref={mapContainer} className="webgl-globe" /></CardContent>
          </Card>

          <Card className="bg-[#1E2A44] border border-[#2E7D7D]/30 rounded-xl">
            <CardHeader><CardTitle className="text-[#2E7D7D]">Quick Actions</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={() => navigator.clipboard.writeText(window.location.origin + '/security/qr-setup')} className="w-full bg-[#2E7D7D] hover:bg-[#2E7D7D]/80 text-white">Copy 2FA Setup Link</Button>
              <Button onClick={handleExportLogs} className="w-full bg-gray-700 hover:bg-gray-600 text-white">Export Logs</Button>
              <Button onClick={() => agentChat('Check if my email has been in a breach', user.primaryEmail ?? undefined).then((r) => toast(r.content))} className="w-full bg-purple-700 hover:bg-purple-600 text-white">Dark-Web Check</Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <Card className="bg-[#1E2A44] border border-[#2E7D7D]/30 rounded-xl">
            <CardHeader><CardTitle className="text-[#2E7D7D]">Two-Factor Authentication</CardTitle></CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">Protect your account with an authenticator app.</p>
              <Button onClick={() => router.push('/profile?onboard=true')} className="w-full bg-[#2E7D7D] hover:bg-[#2E7D7D]/80 text-white">Manage 2FA</Button>
            </CardContent>
          </Card>

          <Card className="bg-[#1E2A44] border border-[#2E7D7D]/30 rounded-xl">
            <CardHeader><CardTitle className="text-[#2E7D7D]">Change Password</CardTitle></CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">Update your password regularly.</p>
              <Button onClick={() => router.push('/profile')} className="w-full bg-[#2E7D7D] hover:bg-[#2E7D7D]/80 text-white">Change Password</Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <Card className="bg-[#1E2A44] border border-[#2E7D7D]/30 rounded-xl">
            <CardHeader><CardTitle className="text-[#2E7D7D]">Active Sessions</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[#2E7D7D]">Device / OS</TableHead>
                    <TableHead className="text-[#2E7D7D]">IP</TableHead>
                    <TableHead className="text-[#2E7D7D]">Last Seen</TableHead>
                    <TableHead className="text-[#2E7D7D]">Current</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="text-gray-200">{s.device} / {s.os}</TableCell>
                      <TableCell className="text-gray-200">{s.ip}</TableCell>
                      <TableCell className="text-gray-200">{new Date(s.lastSeen).toLocaleString()}</TableCell>
                      <TableCell>{s.current ? <span className="text-green-400">This device</span> : null}</TableCell>
                      <TableCell>
                        {!s.current && (
                          <Button onClick={() => fetch(`/api/security/sessions/${s.id}`, { method: 'DELETE' }).then(() => toast.success('Session revoked'))} className="bg-red-600 hover:bg-red-500 text-white" size="sm">Revoke</Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </>
  );
}