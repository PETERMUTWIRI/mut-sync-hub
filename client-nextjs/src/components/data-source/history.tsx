"use client";
import { useEffect, useState } from "react";

type Tx = { id: string; createdAt: string; rows: number; status: "success" | "failed" };

export function TransferHistory({ socket }: { socket: any }) {
  const [hist, setHist] = useState<Tx[]>([]);

  useEffect(() => {
    if (!socket) return;
    socket.on("agentData", (payload: any) => {
      setHist((prev) =>
        [
          ...prev,
          {
            id: payload.batchId || Date.now().toString(),
            createdAt: new Date().toISOString(),
            rows: payload.rows?.length || 0,
            status: "success" as const,
          },
        ].slice(-50)
      );
    });
  }, [socket]);

  return (
    <div className="bg-[#1E2A44] border border-teal-400/20 rounded-xl p-4">
      <ul className="space-y-2 max-h-64 overflow-auto pr-2">
        {hist.length === 0 && <li className="text-sm text-gray-400">No transfers yet</li>}
        {hist.map((h) => (
          <li key={h.id} className="flex items-center justify-between text-sm">
            <span className="text-gray-300">{h.createdAt.slice(11, 19)}</span>
            <span className="text-gray-200">{h.rows} rows</span>
            <span className={`px-2 py-0.5 rounded text-xs ${h.status === "success" ? "bg-green-600" : "bg-red-600"}`}>
              {h.status}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
