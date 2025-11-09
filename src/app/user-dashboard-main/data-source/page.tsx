// app/connections/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { ConnectionCards } from "@/components/data-source/connections";
import { FileUploadModal } from "@/components/data-source/FileUploadModal";
import { WebhookModal } from "@/components/data-source/WebhookModal";
import { ApiModal } from "@/components/data-source/ApiModal";
import { DatabaseModal } from "@/components/data-source/DatabaseModal";
import { PosModal } from "@/components/data-source/PosModal";
import { TransferHistory } from "@/components/data-source/history";
import { LiveIndicator } from "@/components/data-source/live-indicator";
import { io, Socket } from "socket.io-client";

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

export default function DataSourcesPage() {
  const router = useRouter();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [live, setLive] = useState(false);
  const [orgId, setOrgId] = useState("");
  const [recentRows, setRecentRows] = useState<any[]>([]);
  const [openModal, setOpenModal] = useState<string | null>(null);
  const [activePipelines, setActivePipelines] = useState<DataSource[]>([]);
  const [isPolling, setIsPolling] = useState(false);

  // Socket.io connection
  useEffect(() => {
    getOrgProfile()
      .then((u) => setOrgId(u.orgId))
      .catch(() => console.error("No org profile"));

    const token = document.cookie.match(/stack-session=([^;]+)/)?.[1] || "";
    const s = io(`${process.env.NEXT_PUBLIC_ORIGIN}/analytics`, {
      auth: { token },
      query: { orgId },
    });
    s.on("connect", () => setLive(true));
    s.on("disconnect", () => setLive(false));
    s.on("datasource:new-rows", (payload) => {
      console.log("[ui] live rows", payload.rows);
      setRecentRows(payload.rows);
    });
    setSocket(s);
    return () => { s.close(); };
  }, [orgId]);

  // Poll for active pipelines
  useEffect(() => {
    if (!orgId) return;

    const pollActive = async () => {
      setIsPolling(true);
      try {
        const res = await fetch(`/api/datasources?orgId=${orgId}&status=ACTIVE,PENDING`);
        const sources = await res.json();
        // Show only recently created (< 5 mins) to keep UI clean
        const recent = sources.filter((s: DataSource) => 
          new Date(s.createdAt).getTime() > Date.now() - 5 * 60 * 1000
        );
        setActivePipelines(recent);
      } catch (err) {
        console.error("[poll] failed:", err);
      } finally {
        setIsPolling(false);
      }
    };

    pollActive(); // Initial load
    const interval = setInterval(pollActive, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [orgId]);

  const handleModalSuccess = (datasourceId: string) => {
    setOpenModal(null);
    // Show immediate feedback
    toast.success(`🎉 Datasource ${datasourceId.slice(0, 8)}... is live!`);
    router.refresh();
  };

  const handleModalClose = () => {
    setOpenModal(null);
  };

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
          <LiveIndicator live={live} />
          {isPolling && (
            <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></span>
          )}
        </div>
      </motion.header>

      <main className="p-6 max-w-7xl mx-auto grid gap-8">
        {/* 🔥 ACTIVE PIPELINES - NEW LIVELINESS SECTION */}
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
                      <p className="text-xs text-gray-400 mt-1">
                        Type: {ds.type} | ID: {ds.id.slice(0, 8)}...
                      </p>
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
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
              onClick={handleModalClose}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-[#1A1F2E] rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
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

        {/* 3️⃣ LIVE DATA SAMPLE */}
        {recentRows.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md"
          >
            <h3 className="text-lg font-medium text-white mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Live Data Sample
            </h3>
            <pre className="bg-black/30 p-3 rounded-lg overflow-auto text-xs text-gray-200 max-h-64">
              {JSON.stringify(recentRows, null, 2)}
            </pre>
          </motion.div>
        )}

        {/* 4️⃣ TRANSFER HISTORY */}
        <motion.div whileHover={{ scale: 1.01 }} className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-cyan-400">Real-time Activity</h2>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-400">Live</span>
              <LiveIndicator live={live} />
            </div>
          </div>
          <TransferHistory socket={socket} />
        </motion.div>
      </main>
    </motion.div>
  );
}