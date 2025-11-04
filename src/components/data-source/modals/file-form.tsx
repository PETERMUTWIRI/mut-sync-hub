"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export function FileForm({ onSuccess }: { onSuccess: () => void }) {
  const [name, setName] = useState("");
  const [provider, setProvider] = useState<"upload" | "s3" | "local">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (provider === "upload" && !file) {
      toast.error("Please pick a CSV file");
      return;
    }
    setLoading(true);

    try {
      const fd = new FormData();
      fd.append("type", "FILE_IMPORT");
      fd.append("name", name);
      fd.append("provider", provider);
      fd.append("config", JSON.stringify({
        provider,
        path: provider === "local" ? "C:\\POS\\DailySales" : undefined,
      }));
      fd.append("data", JSON.stringify([])); // no bytes yet

      const res = await fetch("/api/datasources", { method: "POST", body: fd });
      if (!res.ok) throw new Error(await res.text());

      toast.success("File source registered – n8n will watch it");
      onSuccess();
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        required
        placeholder="Connection name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full rounded-lg bg-black/60 px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
      />
      <select
        value={provider}
        onChange={(e) => setProvider(e.target.value as any)}
        className="w-full rounded-lg bg-black/60 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
      >
        <option value="upload">Upload CSV file</option>
        <option value="local">Watch local folder</option>
        <option value="s3">Amazon S3 (or compatible)</option>
      </select>

      {provider === "upload" && (
        <div>
          <input id="csv-file" type="file" accept=".csv" onChange={(e) => setFile(e.target.files?.[0] || null)} className="hidden" />
          <label htmlFor="csv-file" className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-teal-600 hover:bg-teal-500 px-4 py-2 text-sm font-medium">
            📁 Choose CSV file
          </label>
          {file && <p className="text-sm text-gray-300 mt-1">Selected: {file.name}</p>}
        </div>
      )}

      <button type="submit" disabled={loading} className="w-full rounded-lg bg-[#2E7D7D] hover:bg-teal-600 disabled:opacity-50 px-4 py-2 font-medium">
        {loading ? "Saving…" : "Save connection"}
      </button>
    </form>
  );
}