'use client';

import React, { useEffect, useState } from 'react';
import { useUser } from '@stackframe/stack';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { getPlans } from '@/app/actions/plans';
import { initiateSTKPush, getPaymentUsage, retryFailedPayment } from '@/app/actions/mpesa';
import Spinner from '@/components/ui/Spinner';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { ChevronDown, Download, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

/* ---------- helpers ---------- */
const formatKsh = (n: number) => `KSH ${n.toLocaleString()}`;

/* ---------- page ---------- */
export default function BillingPage() {
  const user = useUser({ or: 'redirect' });
  const router = useRouter();

  /* state */
  const [plans, setPlans] = useState<any[]>([]);
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [usage, setUsage] = useState<{ progress: number; limit: number; count: number }>({ progress: 0, limit: 0, count: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [phone, setPhone] = useState('');
  const [paying, setPaying] = useState(false);

  /* bootstrap */
  useEffect(() => {
    (async () => {
      try {
        const [p, u, inv] = await Promise.all([
          getPlans(),
          getPaymentUsage(user.id),
          fetchInvoices(user.id),            // local helper below
        ]);
        setPlans(p);
        setUsage(u);
        setInvoices(inv);
        setCurrentPlan(p.find((pl: any) => pl.price === 0)); // fallback
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [user.id]);

  /* ---------- helpers ---------- */
  async function fetchInvoices(uid: string) {
    // todo: replace with real endpoint
    return [
      {
        id: 'inv_1',
        date: new Date().toISOString(),
        amount: 3000,
        status: 'PAID',
        checkoutRequestId: 'ws_CO_123',
        receipt: 'RJ5H2OG9F2',
      },
    ];
  }

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
      // poll for completion (cheap)
      setTimeout(async () => {
        const fresh = await getPaymentUsage(user.id);
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
  if (loading) return <div className="min-h-screen bg-[#1E2A44] grid place-items-center"><Spinner /></div>;
  if (error) return <div className="min-h-screen bg-[#1E2A44] grid place-items-center text-red-400">{error}</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto py-10 px-6 bg-[#1E2A44] text-white font-inter">
      {/* sticky header */}
      <header className="sticky top-0 z-20 bg-[#1E2A44]/95 backdrop-blur border-b border-[#2E7D7D]/30 py-4 px-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Billing & Payments</h1>
          <div className="text-sm text-gray-300">Usage: {usage.count}/{usage.limit || '∞'} ({(usage.progress * 100).toFixed(0)}%)</div>
        </div>
      </header>

      <h2 className="text-3xl font-bold mt-8 mb-2">Upgrade Your Plan</h2>
      <p className="text-gray-400 mb-8">Pay with M-Pesa in one tap.</p>

      {/* plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {plans.map((p) => (
          <motion.div key={p.id} whileHover={{ scale: 1.02 }}>
            <Card className="bg-[#2E7D7D]/10 border-0 shadow-lg rounded-xl p-6 cursor-pointer" onClick={() => { setSelectedPlan(p); setShowModal(true); }}>
              <CardHeader>
                <CardTitle className="text-xl">{p.name}</CardTitle>
                <div className="text-3xl font-bold mt-2">{p.price === 0 ? 'Free' : formatKsh(p.price)}<span className="text-sm font-normal text-gray-400">/mo</span></div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-300">
                  {p.features.map((f: string) => <li key={f} className="flex items-center gap-2"><span className="text-[#2E7D7D]">•</span>{f}</li>)}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* modal */}
      {showModal && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-[#1E2A44] rounded-xl p-8 w-full max-w-md border border-[#2E7D7D]/30">
            <h3 className="text-xl font-bold mb-2">Pay with M-Pesa</h3>
            <p className="text-gray-400 mb-4">Enter your Safaricom number. We’ll send you a prompt.</p>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              type="tel"
              placeholder="+254 7xx xxx xxx"
              className="w-full mb-4 p-3 rounded-lg bg-[#2E7D7D]/10 text-white border border-[#2E7D7D]/30 focus:ring-2 focus:ring-[#2E7D7D] outline-none"
            />
            <div className="flex gap-3">
              <Button disabled={paying} onClick={handleMpesaPay} className="flex-1 bg-[#2E7D7D] text-white">
                {paying ? <Spinner /> : 'Send Prompt'}
              </Button>
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* invoices / history */}
      <h3 className="text-xl font-bold mt-12 mb-4">Payment History</h3>
      <Card className="bg-[#2E7D7D]/10 border-0">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-gray-300">Date</TableHead>
                <TableHead className="text-gray-300">Amount</TableHead>
                <TableHead className="text-gray-300">Receipt</TableHead>
                <TableHead className="text-gray-300">Status</TableHead>
                <TableHead className="text-gray-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell>{new Date(inv.date).toLocaleDateString()}</TableCell>
                  <TableCell>{formatKsh(inv.amount)}</TableCell>
                  <TableCell>{inv.receipt || '-'}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs ${inv.status === 'PAID' ? 'bg-green-600' : inv.status === 'FAILED' ? 'bg-red-600' : 'bg-yellow-600'}`}>
                      {inv.status}
                    </span>
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
    </motion.div>
  );
}
