
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuid } from 'uuid';
import { createDataSourceAPI } from '@/lib/data-source-client';
import toast from 'react-hot-toast';

export function WebhookForm({ onSuccess }: { onSuccess: () => void }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [engineReply, setEngineReply] = useState<any>(null);
  const router = useRouter();
  const webhookPath = uuid();
  const fullUrl = typeof window !== 'undefined' ? `${window.location.origin}/api/webhook/${webhookPath}` : '';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name) {
      toast.error('Please provide a connection name');
      return;
    }
    setLoading(true);
    setProgress(0);
    setEngineReply(null);

    try {
      // Build FormData for consistency with other forms
      const formData = new FormData();
      formData.append('type', 'WEBHOOK');
      formData.append('name', name);
      formData.append('provider', 'webhook');
      formData.append('config', JSON.stringify({ webhook: true, path: webhookPath }));

      // Simulate progress (webhook config is small, so fake progress for UX)
      const tick = setInterval(() => setProgress((p) => (p >= 90 ? 90 : p + 10)), 150);
      toast.loading('Creating webhook inbox…');

      const response = await createDataSourceAPI(formData);
      const { id, engine } = response as { id: string; engine: any };

      clearInterval(tick);
      setProgress(100);
      toast.success('Webhook inbox created');
      setEngineReply(engine);
      toast.success(`Webhook registered – status: ${engine.status}`);

      onSuccess();
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create webhook inbox');
      console.error('[WebhookForm] Error:', err);
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
      <div className="rounded-lg bg-black/60 p-3 break-all text-sm text-gray-300">
        POST to: <span className="text-teal-300">{fullUrl}</span>
      </div>

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
        {loading ? 'Creating inbox…' : 'Create webhook inbox'}
      </button>
    </form>
  );
}
