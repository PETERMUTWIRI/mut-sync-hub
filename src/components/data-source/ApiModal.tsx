// src/components/data-source/ApiModal.tsx
"use client";
import { useState } from "react";
import toast from "react-hot-toast";

interface ApiModalProps {
  onClose: () => void;
  onSuccess: (datasourceId: string) => void;
}

export function ApiModal({ onClose, onSuccess }: ApiModalProps) {
  const [name, setName] = useState("");
  const [endpoint, setEndpoint] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!endpoint) {
      toast.error("Please provide an endpoint");
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("type", "API");
      fd.append("name", name || "REST API Source");
      fd.append("provider", "api");
      fd.append("config", JSON.stringify({
        endpoint,
        apiKey,
        method: "GET",
        headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {},
      }));

      const res = await fetch("/api/datasources", { method: "POST", body: fd });
      if (!res.ok) throw new Error(await res.text());
      
      const { id } = await res.json();
      onSuccess(id);
    } catch (err: any) {
      toast.error(err.message || "Failed to create API source");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-cyan-400">Connect REST API</h3>
        <button type="button" onClick={onClose} className="text-gray-400 hover:text-white text-2xl">✕</button>
      </div>

      <input
        required
        placeholder="Connection name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full rounded-lg bg-black/60 px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
      />

      <input
        required
        placeholder="https://api.example.com/data"
        value={endpoint}
        onChange={(e) => setEndpoint(e.target.value)}
        className="w-full rounded-lg bg-black/60 px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
      />

      <input
        placeholder="API Key (optional)"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        type="password"
        className="w-full rounded-lg bg-black/60 px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-teal-600 hover:bg-teal-500 disabled:opacity-50 px-4 py-2 font-medium text-white"
      >
        {loading ? "Connecting..." : "Connect API"}
      </button>
    </form>
  );
}