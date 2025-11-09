// src/components/data-source/DatabaseModal.tsx
"use client";
import { useState } from "react";
import toast from "react-hot-toast";

interface DatabaseModalProps {
  onClose: () => void;
  onSuccess: (datasourceId: string) => void;
}

export function DatabaseModal({ onClose, onSuccess }: DatabaseModalProps) {
  const [name, setName] = useState("");
  const [host, setHost] = useState("localhost");
  const [port, setPort] = useState("5432");
  const [database, setDatabase] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const fd = new FormData();
      fd.append("type", "DATABASE");
      fd.append("name", name || "Database Source");
      fd.append("provider", "postgres");
      fd.append("config", JSON.stringify({
        host,
        port: parseInt(port),
        database,
        username,
        password,
        ssl: true,
      }));

      const res = await fetch("/api/datasources", { method: "POST", body: fd });
      if (!res.ok) throw new Error(await res.text());
      
      const { id } = await res.json();
      onSuccess(id);
    } catch (err: any) {
      toast.error(err.message || "Failed to create database source");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-cyan-400">Connect Database</h3>
        <button type="button" onClick={onClose} className="text-gray-400 hover:text-white text-2xl">✕</button>
      </div>

      <input required placeholder="Connection name" value={name} onChange={(e) => setName(e.target.value)} className="w-full" />

      <div className="grid grid-cols-2 gap-3">
        <input required placeholder="Host" value={host} onChange={(e) => setHost(e.target.value)} className="w-full rounded-lg bg-black/60 px-3 py-2 text-white" />
        <input required placeholder="Port" value={port} onChange={(e) => setPort(e.target.value)} className="w-full rounded-lg bg-black/60 px-3 py-2 text-white" />
      </div>

      <input required placeholder="Database name" value={database} onChange={(e) => setDatabase(e.target.value)} className="w-full rounded-lg bg-black/60 px-3 py-2 text-white" />
      <input required placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full rounded-lg bg-black/60 px-3 py-2 text-white" />
      <input required placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="w-full rounded-lg bg-black/60 px-3 py-2 text-white" />

      <button type="submit" disabled={loading} className="w-full bg-teal-600 hover:bg-teal-500 disabled:opacity-50 px-4 py-2 rounded-lg text-white font-medium">
        {loading ? "Connecting..." : "Connect Database"}
      </button>
    </form>
  );
}