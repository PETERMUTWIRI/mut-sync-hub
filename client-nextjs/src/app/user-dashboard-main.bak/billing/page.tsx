'use client';

import React, { useEffect, useState } from 'react';
import { useUser } from '@stackframe/stack';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { getCurrentPlan, getInvoices, getPaymentMethods, deletePaymentMethod } from '@/lib/user';
import Spinner from '@/components/ui/Spinner';
import {Button} from '@/components/ui/button';
// Dynamic imports for individual components
import { ChevronDown } from 'lucide-react';
const Card = dynamic(() => import('@/components/ui/card').then((mod) => mod.Card), { ssr: false });
const CardHeader = dynamic(() => import('@/components/ui/card').then((mod) => mod.CardHeader), { ssr: false });
const CardTitle = dynamic(() => import('@/components/ui/card').then((mod) => mod.CardTitle), { ssr: false });
const CardContent = dynamic(() => import('@/components/ui/card').then((mod) => mod.CardContent), { ssr: false });
const Table = dynamic(() => import('@/components/ui/table').then((mod) => mod.Table), { ssr: false });
const TableHeader = dynamic(() => import('@/components/ui/table').then((mod) => mod.TableHeader), { ssr: false });
const TableRow = dynamic(() => import('@/components/ui/table').then((mod) => mod.TableRow), { ssr: false });
const TableHead = dynamic(() => import('@/components/ui/table').then((mod) => mod.TableHead), { ssr: false });
const TableBody = dynamic(() => import('@/components/ui/table').then((mod) => mod.TableBody), { ssr: false });
const TableCell = dynamic(() => import('@/components/ui/table').then((mod) => mod.TableCell), { ssr: false });

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
            <p className="text-red-400 font-inter text-lg">Failed to load billing</p>
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

