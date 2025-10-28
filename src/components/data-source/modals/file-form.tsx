
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createDataSourceAPI } from '@/lib/data-source-client';
import toast from 'react-hot-toast';

export function FileForm({ onSuccess }: { onSuccess: () => void }) {
  const [name, setName] = useState('');
  const [provider, setProvider] = useState<'upload' | 's3' | 'local'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [bucket, setBucket] = useState('');
  const [region, setRegion] = useState('us-east-1');
  const [accessKey, setAccessKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [engineReply, setEngineReply] = useState<any>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (provider === 'upload' && !file) {
      toast.error('Please pick a CSV file');
      return;
    }
    setLoading(true);
    setProgress(0);
    setEngineReply(null);

    try {
      // Build FormData
      const formData = new FormData();
      formData.append('type', 'FILE_IMPORT');
      formData.append('name', name);
      formData.append('provider', provider);

      if (provider === 'upload') {
        formData.append('file', file!, file!.name);
      } else if (provider === 's3') {
        formData.append('config', JSON.stringify({ provider, bucket, region, accessKey, secretKey }));
      } else {
        formData.append('config', JSON.stringify({ provider, path: 'C:\\POS\\DailySales' }));
      }

      // Send with progress tracking
      toast.loading('Saving connection…');
      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          setProgress(Math.round((event.loaded / event.total) * 100));
        }
      };

      const response = await new Promise((resolve, reject) => {
        xhr.open('POST', '/api/datasources'); 
        xhr.onload = () => {
          if (xhr.status === 200) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error(`Request failed: ${xhr.status} ${xhr.responseText}`));
          }
        };
        xhr.onerror = () => reject(new Error('Network error'));
        xhr.send(formData);
      });

      const { id, engine } = response as { id: string; engine: any };
      setProgress(100);
      toast.success('File source saved');
      setEngineReply(engine);
      toast.success(`Ingestion started – status: ${engine.status}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save connection');
      console.error('[FileForm] Error:', err);
      return; // Keep modal open
    } finally {
      setLoading(false);
      setProgress(0);
    }

    onSuccess();
    router.refresh();
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

      {provider === 'upload' && (
        <div>
          <input
            id="csv-file"
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="hidden"
          />
          <label
            htmlFor="csv-file"
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-teal-600 hover:bg-teal-500 px-4 py-2 text-sm font-medium"
          >
            📁 Choose CSV file
          </label>
          {file && <p className="text-sm text-gray-300 mt-1">Selected: {file.name}</p>}
        </div>
      )}
      {provider === 'local' && (
        <input
          required
          placeholder="C:\POS\DailySales"
          value="C:\POS\DailySales"
          readOnly
          className="w-full rounded-lg bg-black/60 px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
        />
      )}
      {provider === 's3' && (
        <>
          <input
            required
            placeholder="Bucket name"
            value={bucket}
            onChange={(e) => setBucket(e.target.value)}
            className="w-full rounded-lg bg-black/60 px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
          />
          <input
            required
            placeholder="Region"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="w-full rounded-lg bg-black/60 px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
          />
          <input
            required
            placeholder="Access Key"
            value={accessKey}
            onChange={(e) => setAccessKey(e.target.value)}
            className="w-full rounded-lg bg-black/60 px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
          />
          <input
            required
            type="password"
            placeholder="Secret Key"
            value={secretKey}
            onChange={(e) => setSecretKey(e.target.value)}
            className="w-full rounded-lg bg-black/60 px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
          />
        </>
      )}

      {loading && (
        <div className="w-full bg-black/40 rounded h-2 overflow-hidden">
          <div className="bg-teal-400 h-2 transition-all duration-150" style={{ width: `${progress}%` }} />
          <p className="text-xs text-gray-300 mt-1">{progress}%</p>
        </div>
      )}

      {engineReply && (
        <div className="rounded-lg bg-black/60 p-3 text-sm text-gray-200">
          Engine reply: <span className="text-teal-300">{JSON.stringify(engineReply)}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-[#2E7D7D] hover:bg-teal-600 disabled:opacity-50 px-4 py-2 font-medium"
      >
        {loading ? 'Saving…' : 'Save connection'}
      </button>
    </form>
  );
}
