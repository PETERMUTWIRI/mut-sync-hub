// src/components/admin/TransactionFeed.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { HiClock, HiCheckCircle, HiXCircle, HiBanknotes } from 'react-icons/hi2';

interface Transaction {
  id: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
  organization?: {
    name: string;
    subdomain: string;
  };
  userProfile?: {
    email: string;
  };
}

interface TransactionFeedProps {
  transactions?: Transaction[];
  isLoading?: boolean;
}

export function TransactionFeed({ transactions = [], isLoading = false }: TransactionFeedProps) {
  const statusColors = {
    PENDING: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    COMPLETED: 'bg-green-500/10 text-green-400 border-green-500/30',
    FAILED: 'bg-red-500/10 text-red-400 border-red-500/30'
  };

  const statusIcons = {
    PENDING: <HiClock className="w-4 h-4" />,
    COMPLETED: <HiCheckCircle className="w-4 h-4" />,
    FAILED: <HiXCircle className="w-4 h-4" />
  };

  if (isLoading) {
    return (
      <div className="bg-slate-900/50 border border-cyan-500/20 rounded-xl p-6 shadow-xl">
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="animate-pulse flex items-center gap-4 p-4 rounded-lg bg-slate-800/50">
              <div className="w-10 h-10 rounded-full bg-cyan-500/20"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-cyan-500/20 rounded w-3/4"></div>
                <div className="h-3 bg-slate-700/50 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!transactions.length) {
    return (
      <div className="bg-slate-900/50 border border-cyan-500/20 rounded-xl p-12 shadow-xl">
        <div className="text-center text-cyan-200/60">
          <HiBanknotes className="w-12 h-12 mx-auto mb-3 text-cyan-400/30" />
          <p className="text-lg font-medium mb-1">No transactions yet</p>
          <p className="text-sm">Recent payments will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/50 border border-cyan-500/20 rounded-xl overflow-hidden shadow-xl">
      <div className="p-4 border-b border-cyan-500/20 bg-slate-900/70">
        <h2 className="text-xl font-bold text-cyan-400 flex items-center gap-2">
          <HiBanknotes className="w-5 h-5" /> Recent Transactions
        </h2>
        <p className="text-sm text-cyan-200/70 mt-1">
          Last {transactions.length} payments across all organizations
        </p>
      </div>

      <AnimatePresence>
        <div className="divide-y divide-cyan-500/10 max-h-[500px] overflow-y-auto">
          {transactions.map((tx, idx) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.03 }}
              className="p-4 hover:bg-slate-900/40 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  {/* Status Icon */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${statusColors[tx.status]} group-hover:scale-110 transition`}>
                    {statusIcons[tx.status]}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-bold text-white ${tx.status === 'COMPLETED' ? 'text-green-400' : tx.status === 'FAILED' ? 'text-red-400' : 'text-amber-400'}`}>
                        ${tx.amount.toLocaleString()} {tx.currency}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[tx.status]}`}>
                        {tx.status}
                      </span>
                    </div>
                    
                    <div className="text-sm text-slate-400 truncate">
                      {tx.organization?.name || 'Unknown Org'} • {tx.userProfile?.email || 'Unknown User'}
                    </div>

                    <div className="text-xs text-slate-500 mt-1">
                      {new Date(tx.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Action */}
                <button className="opacity-0 group-hover:opacity-100 transition text-cyan-400 hover:text-cyan-300 text-xs p-2">
                  View Details →
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>
    </div>
  );
}