// app/connections/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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

export default function DataSourcesPage() {
  const router = useRouter();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [live, setLive] = useState(false);
  const [orgId, setOrgId] = useState("");
  const [recentRows, setRecentRows] = useState<any[]>([]);
  const [openModal, setOpenModal] = useState<string | null>(null);

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

  // Modal submission handlers (modals will call these)
  const handleModalSuccess = (datasourceId: string) => {
    setOpenModal(null);
    // Trigger processing
    fetch(`/api/datasources/${datasourceId}/trigger`, { method: "POST" });
    router.refresh();
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
        </div>
      </motion.header>

      <main className="p-6 max-w-7xl mx-auto grid gap-8">
        {/* 1️⃣  CONNECTION CARDS - NOW JUST MODAL TRIGGERS */}
        <motion.div whileHover={{ scale: 1.01 }} className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
          <h2 className="text-xl font-semibold text-cyan-400 mb-4">Add a Connection</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <ConnectionCards onOpenModal={setOpenModal} />
          </div>
        </motion.div>

        {/* 2️⃣  MODALS (CONDITIONALLY RENDERED) */}
        <AnimatePresence>
          {openModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
              onClick={() => setOpenModal(null)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-[#1A1F2E] rounded-2xl p-6 max-w-2xl w-full mx-4"
                onClick={(e) => e.stopPropagation()}
              >
                {openModal === "FILE_IMPORT" && (
                  <FileUploadModal 
                    onClose={() => setOpenModal(null)} 
                    onSuccess={handleModalSuccess}
                  />
                )}
                {openModal === "POS_SYSTEM" && (
                  <PosModal 
                    onClose={() => setOpenModal(null)} 
                    onSuccess={handleModalSuccess}
                  />
                )}
                {openModal === "WEBHOOK" && (
                  <WebhookModal  
                    onClose={() => setOpenModal(null)} 
                    onSuccess={handleModalSuccess} 
                  />
                )}
                {openModal === "API" && (
                  <ApiModal 
                    onClose={() => setOpenModal(null)} 
                    onSuccess={handleModalSuccess}
                  />
                )}
                {openModal === "DATABASE" && (
                  <DatabaseModal 
                    onClose={() => setOpenModal(null)} 
                    onSuccess={handleModalSuccess}
                  />
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 3️⃣  LIVE ROWS  */}
        {recentRows.length > 0 && (
          <motion.div whileHover={{ scale: 1.01 }} className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
            <h3 className="text-lg font-medium text-white mb-2">Live Sample</h3>
            <pre className="bg-black/30 p-3 rounded-lg overflow-auto text-xs text-gray-200">
              {JSON.stringify(recentRows, null, 2)}
            </pre>
          </motion.div>
        )}

        {/* 4️⃣  TRANSFER HISTORY  */}
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