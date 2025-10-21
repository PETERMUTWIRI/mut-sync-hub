'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useUser } from '@stackframe/stack';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { Toaster, toast } from 'react-hot-toast';
import { strength } from '@/lib/password-strength';
import { CameraIcon, EyeIcon, EyeSlashIcon, DocumentDuplicateIcon, PrinterIcon } from '@heroicons/react/24/outline';

/* ---- dynamic UI ---- */
const Card        = dynamic(() => import('@/components/ui/card').then(m => m.Card));
const CardHeader  = dynamic(() => import('@/components/ui/card').then(m => m.CardHeader));
const CardTitle   = dynamic(() => import('@/components/ui/card').then(m => m.CardTitle));
const CardContent = dynamic(() => import('@/components/ui/card').then(m => m.CardContent));
const Button      = dynamic(() => import('@/components/ui/button').then(m => m.Button));
const Input       = dynamic(() => import('@/components/ui/input').then(m => m.Input));
const Label       = dynamic(() => import('@/components/ui/label').then(m => m.Label));
const Switch      = dynamic(() => import('@/components/ui/Switch'));
const Spinner     = dynamic(() => import('@/components/ui/Spinner'));

/* ---- types ---- */
type Profile = { name: string; email: string; avatarUrl?: string; mfaEnabled: boolean; firstName?: string };
type Audit   = { id: string; action: string; createdAt: string; ip?: string };

