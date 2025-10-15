"use client";
import { useState } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import { ConnectionModal } from "./modals/connection-modal";

const types = [
  { key: "api", title: "REST / GraphQL API", desc: "POST / GET endpoints with key.", icon: "🔗", color: "bg-[#2E7D7D]/20" },
  { key: "database", title: "SQL Database", desc: "MySQL, Postgres, SQL Server, SQLite.", icon: "🗄️", color: "bg-[#2E7D7D]/20" },
  { key: "file", title: "File / CSV drop", desc: "Upload or watch S3 / local folder.", icon: "📁", color: "bg-[#2E7D7D]/20" },
  { key: "webhook", title: "Webhook inbox", desc: "We expose a URL you POST to.", icon: "📨", color: "bg-[#2E7D7D]/20" },
] as const;

export function ConnectionCards() {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<string | null>(null);

  function openModal(k: string) {
    setKind(k);
    setOpen(true);
  }

  return (
    <>
      {types.map((t) => (
        <button
          key={t.key}
          onClick={() => openModal(t.key)}
          className={`${t.color} rounded-xl p-5 text-left hover:ring-2 hover:ring-teal-400 transition`}
        >
          <div className="flex items-start justify-between">
            <span className="text-2xl">{t.icon}</span>
            <PlusIcon className="w-5 h-5 text-teal-300" />
          </div>
          <h3 className="mt-3 font-semibold">{t.title}</h3>
          <p className="text-xs text-gray-300 mt-1">{t.desc}</p>
        </button>
      ))}
      <ConnectionModal open={open} setOpen={setOpen} type={kind} />
    </>
  );
}
