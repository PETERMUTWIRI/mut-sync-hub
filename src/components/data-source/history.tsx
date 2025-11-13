// src/components/data-source/history.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";

interface Props {
  orgId: string;
}

interface HistoryItem {
  id: string;
  sourceId: string;
  status: string;
  createdAt: string;
  rowsProcessed?: number;
}

async function fetchHistory(orgId: string): Promise<HistoryItem[]> {
  if (!orgId) return [];
  const res = await fetch(`/api/datasources/history?orgId=${orgId}`);
  if (!res.ok) throw new Error("Failed to fetch history");
  return res.json();
}

export function TransferHistory({ orgId }: Props) {
  const { data: history = [], isLoading } = useQuery({
    queryKey: ["transfer-history", orgId],
    queryFn: () => fetchHistory(orgId),
    enabled: !!orgId,
    refetchInterval: 15000, // Poll every 15s
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 p-4">
        <div className="w-5 h-5 border-2 border-white/20 border-t-teal-400 rounded-full animate-spin" />
        <p className="text-gray-400">Loading activity...</p>
      </div>
    );
  }

  if (history.length === 0) {
    return <p className="text-gray-400 text-sm">No activity yet. Upload your first file!</p>;
  }

  return (
    <div className="space-y-3">
      {history.map((item: HistoryItem, i: number) => (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          key={item.id}
          className="bg-black/30 p-4 rounded-lg border border-white/5 hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="font-medium text-white truncate">{item.sourceId.slice(0, 8)}...</p>
              <p className="text-xs text-gray-400 mt-1">{new Date(item.createdAt).toLocaleString()}</p>
              {item.rowsProcessed && (
                <p className="text-xs text-gray-500 mt-1">{item.rowsProcessed.toLocaleString()} rows</p>
              )}
            </div>
            <span className={`text-xs px-2 py-1 rounded font-medium ${
              item.status === "processed" ? "bg-teal-900/30 text-teal-300" : "bg-yellow-900/30 text-yellow-300"
            }`}>
              {item.status}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}