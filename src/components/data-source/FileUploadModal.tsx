// src/components/data-source/FileUploadModal.tsx
"use client";
import { useState } from 'react';
import toast from 'react-hot-toast';
import { CloudArrowUpIcon, DocumentIcon, CogIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export function FileUploadModal({ onClose, onSuccess }: { 
  onClose: () => void; 
  onSuccess: (id: string) => void;
}) {
  const [name, setName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [delimiter, setDelimiter] = useState(',');
  const [hasHeaders, setHasHeaders] = useState(true);
  const [step, setStep] = useState<'idle' | 'presign' | 'uploading' | 'creating' | 'triggering'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !name) {
      toast.error('Please select a file and enter a name');
      return;
    }

    const toastId = toast.loading('🚀 Starting upload process...');
    setStep('presign');

    try {
      // Step 1: Get presigned URL
      toast.loading('🔑 Securing upload channel...', { id: toastId });
      const presignRes = await fetch('/api/upload/presigned-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: file.name, fileType: file.type }),
      });

      if (!presignRes.ok) {
        throw new Error(`Failed to get upload URL: ${await presignRes.text()}`);
      }

      const { uploadUrl, downloadUrl } = await presignRes.json(); 
      console.log('[upload] 📤 presigned URL received');

      // Step 2: Upload directly to Storj
      setStep('uploading');
      toast.loading('☁️ Uploading to secure cloud...', { id: toastId });

      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });

     // 🔍 DEBUG LOG - will show in browser console
      console.log('[upload] Storj URL:', uploadUrl.split('?')[0]); // Don't log secrets
      console.log('[upload] Status:', uploadRes.status);
      console.log('[upload] StatusText:', uploadRes.statusText);

      if (!uploadRes.ok) {
        const errorText = await uploadRes.text(); // This contains Storj's error
        console.error('[upload] Error body:', errorText); // 🔍 THIS IS THE KEY
        throw new Error(`Cloud upload failed: ${uploadRes.status} - ${errorText.slice(0, 100)}`);
      }
      console.log('[upload] ✅ file in Storj');

      // Step 3: Create datasource metadata
      setStep('creating');
      toast.loading('📝 Creating datasource entry...', { id: toastId });

      const fd = new FormData();
      fd.append('type', 'FILE_IMPORT');
      fd.append('name', name);
      fd.append('provider', 'csv');
      fd.append('config', JSON.stringify({
        delimiter,
        hasHeaders,
        fileUrl: downloadUrl,
        fileName: file.name,
        fileSize: file.size,
      }));

      const dsRes = await fetch('/api/datasources', { method: 'POST', body: fd });
      if (!dsRes.ok) {
        throw new Error(`Datasource creation failed: ${await dsRes.text()}`);
      }

      const { id: datasourceId } = await dsRes.json();
      console.log('[upload] ✅ datasource created:', datasourceId);

      // Step 4: Trigger processing
      setStep('triggering');
      toast.loading('⚡ Starting data pipeline...', { id: toastId });

      const triggerRes = await fetch('/api/trigger', {  // ✅ Static route, no ID in URL
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ datasourceId }),  // ✅ Send ID in body
      });

      if (!triggerRes.ok) {
        throw new Error(`Pipeline trigger failed: ${await triggerRes.text()}`);
      }

      console.log('[upload] ✅ pipeline triggered');

      // Final success
      toast.success(
        <div className="space-y-1">
          <div className="font-semibold flex items-center gap-2">
            <CheckCircleIcon className="w-5 h-5 text-green-400" />
            Upload Complete!
          </div>
          <div className="text-xs text-gray-300">
            Datasource ID: <code className="bg-black/30 px-1 py-0.5 rounded text-orange-400 font-mono">
              {datasourceId.slice(0, 8)}...
            </code>
          </div>
          <div className="text-xs text-gray-400">
            Data will appear in your dashboard within 30 seconds
          </div>
        </div>,
        { id: toastId, duration: 8000 }
      );

      onSuccess(datasourceId);

    } catch (err: any) {
      console.error('[upload] ❌', err);
      toast.error(
        <div className="space-y-1">
          <div className="font-semibold">❌ Upload Failed</div>
          <div className="text-xs text-gray-400 mt-1">{err.message}</div>
        </div>,
        { id: toastId }
      );
    } finally {
      setStep('idle');
    }
  };

  const fileSizeMB = file ? (file.size / 1024 / 1024).toFixed(2) : '0';

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-h-[80vh] overflow-y-auto p-1">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-2">
          <CloudArrowUpIcon className="w-6 h-6" />
          Upload CSV File
        </h3>
        <button 
          type="button" 
          onClick={onClose} 
          className="text-gray-400 hover:text-white text-2xl transition-colors disabled:opacity-50"
          disabled={step !== 'idle'}
        >
          ✕
        </button>
      </div>

      <p className="text-sm text-gray-400 border-l-4 border-teal-500/50 pl-3">
        Upload your data directly to secure cloud storage. Files up to 1GB supported.
      </p>

      {/* Data Source Name */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Data Source Name *
        </label>
        <input
          required
          placeholder="e.g., Store Sales Q1 2024"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg bg-black/60 px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 disabled:opacity-50 transition-all"
          disabled={step !== 'idle'}
        />
      </div>

      {/* File Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          CSV File *
        </label>
        <div className="relative">
          <input
            type="file"
            accept=".csv,.txt,.tsv"
            onChange={(e) => {
              const selectedFile = e.target.files?.[0] || null;
              setFile(selectedFile);
              if (selectedFile) {
                toast.success(`Selected: ${selectedFile.name} (${(selectedFile.size / 1024).toFixed(1)} KB)`, {
                  duration: 3000,
                });
              }
            }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            disabled={step !== 'idle'}
            id="file-input"
          />
          <label
            htmlFor="file-input"
            className="block w-full rounded-lg bg-black/60 border-2 border-dashed border-gray-600 hover:border-teal-400 px-4 py-6 text-center cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {file ? (
              <div className="flex items-center justify-center gap-3">
                <DocumentIcon className="w-8 h-8 text-teal-400" />
                <div className="text-left">
                  <p className="text-white font-medium">{file.name}</p>
                  <p className="text-xs text-gray-400">{fileSizeMB} MB</p>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <CloudArrowUpIcon className="w-10 h-10 text-gray-500 mx-auto" />
                <p className="text-gray-300">Click to select file or drag and drop</p>
                <p className="text-xs text-gray-500">CSV, TSV, TXT up to 1GB</p>
              </div>
            )}
          </label>
        </div>
      </div>

      {/* Delimiter & Headers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Delimiter
          </label>
          <select 
            value={delimiter} 
            onChange={(e) => setDelimiter(e.target.value)}
            className="w-full rounded-lg bg-black/60 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-400 disabled:opacity-50"
            disabled={step !== 'idle'}
          >
            <option value=",">Comma (,)</option>
            <option value=";">Semicolon (;)</option>
            <option value="\t">Tab</option>
            <option value="|">Pipe (|)</option>
            <option value=" ">Space</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <input 
            type="checkbox" 
            checked={hasHeaders} 
            onChange={(e) => setHasHeaders(e.target.checked)}
            className="rounded text-teal-500 focus:ring-teal-400 disabled:opacity-50"
            disabled={step !== 'idle'}
            id="hasHeaders"
          />
          <label htmlFor="hasHeaders" className="text-sm text-gray-300">
            First row contains column headers
          </label>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={step !== 'idle' || !file || !name}
        className="w-full rounded-lg bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-3 font-semibold text-white transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
      >
        {step === 'presign' && (
          <>
            <CogIcon className="w-5 h-5 animate-spin" />
            Securing upload channel...
          </>
        )}
        {step === 'uploading' && (
          <>
            <CloudArrowUpIcon className="w-5 h-5 animate-pulse" />
            Uploading to cloud ({fileSizeMB}MB)...
          </>
        )}
        {step === 'creating' && (
          <>
            <CogIcon className="w-5 h-5 animate-spin" />
            Creating datasource...
          </>
        )}
        {step === 'triggering' && (
          <>
            <CogIcon className="w-5 h-5 animate-spin" />
            Starting pipeline...
          </>
        )}
        {step === 'idle' && (
          <>
            <CloudArrowUpIcon className="w-5 h-5" />
            Upload & Process
          </>
        )}
      </button>

      {/* Live Progress Panel */}
      {step !== 'idle' && (
        <div className="bg-black/40 border border-white/5 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-teal-300">{step.toUpperCase()}</span>
          </div>
          <div className="text-xs text-gray-400 space-y-1">
            {step === 'presign' && <div>• Generating secure upload token...</div>}
            {step === 'uploading' && (
              <>
                <div>• Direct upload to Storj DCS (bypassing Vercel)</div>
                <div>• File: {file?.name}</div>
                <div>• Size: {fileSizeMB} MB</div>
              </>
            )}
            {step === 'creating' && <div>• Registering datasource in Redis...</div>}
            {step === 'triggering' && <div>• Queueing job for background processing...</div>}
          </div>
        </div>
      )}
    </form>
  );
}