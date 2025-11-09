// src/components/data-source/PosModal.tsx
"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import { CloudArrowDownIcon } from "@heroicons/react/24/outline";

interface PosModalProps {
  onClose: () => void;
  onSuccess: (datasourceId: string) => void;
}

export function PosModal({ onClose, onSuccess }: PosModalProps) {
  // Static download URL (your .exe file)
  const exeUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/agent/analytics-edge-agent.exe` 
    : "";

  // Form state
  const [storeName, setStoreName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDownload, setShowDownload] = useState(false);
  const [datasourceId, setDatasourceId] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Create datasource entry
      const fd = new FormData();
      fd.append("type", "POS_SYSTEM");
      fd.append("name", storeName || "POS System");
      fd.append("provider", "pos");
      fd.append("config", JSON.stringify({
        storeName,
        pluginVersion: "1.0.0",
        exePath: exeUrl,
      }));

      const res = await fetch("/api/datasources", { method: "POST", body: fd });
      if (!res.ok) throw new Error(await res.text());
      
      const { id } = await res.json();
      setDatasourceId(id);

      // 2. Trigger n8n (starts listening for POS data)
      await fetch(`/api/datasources/${id}/trigger`, { method: "POST" });

      // 3. Show download section
      setShowDownload(true);
      toast.success("POS datasource ready! Download and install the agent.");
      
      onSuccess(id); // Notify parent page
    } catch (err: any) {
      toast.error(err.message || "Failed to setup POS");
    } finally {
      setLoading(false);
    }
  };

  // Download handler
  const handleDownload = () => {
    // The .exe name should include store name for identification
    const fileName = storeName ? `${storeName.replace(/\s+/g, '-').toLowerCase()}-pos-agent.exe` : 'analytics-edge-agent.exe';
    
    const a = document.createElement('a');
    a.href = exeUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    toast.success("Download started! Run the installer to connect your POS.");
  };

  // If showing download, render the download UI
  if (showDownload) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-orange-400">POS Agent Download</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">✕</button>
        </div>

        <div className="bg-black/60 rounded-xl p-6 border border-orange-400/30">
          <div className="flex items-center gap-4">
            <CloudArrowDownIcon className="w-10 h-10 text-orange-400" />
            <div>
              <h3 className="text-lg font-semibold">Kenya POS plug-in (no API needed)</h3>
              <p className="text-sm text-gray-300">Detects QuickBooks, Odoo, MS-SQL, Access, CSV – streams instantly.</p>
            </div>
          </div>

          <ol className="list-decimal ml-5 mt-4 text-sm space-y-1 text-gray-200">
            <li>Click download – save the <code className="text-orange-400">.exe</code> anywhere.</li>
            <li>Double-click → Windows registers it as a service.</li>
            <li>Done. Data appears below within 30 seconds.</li>
          </ol>

          <div className="mt-4 flex gap-3">
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-500 px-4 py-2 rounded-lg text-sm font-medium"
            >
              <CloudArrowDownIcon className="w-4 h-4" />
              Download Agent (12 MB)
            </button>
            <button
              className="px-4 py-2 rounded-lg text-sm border border-orange-400 text-orange-300 hover:bg-orange-900/20"
              onClick={() => navigator.clipboard.writeText(exeUrl)}
            >
              Copy link
            </button>
          </div>

          <div className="mt-4 p-3 bg-black/30 rounded-lg text-xs text-gray-400">
            <p>📌 <strong>Datasource ID:</strong> <code className="text-orange-400">{datasourceId}</code> (for support)</p>
          </div>
        </div>

        <button onClick={onClose} className="w-full px-4 py-2 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-800">
          Close
        </button>
      </div>
    );
  }

  // Otherwise, show the form
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-orange-400">POS Plugin Setup</h3>
        <button type="button" onClick={onClose} className="text-gray-400 hover:text-white text-2xl">✕</button>
      </div>

      <p className="text-sm text-gray-400">
        Enter your store name to generate a dedicated POS agent download.
      </p>

      <input
        required
        placeholder="Store/Branch Name"
        value={storeName}
        onChange={(e) => setStoreName(e.target.value)}
        className="w-full rounded-lg bg-black/60 px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-orange-600 hover:bg-orange-500 disabled:opacity-50 px-4 py-2 rounded-lg text-white font-medium"
      >
        {loading ? "Setting up..." : "Generate & Download Plugin"}
      </button>
    </form>
  );
}