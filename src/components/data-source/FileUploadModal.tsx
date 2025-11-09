// src/components/data-source/FileUploadModal.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface FileUploadModalProps {
  onClose: () => void;
  onSuccess: (datasourceId: string) => void;
}

export function FileUploadModal({ onClose, onSuccess }: FileUploadModalProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [delimiter, setDelimiter] = useState(",");
  const [hasHeaders, setHasHeaders] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please choose a CSV file");
      return;
    }

    setIsProcessing(true);
    const toastId = toast.loading("📁 Validating file...");

    try {
      // Step 1: Create Datasource Record
      toast.loading("📝 Creating datasource entry...", { id: toastId });
      const fd = new FormData();
      fd.append("type", "FILE_IMPORT"); // Changed from FILE_IMPORT for consistency
      fd.append("name", name || file.name);
      fd.append("provider", "csv");
      fd.append("config", JSON.stringify({ delimiter, hasHeaders }));

      console.log(`[upload] 📤 creating datasource for ${file.name}...`);
      const createRes = await fetch("/api/datasources", { method: "POST", body: fd });
      if (!createRes.ok) throw new Error(await createRes.text());
      
      const { id: datasourceId } = await createRes.json();
      console.log(`[upload] ✅ datasource created: ${datasourceId}`);
      
      // Step 2: Upload to Cloud (this now happens in /api/datasources)
      toast.loading("☁️ Uploading to cloud storage...", { id: toastId });
      
      // Step 3: Trigger Processing Pipeline
      toast.loading("🚀 Starting data pipeline...", { id: toastId });
      console.log(`[upload] 🎯 triggering pipeline for ${datasourceId}...`);
      
      const triggerRes = await fetch(`/api/datasources/${datasourceId}/trigger`, { 
        method: "POST" 
      });
      if (!triggerRes.ok) throw new Error(`Pipeline failed: ${await triggerRes.text()}`);
      
      console.log(`[upload] ✅ pipeline triggered successfully`);
      
      // Final Success: Show Datasource ID
      toast.success(
        <div>
          <div className="font-semibold">✅ Upload Complete!</div>
          <div className="text-xs mt-1">Datasource ID: <code className="bg-black/30 px-1 py-0.5 rounded">{datasourceId}</code></div>
          <div className="text-xs text-gray-400">Data will appear in ~10 seconds</div>
        </div>,
        { id: toastId, duration: 6000 }
      );

      // Notify parent and close
      onSuccess(datasourceId);
      
    } catch (err: any) {
      console.error("[upload] ❌", err);
      toast.error(
        <div>
          <div className="font-semibold">❌ Upload Failed</div>
          <div className="text-xs text-gray-400 mt-1">{err.message}</div>
        </div>,
        { id: toastId }
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-xl font-semibold text-cyan-400">📊 Upload CSV File</h3>
        <button 
          type="button" 
          onClick={onClose} 
          className="text-gray-400 hover:text-white text-2xl transition-colors"
          disabled={isProcessing}
        >
          ✕
        </button>
      </div>

      <div className="space-y-4">
        <input
          required
          placeholder="Data source name (e.g., Store Sales Data)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg bg-black/60 px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all"
          disabled={isProcessing}
        />

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">CSV File</label>
          <input
            type="file"
            accept=".csv,.txt"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-teal-600 file:text-white hover:file:bg-teal-500 disabled:opacity-50 cursor-pointer"
            disabled={isProcessing}
          />
          {file && (
            <div className="mt-2 text-xs text-gray-400 bg-black/30 px-2 py-1 rounded inline-block">
              📄 {file.name} ({(file.size / 1024).toFixed(1)} KB)
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Delimiter</label>
            <select 
              value={delimiter} 
              onChange={(e) => setDelimiter(e.target.value)}
              className="w-full rounded-lg bg-black/60 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-400 disabled:opacity-50"
              disabled={isProcessing}
            >
              <option value=",">Comma (,)</option>
              <option value=";">Semicolon (;)</option>
              <option value="\t">Tab</option>
              <option value="|">Pipe (|)</option>
            </select>
          </div>

          <div className="flex items-center gap-2 pt-6">
            <input 
              type="checkbox" 
              checked={hasHeaders} 
              onChange={(e) => setHasHeaders(e.target.checked)}
              className="rounded text-teal-500 focus:ring-teal-400"
              disabled={isProcessing}
              id="hasHeaders"
            />
            <label htmlFor="hasHeaders" className="text-sm text-gray-300">First row has headers</label>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isProcessing || !file}
        className="w-full rounded-lg bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 font-medium text-white transition-all transform hover:scale-[1.02]"
      >
        {isProcessing ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-teal-300 rounded-full animate-spin"></span>
            Processing...
          </span>
        ) : (
          "🚀 Upload & Process"
        )}
      </button>

      {isProcessing && (
        <div className="text-xs text-gray-400 bg-black/30 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></span>
            <span>Uploading to secure cloud storage...</span>
          </div>
          <div className="ml-4 text-gray-500">• Datasource ID will be generated</div>
          <div className="ml-4 text-gray-500">• Data pipeline will auto-start</div>
        </div>
      )}
    </form>
  );
}