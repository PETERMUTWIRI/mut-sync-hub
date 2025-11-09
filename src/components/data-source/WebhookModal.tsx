// src/components/data-source/WebhookModal.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuid } from "uuid";
import toast from "react-hot-toast";

interface WebhookModalProps {
  onClose: () => void;
  onSuccess: (datasourceId: string) => void;
}

export function WebhookModal({ onClose, onSuccess }: WebhookModalProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const webhookPath = uuid();
  const fullUrl = typeof window !== "undefined" ? `${window.location.origin}/api/webhook/${webhookPath}` : "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      toast.error("Please provide a connection name");
      return;
    }
    setLoading(true);
    setProgress(0);

    try {
      const fd = new FormData();
      fd.append("type", "WEBHOOK");
      fd.append("name", name);
      fd.append("provider", "webhook");
      fd.append("config", JSON.stringify({ webhook: true, path: webhookPath }));

      const tick = setInterval(() => setProgress((p) => (p >= 90 ? 90 : p + 10)), 150);
      toast.loading("Creating webhook inbox…");

      const res = await fetch("/api/datasources", { method: "POST", body: fd });
      if (!res.ok) throw new Error(await res.text());
      
      const { id } = await res.json();

      clearInterval(tick);
      setProgress(100);
      toast.success("Webhook inbox created");
      toast.success(`Webhook registered at ${webhookPath}`);

      onSuccess(id);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to create webhook inbox");
      console.error("[WebhookModal] Error:", err);
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-cyan-400">Webhook Inbox</h3>
        <button type="button" onClick={onClose} className="text-gray-400 hover:text-white text-2xl">✕</button>
      </div>

      <input
        required
        placeholder="Connection name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full rounded-lg bg-black/60 px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
      />

      <div className="rounded-lg bg-black/60 p-3 break-all text-sm text-gray-300">
        POST to: <span className="text-teal-300">{fullUrl}</span>
      </div>

      {loading && (
        <div className="w-full bg-black/40 rounded h-2 overflow-hidden">
          <div className="bg-teal-400 h-2 transition-all duration-150" style={{ width: `${progress}%` }} />
          <p className="text-xs text-gray-300 mt-1">{progress}%</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-teal-600 hover:bg-teal-500 disabled:opacity-50 px-4 py-2 font-medium text-white"
      >
        {loading ? "Creating inbox…" : "Create webhook inbox"}
      </button>
    </form>
  );
}