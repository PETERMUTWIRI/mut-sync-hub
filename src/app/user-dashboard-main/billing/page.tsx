'use client';

import React, { useEffect, useState } from 'react';
import { useUser } from '@stackframe/stack';
import { motion } from 'framer-motion';
import { getPlans } from '@/app/actions/plans';
import { initiateSTKPush, retryFailedPayment } from '@/app/actions/mpesa';
import Spinner from '@/components/ui/Spinner';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Download, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

/* ---------- helpers ---------- */
const formatKsh = (n: number) => `KSH ${n.toLocaleString()}`;

/* ---------- page ---------- */
export default function BillingPage() {
  const user = useUser({ or: 'redirect' });

  /* state */
  const [plans, setPlans] = useState<any[]>([]);
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [usage, setUsage] = useState({ progress: 0, limit: 0, count: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [phone, setPhone] = useState('');
  const [paying, setPaying] = useState(false);

  /* real data fetch */
  useEffect(() => {
    (async () => {
      try {
        const [p, u, inv] = await Promise.all([
          getPlans(),
          fetch(`/api/billing/usage?userId=${user.id}`).then((r) => r.json()),
          fetch(`/api/billing/invoices?userId=${user.id}`).then((r) => r.json()),
        ]);
        setPlans(p);
        setUsage(u);
        setInvoices(inv);
        setCurrentPlan(p.find((pl: any) => pl.price === 0) ?? p[0]);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [user.id]);

  /* ---------- actions ---------- */
  async function handleMpesaPay() {
    if (!selectedPlan || !phone) return;
    const clean = phone.replace(/\D/g, '');
    if (!/^254\d{9}$/.test(clean)) return toast.error('Enter a valid Kenyan number (+254...)');

    setPaying(true);
    try {
      const res = await initiateSTKPush(user.id, {
        amount: selectedPlan.price,
        phoneNumber: clean,
        accountReference: `plan_${selectedPlan.id}`,
        transactionDesc: `Upgrade to ${selectedPlan.name}`,
      });
      toast.success('Check your phone and enter PIN');
      setShowModal(false);
      // poll for fresh usage
      setTimeout(async () => {
        const fresh = await fetch(`/api/billing/usage?userId=${user.id}`).then((r) => r.json());
        setUsage(fresh);
      }, 7000);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setPaying(false);
    }
  }

  async function handleRetry(inv: any) {
    try {
      await retryFailedPayment(inv.id);
      toast.success('Retry initiated');
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  /* ---------- UI ---------- */
  if (loading) return <div className="min-h-screen bg-[#0B1020] grid place-items-center"><Spinner /></div>;
  if (error) return <div className="min-h-screen bg-[#0B1020] grid place-items-center text-red-400">{error}</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-[#0B1020] text-gray-100 font-inter">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-[#0B1020]/80 backdrop-blur border-b border-white/10 py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Billing & Payments</h1>
          <div className="text-sm text-gray-400">Usage: {usage.count}/{usage.limit || '∞'} ({(usage.progress * 100).toFixed(0)}%)</div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 grid gap-8">
        {/* Plans */}
        <section>
          <h2 className="text-3xl font-bold mb-2">Upgrade Your Plan</h2>
          <p className="text-gray-400 mb-8">Pay with M-Pesa in one tap.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((p) => (
              <motion.div key={p.id} whileHover={{ scale: 1.02 }}>
                <Card className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md cursor-pointer" onClick={() => { setSelectedPlan(p); setShowModal(true); }}>
                  <CardHeader>
                    <CardTitle className="text-xl text-white">{p.name}</CardTitle>
                    <div className="text-3xl font-bold mt-2 text-cyan-400">{p.price === 0 ? 'Free' : formatKsh(p.price)}<span className="text-sm font-normal text-gray-400">/mo</span></div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-gray-300">
                      {p.features.map((f: any) => (
                        <li key={f.name} className="flex items-center gap-2"><span className="text-cyan-400">•</span>{f.name}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Modal */}
        {showModal && selectedPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-[#0B1020] border border-white/10 rounded-2xl p-8 w-full max-w-md backdrop-blur-md">
              <h3 className="text-xl font-bold text-white mb-2">Pay with M-Pesa</h3>
              <p className="text-gray-400 mb-4">Enter your Safaricom number. We’ll send you a prompt.</p>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                type="tel"
                placeholder="+254 7xx xxx xxx"
                className="w-full mb-4 p-3 rounded-lg bg-white/5 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
              <div className="flex gap-3">
                <Button disabled={paying} onClick={handleMpesaPay} className="flex-1 bg-cyan-500 text-black hover:bg-cyan-400">{paying ? <Spinner /> : 'Send Prompt'}</Button>
                <Button variant="outline" onClick={() => setShowModal(false)} className="text-cyan-400 border-cyan-400 hover:bg-cyan-400/10">Cancel</Button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Payment History */}
        <section>
          <h3 className="text-xl font-bold mb-4">Payment History</h3>
          <Card className="bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-gray-400">Date</TableHead>
                    <TableHead className="text-gray-400">Amount</TableHead>
                    <TableHead className="text-gray-400">Receipt</TableHead>
                    <TableHead className="text-gray-400">Status</TableHead>
                    <TableHead className="text-gray-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell className="text-white">{new Date(inv.date).toLocaleDateString()}</TableCell>
                      <TableCell className="text-white">{formatKsh(inv.amount)}</TableCell>
                      <TableCell className="text-white">{inv.receipt || '-'}</TableCell>
                      <TableCell>
                        <span className={cn('px-2 py-1 rounded text-xs', inv.status === 'COMPLETED' ? 'bg-green-600 text-white' : inv.status === 'FAILED' ? 'bg-red-600 text-white' : 'bg-yellow-600 text-white')}>{inv.status}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" onClick={() => toast.info('PDF download coming soon')}><Download className="w-4" /></Button>
                          {inv.status === 'FAILED' && <Button size="sm" variant="ghost" onClick={() => handleRetry(inv)}><RotateCcw className="w-4" /></Button>}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>
      </main>
    </motion.div>
  );
}