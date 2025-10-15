
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createDataSourceAPI } from '@/lib/data-source-client';
import toast from 'react-hot-toast';

export function ApiForm({ onSuccess }: { onSuccess: () => void }) {
  const [name, setName] = useState('');
  const [endpoint, setEndpoint] = useState('');
  const [key, setKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [engineReply, setEngineReply] = useState<any>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!endpoint || !key) {
      toast.error('Please provide both an endpoint and API key');
      return;
    }
    setLoading(true);
    setProgress(0);
    setEngineReply(null);

    try {
      // Build FormData for consistency with file-form.tsx
      const formData = new FormData();
      formData.append('type', 'API');
      formData.append('name', name);
      formData.append('provider', 'api');
      formData.append('config', JSON.stringify({ endpoint, apiKey: key }));

      // Simulate progress (API config is small, so fake progress for UX)
      const tick = setInterval(() => setProgress((p) => (p >= 90 ? 90 : p + 10)), 150);
      toast.loading('Saving API connection…');

      const response = await createDataSourceAPI(formData);
      const { id, engine } = response as { id: string; engine: any };

      clearInterval(tick);
      setProgress(100);
      toast.success('API connection saved');
      setEngineReply(engine);
      toast.success(`Ingestion started – status: ${engine.status}`);

      onSuccess();
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save API connection');
      console.error('[ApiForm] Error:', err);
      return; // Keep modal open
    } finally {
      setLoading(false);
      setProgress(0);
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
      <input
        required
        placeholder="https://api.example.com"
        value={endpoint}
        onChange={(e) => setEndpoint(e.target.value)}
        className="w-full rounded-lg bg-black/60 px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
      />
      <input
        required
        placeholder="API Key"
        value={key}
        onChange={(e) => setKey(e.target.value)}
        className="w-full rounded-lg bg-black/60 px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
      />

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
        {loading ? 'Testing & saving…' : 'Save connection'}
      </button>
    </form>
  );
}
