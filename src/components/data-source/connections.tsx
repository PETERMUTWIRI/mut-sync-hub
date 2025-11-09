// components/data-source/connections.tsx
"use client";
import { motion } from "framer-motion";

// src/components/data-source/connections.tsx
const cards = [
  { type: "FILE_IMPORT", title: "Upload CSV", desc: "Drop a spreadsheet", icon: "📁" },
  { type: "POS_SYSTEM",  title: "POS Plug-in", desc: "Connect your till", icon: "🛒" },
  { type: "API",         title: "REST API",  desc: "Any HTTP endpoint", icon: "🔌" },
  { type: "DATABASE",    title: "Database",  desc: "Postgres, MySQL …", icon: "🗃️" },
  { type: "WEBHOOK",     title: "Webhook",   desc: "Receive POST requests", icon: "📨" }, // NEW
];
interface ConnectionCardsProps {
  onOpenModal: (type: string) => void;
}

export function ConnectionCards({ onOpenModal }: ConnectionCardsProps) {
  return (
    <>
      {cards.map((c) => (
        <motion.button
          key={c.type}
          whileHover={{ scale: 1.05 }}
          onClick={() => onOpenModal(c.type)}
          className="flex flex-col items-center justify-center gap-2 rounded-xl bg-white/10 p-4 hover:bg-white/20 transition"
        >
          <div className="text-2xl">{c.icon}</div>
          <div className="text-sm font-semibold text-white">{c.title}</div>
          <div className="text-xs text-gray-400">{c.desc}</div>
        </motion.button>
      ))}
    </>
  );
}