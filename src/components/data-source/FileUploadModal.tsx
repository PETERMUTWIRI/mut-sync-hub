// src/components/data-source/FileUploadModal.tsx
"use client";
import { useState } from "react";
import toast from "react-hot-toast";

export function FileUploadModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: (id: string) => void }) {
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [delimiter, setDelimiter] = useState(",");
  const [hasHeaders, setHasHeaders] = useState(true);
  const [step, setStep] = useState<"idle" | "presign" | "uploading" | "processing">("idle");
  const [progress, setProgress] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error("Select a file");
      return;
    }

    try {
      setStep("presign");
      // Step 1: Get presigned URL (tiny request)
      const presignRes = await fetch("/api/upload/presigned-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, fileType: file.type }),
      });
      const { presignedUrl, publicUrl } = await presignRes.json();

      // Step 2: Upload directly to Storj (bypasses Vercel)
      setStep("uploading");
      await fetch(presignedUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      // Step 3: Create datasource record
      setStep("processing");
      const fd = new FormData();
      fd.append("type", "CSV_UPLOAD");
      fd.append("name", name || file.name);
      fd.append("provider", "csv");
      fd.append("config", JSON.stringify({
        delimiter,
        hasHeaders,
        fileUrl: publicUrl, // Use the Storj URL directly
        fileName: file.name,
        fileSize: file.size,
      }));

      const dsRes = await fetch("/api/datasources", { method: "POST", body: fd });
      const { id } = await dsRes.json();

      // Step 4: Trigger pipeline
      await fetch(`/api/datasources/${id}/trigger`, { method: "POST" });

      toast.success(`✅ ${file.name} uploaded!`);
      onSuccess(id);

    } catch (err) {
      console.error("[upload] ❌", err);
      toast.error("Upload failed: " + (err as Error).message);
    } finally {
      setStep("idle");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* ... your existing form fields ... */}
      
      <button
        type="submit"
        disabled={step !== "idle"}
        className="w-full bg-teal-600 hover:bg-teal-500 disabled:opacity-50 px-4 py-2 rounded-lg"
      >
        {step === "presign" && "Requesting upload URL..."}
        {step === "uploading" && `Uploading to cloud...`}
        {step === "processing" && "Starting pipeline..."}
        {step === "idle" && "🚀 Upload & Process"}
      </button>

      {step !== "idle" && (
        <div className="text-sm text-gray-400 bg-black/30 p-3 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-4 h-4 border-2 border-teal-400 border-t-transparent rounded-full animate-spin"></div>
            <span>{step}</span>
          </div>
          <div className="text-xs text-gray-500">
            {step === "uploading" && `Direct upload to Storj (${file?.name})`}
          </div>
        </div>
      )}
    </form>
  );
}