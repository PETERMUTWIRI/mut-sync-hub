
// app/connections/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import { ConnectionCards } from "@/components/data-source/connections";
import { FileUploadModal } from "@/components/data-source/FileUploadModal";
import { WebhookModal } from "@/components/data-source/WebhookModal";
import { ApiModal } from "@/components/data-source/ApiModal";
import { DatabaseModal } from "@/components/data-source/DatabaseModal";
import { PosModal } from "@/components/data-source/PosModal";
import { TransferHistory } from "@/components/data-source/history";
import { LiveIndicator } from "@/components/data-source/live-indicator";

async function getOrgProfile() {
  const res = await fetch("/api/org-profile");
  if (!res.ok) throw new Error("Unauthorized");
  return res.json() as Promise<{ orgId: string }>;
}

interface DataSource {
  id: string;
  name: string;
  type: string;
  status: string;
  createdAt: string;
}

interface IngestionResult {
  id: string;
  industry: string;
  confidence: number;
  recentRows: any[];
  rowsProcessed: number;
  schemaColumns: string[];
  status: string;
}

export default function DataSourcesPage() {
  const router = useRouter();
  const [orgId, setOrgId] = useState<string>("");
  const [openModal, setOpenModal] = useState<string | null>(null);
  const [pendingDatasourceId, setPendingDatasourceId] = useState<string | null>(null);
  const [activePipelines, setActivePipelines] = useState<DataSource[]>([]);
  const [isPolling, setIsPolling] = useState(false);

  // ✅ Fetch orgId first
  useEffect(() => {
    getOrgProfile()
      .then((profile) => {
        console.log("✅ [DataSourcesPage] orgId loaded:", profile.orgId);
        setOrgId(profile.orgId);
      })
      .catch(() => console.error("No org profile"));
  }, [router]);

  // ✅ Poll for ingestion result
  const { data: liveActivity, isLoading: polling } = useQuery<IngestionResult | null>({
    queryKey: ["ingestion-result", orgId, pendingDatasourceId],
    queryFn: async () => {
      
      console.log('🔄 [ingestion-poll] Fetching for:', { orgId, datasourceId: pendingDatasourceId });
      if (!pendingDatasourceId || !orgId) return null;
      const res = await fetch(
        `/api/ingestion-poll?orgId=${orgId}&datasourceId=${pendingDatasourceId}`
      );
      if (!res.ok) throw new Error("Failed to poll");
      return res.json();
    },
    enabled: Boolean(orgId && pendingDatasourceId),
    refetchInterval: (query) => {
      const data = query.state.data as IngestionResult | null;
      if (data && data.status === "processed") return false;
      return 2000;
    },
    staleTime: 0,
  });

  
  // ✅ AUTO-DETECT AND POLL NEWEST PIPELINE
  useEffect(() => {
    if (!orgId) return;
  
   const pollActive = async () => {
     setIsPolling(true);
     try {
       const res = await fetch(`/api/datasources?orgId=${orgId}&status=ACTIVE,PENDING`);
        const sources = await res.json();
        const recent = sources.filter(
         (s: DataSource) => new Date(s.createdAt).getTime() > Date.now() - 5 * 60 * 1000
       );
       setActivePipelines(recent);
      
        // 🎯 AUTO-POLL THE NEWEST PIPELINE
        if (recent.length > 0 && !pendingDatasourceId) {
          const newest = recent[0];
         console.log('🎯 Auto-polling newest datasource:', newest.id);
          setPendingDatasourceId(newest.id);
        }
      } catch (err) {
        console.error("[poll] failed:", err);
      } finally {
      setIsPolling(false);
      }
    };
  
  pollActive();
  const interval = setInterval(pollActive, 5000); // Poll faster
  return () => clearInterval(interval);
}, [orgId, pendingDatasourceId]); // Add pendingDatasourceId to dependencies

  const handleModalSuccess = (datasourceId: string) => {
    console.log("🎯 Starting poll for:", datasourceId);
    setOpenModal(null);
    setPendingDatasourceId(datasourceId);
    toast.loading("⏳ Processing data...", { duration: 10000 });
  };

  const handleModalClose = () => setOpenModal(null);
  const dismissLiveResult = () => setPendingDatasourceId(null);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#0B1020] text-gray-100 font-inter"
    >
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-[#0B1020]/80 backdrop-blur-xl border-b border-white/10"
      >
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Data Sources
          </h1>
          <p className="text-sm text-gray-400">Connect anything – APIs, databases, files or our POS plug-in.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">Live</span>
          <LiveIndicator live={!isPolling} />
          {isPolling && <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" />}
        </div>
      </motion.header>

      <main className="p-6 max-w-7xl mx-auto grid gap-8">
        {/* 🔥 ACTIVE PIPELINES */}
        <AnimatePresence>
          {activePipelines.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border border-teal-400/30 rounded-2xl p-6 backdrop-blur-md"
            >
              <h3 className="text-lg font-semibold text-teal-400 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></span>
                Active Data Pipelines
              </h3>
              <div className="space-y-3">
                {activePipelines.map((ds) => (
                  <motion.div
                    key={ds.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="bg-black/40 p-4 rounded-lg border border-white/5 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-white">{ds.name}</p>
                      <p className="text-xs text-gray-400 mt-1">Type: {ds.type} | ID: {ds.id.slice(0, 8)}...</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-teal-300 bg-teal-900/30 px-2 py-1 rounded">
                        {ds.status}
                      </span>
                      <div className="w-5 h-5 border-2 border-white/20 border-t-teal-400 rounded-full animate-spin"></div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 1️⃣ CONNECTION CARDS */}
        <motion.div whileHover={{ scale: 1.01 }} className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
          <h2 className="text-xl font-semibold text-cyan-400 mb-4">Add a Connection</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <ConnectionCards onOpenModal={setOpenModal} />
          </div>
        </motion.div>

        {/* 2️⃣ MODALS */}
        <AnimatePresence>
          {openModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm"
              onClick={handleModalClose}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-[#1A1F2E] rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-white/10"
                onClick={(e) => e.stopPropagation()}
              >
                {openModal === "FILE_IMPORT" && (
                  <FileUploadModal onClose={handleModalClose} onSuccess={handleModalSuccess} />
                )}
                {openModal === "POS_SYSTEM" && (
                  <PosModal onClose={handleModalClose} onSuccess={handleModalSuccess} />
                )}
                {openModal === "WEBHOOK" && (
                  <WebhookModal onClose={handleModalClose} onSuccess={handleModalSuccess} />
                )}
                {openModal === "API" && (
                  <ApiModal onClose={handleModalClose} onSuccess={handleModalSuccess} />
                )}
                {openModal === "DATABASE" && (
                  <DatabaseModal onClose={handleModalClose} onSuccess={handleModalSuccess} />
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 3️⃣ POLLING LOADING STATE */}
        {polling && pendingDatasourceId && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/40 border border-white/10 rounded-2xl p-6 backdrop-blur-md"
          >
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-white/20 border-t-teal-400 rounded-full animate-spin" />
              <div>
                <p className="text-white font-medium">Processing your data...</p>
                <p className="text-xs text-gray-400">This usually takes 5-15 seconds</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* 4️⃣ LIVE INGESTION RESULT */}
        {liveActivity && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border border-teal-400/30 rounded-2xl p-6 backdrop-blur-md"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-teal-400 flex items-center gap-2">
                <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" />
                Live Pipeline: {liveActivity.id.slice(0, 8)}...
              </h3>
              <button
                onClick={dismissLiveResult}
                className="text-xs text-gray-400 hover:text-white transition-colors"
              >
                Dismiss
              </button>
            </div>

            {/* Industry Detection */}
            <div className="bg-black/40 p-4 rounded-lg mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Industry Detected</p>
                  <p className="text-xl font-bold text-white capitalize">{liveActivity.industry}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">Confidence</p>
                  <p className="text-xl font-bold text-teal-400">
                    {(liveActivity.confidence * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            {/* Data Preview Table */}
            <div className="bg-black/40 rounded-lg overflow-hidden border border-white/5">
              <div className="px-4 py-2 bg-teal-900/20 border-b border-teal-400/20">
                <p className="text-sm text-teal-300">
                  {liveActivity.rowsProcessed.toLocaleString()} rows processed
                </p>
              </div>
              <div className="overflow-x-auto max-h-80">
                <table className="w-full text-xs">
                  <thead className="bg-black/60 sticky top-0">
                    <tr>
                      {liveActivity.schemaColumns.slice(0, 6).map((col: string) => (
                        <th key={col} className="text-left px-3 py-2 text-gray-400 border-b border-white/5">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {liveActivity.recentRows.map((row: any, i: number) => (
                      <motion.tr
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={i}
                        className="border-b border-white/5 hover:bg-white/5"
                      >
                        {liveActivity.schemaColumns.slice(0, 6).map((col: string) => (
                          <td key={col} className="px-3 py-2 text-gray-200">
                            {typeof row[col] === "string" && row[col].length > 30
                              ? `${row[col].substring(0, 30)}...`
                              : String(row[col] ?? "—")}
                          </td>
                        ))}
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* 5️⃣ TRANSFER HISTORY */}
        <motion.div whileHover={{ scale: 1.01 }} className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-cyan-400">Real-time Activity</h2>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-400">Auto-refresh</span>
              <LiveIndicator live={!isPolling} />
            </div>
          </div>
          <TransferHistory orgId={orgId} />
        </motion.div>
      </main>
    </motion.div>
  );
}