const Billing: React.FC = () => {
  const user = useUser({ or: 'redirect' });
  const router = useRouter();
  const [plan, setPlan] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [isActionOpen, setIsActionOpen] = useState<string | null>(null);

  const plans = [
    {
      id: 'free',
      name: 'Free',
      description: 'Basic access for individuals and small teams.',
      price: 0,
      currency: 'KSH',
      features: [
        'Monthly queries to the agent: 15',
        'Number of scheduled reports: 2 (weekly)',
        'Basic analytics dashboard',
      ],
      category: 'Basic',
    },
    {
      id: 'pro',
      name: 'Pro',
      description: 'For growing teams and businesses.',
      price: 3000,
      currency: 'KSH',
      features: [
        'Monthly queries to the agent: 500',
        'Number of scheduled reports: 20 (daily, weekly)',
        'Advanced analytics dashboard',
        'Faster support response',
      ],
      category: 'Professional',
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'Custom solutions for large organizations.',
      price: 10000,
      currency: 'KSH',
      features: [
        'Monthly queries to the agent: 5000',
        'Number of scheduled reports: 100 (hourly, daily, weekly, monthly, custom)',
        'Full analytics suite',
        '24/7 support',
        'Integrate with your stack',
      ],
      category: 'Enterprise',
    },
  ];

  useEffect(() => {
    setLoading(true);
    Promise.all([getCurrentPlan(), getInvoices(), getPaymentMethods()])
      .then(([planRes, invoicesRes, paymentMethodsRes]) => {
        setPlan(planRes.data);
        setInvoices(invoicesRes.data);
        setPaymentMethods(paymentMethodsRes.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Failed to fetch billing data:', error);
        setError('Failed to load billing data');
        setLoading(false);
      });
  }, []);

  const handleDeletePaymentMethod = async (id: string) => {
    try {
      await deletePaymentMethod(id);
      setPaymentMethods(paymentMethods.filter((pm) => pm.id !== id));
    } catch (error) {
      console.error('Failed to delete payment method:', error);
      setError('Failed to delete payment method');
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-[#1E2A44] flex items-center justify-center w-full"
      >
        <Spinner />
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
            <h1 className="text-2xl font-bold">Billing Dashboard</h1>
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Search invoices..."
                className="bg-[#2E7D7D]/20 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E7D7D]"
                aria-label="Search invoices"
              />
              <Button className="bg-[#2E7D7D] text-white hover:bg-[#2E7D7D]/80" aria-label="Search">
                Search
              </Button>
            </div>
          </div>
        </header>

        <h1 className="text-3xl font-bold mb-6 mt-8">Your Billing Journey</h1>
        <p className="text-base text-gray-400 mb-12 max-w-3xl">Choose the perfect plan for your team and unlock powerful analytics, reporting, and support. Your growth story starts here.</p>

        {/* Plans Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-12">
          {plans.map((p) => (
            <motion.div
              key={p.id}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Card
                className={`border-0 shadow-lg bg-[#2E7D7D]/10 hover:bg-[#2E7D7D]/20 transition-colors duration-300 rounded-xl p-6 ${p.id === 'enterprise' ? 'ring-2 ring-[#2E7D7D]' : ''}`}
                onClick={() => {
                  setSelectedPlan(p);
                  setShowPaymentModal(true);
                }}
                role="button"
                tabIndex={0}
                aria-label={`Select ${p.name} plan`}
                onKeyDown={(e) => e.key === 'Enter' && setShowPaymentModal(true)}
              >
                <CardHeader>
                  <div className="flex items-center gap-2 mb-4">
                    {p.id === 'free' && <span className="bg-[#2E7D7D]/40 text-white text-xs px-2 py-1 rounded-full">Starter</span>}
                    {p.id === 'pro' && <span className="bg-[#2E7D7D]/40 text-white text-xs px-2 py-1 rounded-full">Popular</span>}
                    {p.id === 'enterprise' && <span className="bg-[#2E7D7D]/40 text-white text-xs px-2 py-1 rounded-full">Best Value</span>}
                  </div>
                  <CardTitle className="text-2xl font-semibold mb-2">{p.name}</CardTitle>
                  <div className="text-gray-500 text-sm uppercase tracking-wide mb-2">{p.category}</div>
                  <div className="text-3xl font-bold mb-2">{p.price === 0 ? 'Free' : `KSH ${p.price}/month`}</div>
                  <p className="text-gray-300 text-base mb-4 italic">{p.description}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-gray-200 text-base">
                        <span className="text-[#2E7D7D]">•</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Payment Modal */}
        {showPaymentModal && selectedPlan && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div className="bg-[#1E2A44] rounded-xl p-8 w-full max-w-md shadow-lg border border-[#2E7D7D]/30">
              <h2 id="modal-title" className="text-2xl font-bold text-white mb-4">Subscribe to {selectedPlan.name}</h2>
              <p className="text-gray-400 mb-4 text-base">Unlock <span className="font-medium text-[#2E7D7D]">{selectedPlan.category}</span> features for your team.</p>
              <div className="text-xl font-bold text-white mb-4">{selectedPlan.price === 0 ? 'Free' : `KSH ${selectedPlan.price}/month`}</div>
              <input
                type="text"
                placeholder="Card Number"
                className="mb-3 w-full p-3 rounded-lg bg-[#2E7D7D]/10 text-white border border-[#2E7D7D]/30 focus:ring-2 focus:ring-[#2E7D7D]"
                aria-label="Card Number"
              />
              <input
                type="text"
                placeholder="Expiry"
                className="mb-3 w-full p-3 rounded-lg bg-[#2E7D7D]/10 text-white border border-[#2E7D7D]/30 focus:ring-2 focus:ring-[#2E7D7D]"
                aria-label="Expiry Date"
              />
              <input
                type="text"
                placeholder="CVC"
                className="mb-6 w-full p-3 rounded-lg bg-[#2E7D7D]/10 text-white border border-[#2E7D7D]/30 focus:ring-2 focus:ring-[#2E7D7D]"
                aria-label="CVC"
              />
              <Button
                className="w-full mb-2 bg-[#2E7D7D] text-white font-medium py-2 rounded-lg hover:bg-[#2E7D7D]/80 transition-colors"
                aria-label={`Subscribe to ${selectedPlan.name}`}
              >
                Pay & Subscribe
              </Button>
              <Button
                variant="outline"
                className="w-full text-[#2E7D7D] border-[#2E7D7D]"
                onClick={() => setShowPaymentModal(false)}
                aria-label="Cancel subscription"
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        )}

        {/* Current Plan Section */}
        <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
          <Card className="mb-8 bg-[#2E7D7D]/10 border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-semibold text-white">Your Current Plan</CardTitle>
              <Button
                className="bg-[#2E7D7D] text-white font-medium hover:bg-[#2E7D7D]/80 transition-colors"
                aria-label="Upgrade Plan"
                data-tooltip-id="upgrade-tooltip"
                data-tooltip-content="Upgrade to unlock more features"
              >
                Upgrade Plan
              </Button>
            </CardHeader>
            <CardContent>
              {plan ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-white">
                  <div>
                    <p className="text-gray-500">Plan</p>
                    <p className="text-lg font-medium">
                      {plan.name} {plan.name === 'Enterprise' && <span className="bg-[#2E7D7D]/40 text-white text-xs px-2 py-1 rounded-full">Enterprise</span>}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Price</p>
                    <p className="text-lg font-medium">{plan.price === 0 ? 'Free' : `KSH ${plan.price}/month`}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Next Invoice</p>
                    <p className="text-lg font-medium">{plan.nextInvoice ? new Date(plan.nextInvoice).toLocaleDateString() : '-'}</p>
                  </div>
                </div>
              ) : (
                <div className="text-gray-500">No plan information available.</div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Invoices Section */}
        <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
          <Card className="mb-8 bg-[#2E7D7D]/10 border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-white">Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-gray-300">Date</TableHead>
                    <TableHead className="text-gray-300">Amount</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="text-gray-400">{new Date(invoice.date).toLocaleDateString()}</TableCell>
                      <TableCell className="text-gray-400">{`KSH ${invoice.amount.toFixed(2)}`}</TableCell>
                      <TableCell className={invoice.status === 'Paid' ? 'text-green-400' : 'text-yellow-400'}>
                        {invoice.status}
                      </TableCell>
                      <TableCell>
                        <div className="relative">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-[#2E7D7D] border-[#2E7D7D] flex items-center gap-2"
                            onClick={() => setIsActionOpen(isActionOpen === invoice.id ? null : invoice.id)}
                            aria-label={`Actions for invoice dated ${new Date(invoice.date).toLocaleDateString()}`}
                            data-tooltip-id="invoice-actions"
                            data-tooltip-content="View invoice actions"
                          >
                            Actions
                            <ChevronDown size={16} />
                          </Button>
                          {isActionOpen === invoice.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-[#2E7D7D]/10 rounded-xl shadow-lg py-2 px-4 border border-[#2E7D7D]/30 z-10">
                              <button className="w-full text-left py-1 px-2 hover:bg-[#2E7D7D]/20">Download PDF</button>
                              <button className="w-full text-left py-1 px-2 hover:bg-[#2E7D7D]/20">View Details</button>
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>

        {/* Payment Methods Section */}
        <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
          <Card className="bg-[#2E7D7D]/10 border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-semibold text-white">Payment Methods</CardTitle>
              <Button
                className="bg-[#2E7D7D] text-white font-medium hover:bg-[#2E7D7D]/80 transition-colors"
                aria-label="Add Payment Method"
                data-tooltip-id="add-method-tooltip"
                data-tooltip-content="Add a new payment method"
              >
                Add Method
              </Button>
            </CardHeader>
            <CardContent>
              {paymentMethods.map((pm) => (
                <div key={pm.id} className="flex items-center justify-between p-4 bg-[#2E7D7D]/20 rounded-lg mb-4">
                  <p className="text-white">{pm.cardType} ending in {pm.last4}</p>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="bg-red-600 hover:bg-red-700"
                    onClick={() => handleDeletePaymentMethod(pm.id)}
                    aria-label={`Remove ${pm.cardType} ending in ${pm.last4}`}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </ErrorBoundary>
  );
};

export default Billing;