/* ---- Backup-codes modal ---- */
function BackupCodesModal({ codes, onClose }: { codes: string[]; onClose: () => void }) {
  const copyAll = () => navigator.clipboard.writeText(codes.join('\n'));
  const print   = () => {
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<html><head><title>Backup Codes</title></head><body><pre>${codes.join('\n')}</pre></body></html>`);
    w.print(); w.close();
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <motion.div initial={{ opacity: 0, scale: .95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: .95 }}
                  className="bg-[#1E2A44] border border-[#2E7D7D]/30 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold text-lg">Save your backup codes</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
        </div>
        <p className="text-sm text-gray-300 mb-4">Store them somewhere safe – each code can be used only once.</p>
        <div className="bg-black/30 rounded-lg p-4 font-mono text-sm text-gray-200 max-h-60 overflow-auto">
          {codes.map(c => (
            <div key={c} className="flex items-center justify-between py-1">
              <span>{c}</span>
              <button onClick={() => navigator.clipboard.writeText(c)} className="text-teal-400 hover:text-white">
                <DocumentDuplicateIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-3 mt-4">
          <Button onClick={copyAll} className="bg-teal-600 hover:bg-teal-500 text-white flex-1">Copy all</Button>
          <Button onClick={print}   className="bg-teal-600 hover:bg-teal-500 text-white flex-1">Print</Button>
          <Button onClick={onClose} className="bg-gray-700 hover:bg-gray-600 text-white flex-1">Done</Button>
        </div>
      </motion.div>
    </div>
  );
}

/* ---- MFA gate (re-usable) ---- */
export function MFAGate({ onSuccess }: { onSuccess: () => void }) {
  const [code, setCode] = useState('');
  const verify = async () => {
    const res = await fetch('/api/profile/mfa/verify', {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify({ code }),
    });
    const { valid } = await res.json();
    if (valid) { onSuccess(); setCode(''); } else toast.error('Invalid code');
  };
  return (
    <div className="rounded-xl bg-black/30 border border-teal-500/50 p-4">
      <Label className="text-teal-300">Enter 6-digit authenticator code</Label>
      <div className="flex gap-2 mt-2">
        <Input value={code} onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
               placeholder="123456" maxLength={6} className="bg-black/30 border-teal-500/50" />
        <Button onClick={verify} disabled={code.length !== 6} className="bg-teal-600 hover:bg-teal-500 text-white">Verify</Button>
      </div>
    </div>
  );
}

/* ================================================================================
   MAIN PAGE
   ================================================================================ */
export default function ProfilePage() {
  useUser({ or: 'redirect' });
  const router       = useRouter();
  const searchParams = useSearchParams();
  const isOnboard    = searchParams.get('onboard') === 'true';
  const stackUser    = useUser();

  /* ---- state ---- */
  const [profile, setProfile]       = useState<Profile | null>(null);
  const [audit, setAudit]           = useState<Audit[]>([]);
  const [loading, setLoading]       = useState(true);

  /* profile fields */
  const [name, setName]             = useState('');
  const [email, setEmail]           = useState('');
  const [avatar, setAvatar]         = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState('');

  /* password */
  const [pwd, setPwd]               = useState('');
  const [showPwd, setShowPwd]       = useState(false);
  const pwdStrength                 = strength(pwd);

  /* 2FA */
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [qr, setQr]                 = useState('');

  /* backup codes */
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showBackupModal, setShowBackupModal] = useState(false);

  /* refs */
  const fileInput = useRef<HTMLInputElement>(null);

  /* ---- data fetch ---- */
  useEffect(() => {
    (async () => {
      try {
        const [prof, logs] = await Promise.all([
          fetch('/api/profile').then(r => r.json()),
          fetch('/api/audit').then(r => r.json()),
        ]);
        setProfile(prof);
        setName(prof.firstName || '');
  setEmail(prof.email || stackUser?.primaryEmail || '');
        setAvatarPreview(prof.avatarUrl || '');
        setMfaEnabled(prof.mfaEnabled || false);
        setAudit(logs);
        if (isOnboard && !prof.firstName) setTimeout(() => document.getElementById('firstName')?.focus(), 200);
      } catch {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    })();
  }, [isOnboard, stackUser?.primaryEmail]);

  /* ---- avatar ---- */
  const onAvatarPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatar(file);
    setAvatarPreview(URL.createObjectURL(file));
  };
  const uploadAvatar = async () => {
    if (!avatar) return;
    const body = new FormData(); body.append('avatar', avatar);
    const res = await fetch('/api/profile/avatar', { method: 'POST', body });
    if (res.ok) { const { url } = await res.json(); setAvatarPreview(url); toast.success('Avatar updated'); }
    else toast.error('Upload failed');
  };

  /* ---- profile save ---- */
  const saveProfile = async () => {
    const res = await fetch('/api/profile', {
      method : 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify({ firstName: name, email }),
    });
    if (res.ok) {
      toast.success(isOnboard ? 'Setup complete – welcome aboard!' : 'Profile saved');
      if (isOnboard) router.replace('/user-dashboard-main');
      const updated = await fetch('/api/profile').then(r => r.json());
      setProfile(updated);
    } else toast.error('Save failed');
  };

  /* ---- password ---- */
  const savePassword = async () => {
    if (pwdStrength < 3) return toast.error('Password too weak');
    const res = await fetch('/api/profile/password', {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify({ password: pwd }),
    });
    if (res.ok) { toast.success('Password changed'); setPwd(''); }
    else toast.error('Change failed');
  };

  /* ---- 2FA : NEW SUPABASE ROUTES ---- */
  const toggleMFA = async () => {
    if (!mfaEnabled) {
      /* ----------  SETUP (GET QR)  ---------- */
      const res = await fetch('/api/profile/mfa/setup', { credentials: 'include' });
      if (!res.ok) { toast.error('Setup failed'); return; }
      const { url } = await res.json();   // url = otpauth string
      setQr(url);
    } else {
      /* ----------  DISABLE  ---------- */
      await fetch('/api/profile/mfa/disable', { method: 'POST' });
      setQr(''); setMfaEnabled(false); toast.success('2FA disabled');
    }
  };

  const confirmMFA = async (code: string) => {
    /* ----------  ENABLE (VERIFY CODE)  ---------- */
    const res = await fetch('/api/profile/mfa/enable', {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify({ code }),
    });
    if (res.ok) {
      const { backupCodes: codes } = await res.json();
      setBackupCodes(codes);
      setMfaEnabled(true);
      setQr('');
      setShowBackupModal(true);
    } else toast.error('Invalid code');
  };

  /* ---- sensitive-action demo ---- */
  const [showMfaGate, setShowMfaGate] = useState(false);
  const [pendingAction, setPendingAction] = useState<() => void>();
  const requestSensitiveAction = (action: () => void) => {
    if (!mfaEnabled) return action();           // no gate if 2FA off
    setPendingAction(() => action);
    setShowMfaGate(true);
  };
  const runAfterMFA = () => { if (pendingAction) pendingAction(); setShowMfaGate(false); };

  /* ---- rendering ---- */
  if (loading) return <div className="min-h-screen bg-[#1E2A44] flex items-center justify-center"><Spinner /></div>;

  const showBanner = isOnboard && !profile?.firstName;

  return (
    <div className="min-h-screen bg-[#1E2A44] text-gray-100 font-inter">
      <Toaster position="top-right" />

      <header className="sticky top-0 z-20 bg-[#1E2A44]/60 backdrop-blur-lg border-b border-[#2E7D7D]/30 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-cyan-300 bg-clip-text text-transparent">Profile & Settings</h1>
          <Button onClick={() => router.back()} className="bg-[#2E7D7D]/20 border border-[#2E7D7D] text-white hover:bg-[#2E7D7D]/40">← Back</Button>
        </div>
      </header>

      {showBanner && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="mx-auto max-w-6xl px-6 mt-4">
          <div className="rounded-xl bg-gradient-to-r from-teal-500 to-cyan-400 text-white p-4 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg">Welcome! Let’s add your name</h3>
              <p className="text-sm">Finish setting up your account to unlock all features.</p>
            </div>
            <Button onClick={() => document.getElementById('firstName')?.focus()} className="bg-white text-teal-600 hover:bg-gray-100">Get Started</Button>
          </div>
        </motion.div>
      )}

      <main className="max-w-6xl mx-auto px-6 py-10 grid gap-8">

        {/* -------- Personal Card -------- */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-gradient-to-br from-[#1E2A44] to-[#2E7D7D]/10 border border-[#2E7D7D]/30 p-6 shadow-2xl">
          <h2 className="text-xl font-semibold text-teal-300 mb-4">Personal Information</h2>
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="relative group">
              <img
                src={avatarPreview || `https://ui-avatars.com/api/?name=${name}&background=2E7D7D&color=fff`}
                alt="Avatar"
                className="w-24 h-24 rounded-full object-cover ring-4 ring-[#2E7D7D]/40 group-hover:ring-teal-400 transition"
              />
              <button onClick={() => fileInput.current?.click()} className="absolute bottom-0 right-0 bg-teal-500 rounded-full p-2 text-white opacity-80 group-hover:opacity-100" aria-label="Change avatar"><CameraIcon className="w-5 h-5" /></button>
              <input ref={fileInput} type="file" accept="image/*" onChange={onAvatarPick} className="hidden" />
              {avatar && <Button onClick={uploadAvatar} className="mt-2 w-full bg-teal-600 hover:bg-teal-500">Upload</Button>}
            </div>

            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><Label className="text-teal-300">First Name</Label><Input id="firstName" value={name} onChange={e => setName(e.target.value)} className="bg-black/30 border-teal-500/50" placeholder="John" /></div>
              <div><Label className="text-teal-300">Email</Label><Input value={email} onChange={e => setEmail(e.target.value)} className="bg-black/30 border-teal-500/50" placeholder="john@example.com" /></div>
            </div>
          </div>
          <div className="mt-6 flex gap-3"><Button onClick={saveProfile} className="bg-gradient-to-r from-teal-500 to-cyan-400 text-white font-semibold hover:from-teal-600 hover:to-cyan-500">Save Profile</Button></div>
        </motion.div>

        {/* -------- Password Card -------- */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-2xl bg-gradient-to-br from-[#1E2A44] to-[#2E7D7D]/10 border border-[#2E7D7D]/30 p-6 shadow-2xl">
          <h2 className="text-xl font-semibold text-teal-300 mb-4">Change Password</h2>
          <div className="space-y-3">
            <div className="relative">
              <Label className="text-teal-300">New Password</Label>
              <div className="flex items-center gap-2">
                <Input type={showPwd ? 'text' : 'password'} value={pwd} onChange={e => setPwd(e.target.value)} className="bg-black/30 border-teal-500/50 pr-10" placeholder="Min 8 chars, mixed case, number & symbol" />
                <button type="button" onClick={() => setShowPwd(s => !s)} className="absolute right-3 top-9 text-teal-300 hover:text-white" aria-label={showPwd ? 'Hide password' : 'Show password'}>
                  {showPwd ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>
              <div className="w-full bg-black/30 rounded h-2 mt-2"><div className={`h-2 rounded ${['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'][pwdStrength]}`} style={{ width: `${(pwdStrength + 1) * 25}%` }} /></div>
              <p className="text-xs text-gray-400 mt-1">{['Very weak', 'Weak', 'Fair', 'Strong', 'Very strong'][pwdStrength]}</p>
            </div>
            <Button onClick={savePassword} disabled={pwdStrength < 3} className="bg-gradient-to-r from-teal-500 to-cyan-400 text-white font-semibold hover:from-teal-600 hover:to-cyan-500 disabled:opacity-50">Change Password</Button>
          </div>
        </motion.div>

        {/* -------- 2FA Card -------- */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-2xl bg-gradient-to-br from-[#1E2A44] to-[#2E7D7D]/10 border border-[#2E7D7D]/30 p-6 shadow-2xl">
          <h2 className="text-xl font-semibold text-teal-300 mb-4">Two-Factor Authentication</h2>
          <div className="flex items-center justify-between">
            <div><p className="text-gray-300">Protect your account with an authenticator app.</p><p className="text-xs text-gray-500">Recommended for enterprise accounts.</p></div>
            <Switch checked={mfaEnabled} onCheckedChange={toggleMFA} className="scale-110" />
          </div>

          <AnimatePresence>
            {qr && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-6">
                <p className="text-sm text-gray-300 mb-2">Scan with your authenticator app:</p>
                <img src={qr} alt="QR Code" className="w-48 h-48 mx-auto" />
                <div className="mt-4">
                  <Label className="text-teal-300">Enter 6-digit code</Label>
                  <Input placeholder="123456" maxLength={6} onChange={e => { if (e.target.value.length === 6) confirmMFA(e.target.value); }} className="bg-black/30 border-teal-500/50" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* -------- Sensitive-action demo -------- */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-2xl bg-gradient-to-br from-[#1E2A44] to-[#2E7D7D]/10 border border-[#2E7D7D]/30 p-6 shadow-2xl">
          <h2 className="text-xl font-semibold text-teal-300 mb-4">Danger Zone</h2>
          <p className="text-sm text-gray-300 mb-4">2FA verification required for high-risk actions.</p>
          <Button onClick={() => requestSensitiveAction(() => toast('🗑️  Org delete requested (demo)'))} className="bg-red-600 hover:bg-red-500 text-white">Delete Organisation</Button>
          <AnimatePresence>
            {showMfaGate && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-4">
                <MFAGate onSuccess={runAfterMFA} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* -------- Activity Timeline -------- */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="rounded-2xl bg-gradient-to-br from-[#1E2A44] to-[#2E7D7D]/10 border border-[#2E7D7D]/30 p-6 shadow-2xl">
          <h2 className="text-xl font-semibold text-teal-300 mb-4">Recent Activity</h2>
          <div className="space-y-3 max-h-80 overflow-auto pr-2">
            {audit.map(log => (
              <div key={log.id} className="flex items-start gap-4">
                <div className="w-2 h-2 rounded-full bg-teal-400 mt-2" />
                <div className="flex-1">
                  <p className="text-sm text-white">{log.action}</p>
                  <p className="text-xs text-gray-400">{new Date(log.createdAt).toLocaleString()} {log.ip && `• ${log.ip}`}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </main>

      {/* ---- Backup-codes modal ---- */}
      <AnimatePresence>{showBackupModal && <BackupCodesModal codes={backupCodes} onClose={() => setShowBackupModal(false)} />}</AnimatePresence>
    </div>
  );
}