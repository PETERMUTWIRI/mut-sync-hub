// components/data-source/history.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';

interface HistoryItem {
  id: string;
  name: string;
  type: string;
  status: string;
  createdAt: string;
  rowsProcessed: number;
}

export function TransferHistory({ orgId }: { orgId: string }) {
  const { data, isLoading } = useQuery<HistoryItem[]>({
    queryKey: ['transfer-history', orgId],
    queryFn: async () => {
      const res = await fetch('/api/datasources/history');
      if (!res.ok) throw new Error('Failed to fetch history');
      return res.json();
    },
    enabled: !!orgId,
    refetchInterval: 5000, // Auto-refresh every 5 seconds
  });

  console.log('🔍 [TransferHistory] Data:', data); // Add this debug log

  if (isLoading) {
    return <div className="text-gray-400">Loading activity...</div>;
  }

  if (!data || data.length === 0) {
    return <p className="text-gray-400">No activity yet. Upload your first file!</p>;
  }

  return (
    <div className="space-y-3">
      {data.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="bg-black/40 p-4 rounded-lg border border-white/5 hover:bg-black/60 transition-colors"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <p className="font-medium text-white">{item.name}</p>
              <p className="text-xs text-gray-400 mt-1">
                <span className="capitalize">{item.type}</span> • {item.rowsProcessed.toLocaleString()} rows
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(item.createdAt).toLocaleString()}
              </p>
            </div>
            <span className={`text-xs px-2 py-1 rounded font-medium ${
              item.status === 'PROCESSED' 
                ? 'bg-teal-900/30 text-teal-300' 
                : item.status === 'PENDING'
                ? 'bg-yellow-900/30 text-yellow-300'
                : 'bg-red-900/30 text-red-300'
            }`}>
              {item.status}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}