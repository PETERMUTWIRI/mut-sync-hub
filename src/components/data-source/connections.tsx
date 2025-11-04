"use client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const cards = [
  { type: "FILE_IMPORT", title: "Upload CSV", desc: "Drop a spreadsheet", icon: "📁" },
  { type: "POS_SYSTEM",  title: "POS Plug-in", desc: "Connect your till", icon: "🛒" },
  { type: "API",         title: "REST API",  desc: "Any HTTP endpoint", icon: "🔌" },
  { type: "DATABASE",    title: "Database",  desc: "Postgres, MySQL …", icon: "🗃️" },
];

export function ConnectionCards({ onAdd }: { onAdd: (t: string, cfg: any) => void }) {
  const router = useRouter();

  async function handleAdd(type: string, defaultCfg: any) {
    const fd = new FormData();
    fd.append("type", type);
    fd.append("name", `${type} source`);
    fd.append("provider", type.toLowerCase());
    fd.append("config", JSON.stringify(defaultCfg));
    fd.append("data", JSON.stringify([]));

    const res = await fetch("/api/datasources", { method: "POST", body: fd });
    if (!res.ok) return alert(await res.text());
    router.refresh();
  }

  return (
    <>
      {cards.map((c) => (
        <motion.button
          key={c.type}
          whileHover={{ scale: 1.05 }}
          onClick={() =>
            handleAdd(c.type, {
              provider: c.type.toLowerCase(),
              endpoint: c.type === "API" ? "/api/v1/events" : undefined,
              path: c.type === "DATABASE" ? "postgres://localhost:5432/pos" : undefined,
            })
          }
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