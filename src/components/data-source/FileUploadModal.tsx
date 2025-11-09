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
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please choose a CSV file");
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("type", "FILE_IMPORT");
      fd.append("name", name || file.name);
      fd.append("provider", "file");
      fd.append("config", JSON.stringify({ 
        delimiter,
        hasHeaders,
        encoding: "utf-8",
      }));
      fd.append("file", file);

      const res = await fetch("/api/datasources", { method: "POST", body: fd });
      if (!res.ok) throw new Error(await res.text());
      
      const { id } = await res.json();
      onSuccess(id);
    } catch (err: any) {
      toast.error(err.message || "Failed to create datasource");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-cyan-400">Upload CSV File</h3>
        <button type="button" onClick={onClose} className="text-gray-400 hover:text-white text-2xl">✕</button>
      </div>

      <input
        required
        placeholder="Data source name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full rounded-lg bg-black/60 px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
      />

      <div>
        <label className="block text-sm text-gray-400 mb-2">CSV File</label>
        <input
          type="file"
          accept=".csv"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-teal-600 file:text-white hover:file:bg-teal-500"
        />
        {file && <p className="text-xs text-gray-500 mt-1">Selected: {file.name}</p>}
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-2">Delimiter</label>
        <select value={delimiter} onChange={(e) => setDelimiter(e.target.value)} className="w-full rounded-lg bg-black/60 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-400">
          <option value=",">Comma (,)</option>
          <option value=";">Semicolon (;)</option>
          <option value="\t">Tab</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <input type="checkbox" checked={hasHeaders} onChange={(e) => setHasHeaders(e.target.checked)} className="rounded" />
        <label className="text-sm text-gray-400">First row has headers</label>
      </div>

      <button
        type="submit"
        disabled={loading || !file}
        className="w-full rounded-lg bg-teal-600 hover:bg-teal-500 disabled:opacity-50 px-4 py-2 font-medium text-white"
      >
        {loading ? "Processing..." : "Upload & Process"}
      </button>
    </form>
  );
}