"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ConnectionCards } from "@/components/data-source/connections";
import { PosCard } from "@/components/data-source/pos-card";
import { TransferHistory } from "@/components/data-source/history";
import { LiveIndicator } from "@/components/data-source/live-indicator";
import { io, Socket } from "socket.io-client";

/* ----------  helpers  ---------- */
async function getOrgProfile() {
  const res = await fetch("/api/org-profile");
  if (!res.ok) throw new Error("Unauthorized");
  return res.json() as Promise<{ orgId: string }>;
}

/* ----------  main page  ---------- */
export default function DataSourcesPage() {
  const router = useRouter();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [live, setLive] = useState(false);
  const [orgId, setOrgId] = useState("");
  const [recentRows, setRecentRows] = useState<any[]>([]);

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
    // live rows broadcast from Render
    s.on("datasource:new-rows", (payload) => {
      console.log("[ui] live rows", payload.rows);
      setRecentRows(payload.rows);
    });
    setSocket(s);
    return () => {
      s.close();
    };
  }, [orgId]);

  /* ---------- stubs (replace with real data later) ---------- */
  const usagePercent = 72;
  const monthSpend = 128_500;
  const sparkPoints = "0,40 20,25 40,30 60,15 80,20 100,10";
  const avgQuery = 123;
  const scheduleHealth = Array(20).fill(true);
  const unread = 3;
  const anomalies = 7;
  const confidence = 91;
  const insight = "Your nightly jobs run 30 % faster on weekdays—consider scaling down on weekends.";

  async function handleCreate(t: any, cfg: any): Promise<void> {
    try {
      const token = document.cookie.match(/stack-session=([^;]+)/)?.[1] || "";
      const res = await fetch("/api/connections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ type: t, config: cfg, orgId }),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        throw new Error(errText || "Failed to create connection");
      }

      const data = await res.json().catch(() => ({}));
      const id = data?.id || data?.connectionId;

      // If backend returned an id, navigate to the connection page; otherwise refresh current route.
      if (id) {
        router.push(`/connections/${id}`);
      } else {
        // refresh to show new connection in any listing on this page
        router.refresh();
      }
    } catch (err) {
      console.error("[handleCreate] error creating connection:", err);
      // minimal user feedback
      alert("Unable to create connection. See console for details.");
    }
  }
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
        {/* 1️⃣  CONNECTION CARDS  */}
        <motion.div whileHover={{ scale: 1.01 }} className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
          <h2 className="text-xl font-semibold text-cyan-400 mb-4">Add a Connection</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <ConnectionCards onAdd={(t: string, cfg: Record<string, unknown>) => handleCreate(t, cfg)} />
            </div>
        </motion.div>

        {/* 2️⃣  LIVE ROWS  */}
        {recentRows.length > 0 && (
          <motion.div whileHover={{ scale: 1.01 }} className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
            <h3 className="text-lg font-medium text-white mb-2">Live Sample</h3>
            <pre className="bg-black/30 p-3 rounded-lg overflow-auto text-xs text-gray-200">
              {JSON.stringify(recentRows, null, 2)}
            </pre>
          </motion.div>
        )}

        {/* 3️⃣  POS DETAILS CARD  */}
        <motion.div whileHover={{ scale: 1.01 }} className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
          <PosCard />
        </motion.div>

        {/* 4️⃣  REAL-TIME ACTIVITY  */}
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