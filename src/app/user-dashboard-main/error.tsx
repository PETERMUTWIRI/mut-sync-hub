'use client';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  console.error('Dashboard crash', error);
  return (
    <div className="min-h-screen bg-[#1E2A44] text-white flex items-center justify-center">
      <div className="bg-red-500/20 border border-red-500 rounded-xl p-6 max-w-2xl">
        <h2 className="text-xl font-bold mb-2">Dashboard error</h2>
        <pre className="text-sm overflow-auto">{error.message}</pre>
        <button onClick={reset} className="mt-4 bg-[#2E7D7D] px-4 py-2 rounded">
          Retry
        </button>
      </div>
    </div>
  );
}