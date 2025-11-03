// app/(dashboard)/data-sources/page.tsx
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

async function createDataSource(orgId: string, type: string, payload: FormData) {
  const res = await fetch("/api/datasources", {
    method: "POST",
    body: payload, // multipart – relay adds query params
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

/* ----------  main page  ---------- */
export default function DataSourcesPage() {
  const router = useRouter();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [live, setLive] = useState(false);
  const [orgId, setOrgId] = useState("");
  const [source, setSource] = useState<any>(null);

  useEffect(() => {
    getOrgProfile()
      .then(async (u) => {
        setOrgId(u.orgId);

        const fd = new FormData();
        fd.append("type", "POS_SYSTEM"); // ✅ Prisma enum value
        fd.append("name", "Auto-created POS source");
        fd.append("provider", "pos");
        /* ➜  FIX: always send config + data  */
        fd.append('config', JSON.stringify({ provider: 'pos', endpoint: '/pos/transaction' }));
        fd.append('data', JSON.stringify([])); // empty array is allowed

        const info = await createDataSource(u.orgId, "POS_SYSTEM", fd);
        setSource(info);
      })
      .catch(() => console.error("No org profile"));

    const token = document.cookie.match(/stack-session=([^;]+)/)?.[1] || "";
    const s = io(`${process.env.NEXT_PUBLIC_ORIGIN}/analytics`, {
      auth: { token },
      query: { orgId },
    });
    s.on("connect", () => setLive(true));
    s.on("disconnect", () => setLive(false));
    setSocket(s);

    return () => {
      s.close();
    };
  }, [orgId]);

    /* ---------- stubs (wire to real data later) ---------- */
  const usagePercent = 72;
  const monthSpend = 128_500;
  const sparkPoints = '0,40 20,25 40,30 60,15 80,20 100,10';
  const avgQuery = 123;
  const scheduleHealth = Array(20).fill(true);
  const unread = 3;
  const anomalies = 7;
  const confidence = 91;
  const insight = 'Your nightly jobs run 30 % faster on weekdays—consider scaling down on weekends.';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#0B1020] text-gray-100 font-inter"
    >
      {/* -------------- HEADER -------------- */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-[#0B1020]/80 backdrop-blur-xl border-b border-white/10"
      >
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Data Sources
          </h1>
          <p className="text-sm text-gray-400">
            Connect anything – APIs, databases, files or our POS plug-in.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">Live</span>
          <LiveIndicator live={live} />
        </div>
      </motion.header>

      {/* -------------- MAIN GRID -------------- */}
      <main className="p-6 max-w-7xl mx-auto grid gap-8">
        {/* 1️⃣  CONNECTION CARDS  */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md"
        >
          <h2 className="text-xl font-semibold text-cyan-400 mb-4">
            Add a Connection
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <ConnectionCards />
          </div>
        </motion.div>

        {/* 2️⃣  AUTO-CREATED POS SOURCE  */}
        {source && (
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md"
          >
            <h3 className="text-lg font-medium text-white mb-2">
              Connected Source
            </h3>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div>
                <span className="text-gray-400">Industry:</span>{' '}
                <span className="text-cyan-400">{source.industry}</span>
              </div>
              <div>
                <span className="text-gray-400">Confidence:</span>{' '}
                <span className="text-cyan-400">
                  {(source.confidence * 100).toFixed(0)} %
                </span>
              </div>
              <div>
                <span className="text-gray-400">Status:</span>{' '}
                <span className="text-green-400">{source.status}</span>
              </div>
            </div>

            {source.recentRows?.length === 0 ? (
              <p className="text-sm text-gray-400 mt-4">
                Waiting for first transactions…
              </p>
            ) : (
              <div className="mt-4 text-xs">
                <p className="text-gray-400 mb-2">Last 3 rows:</p>
                <pre className="bg-black/30 p-3 rounded-lg overflow-auto text-gray-200">
                  {JSON.stringify(source.recentRows, null, 2)}
                </pre>
              </div>
            )}
          </motion.div>
        )}

        {/* 3️⃣  POS DETAILS CARD  */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md"
        >
          <PosCard />
        </motion.div>

        {/* 4️⃣  REAL-TIME ACTIVITY  */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-cyan-400">
              Real-time Activity
            </h2>
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