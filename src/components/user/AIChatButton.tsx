import { FaRobot } from 'react-icons/fa';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AIChatButton() {
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchChatbotStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/chatbot/status');
      if (!res.ok) throw new Error('Failed to fetch chatbot status');
      const data = await res.json();
      setStatus(data.status);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = async () => {
    await fetchChatbotStatus();
    router.push('/chat'); // Adjust route as needed
  };

  return (
    <button
      className="fixed bottom-8 right-8 bg-[#2E7D7D] rounded-full p-4 text-white text-2xl shadow-xl hover:bg-[#1E2A44] hover:text-[#2E7D7D] transition-all duration-200 z-50"
      onClick={handleClick}
      aria-label="Open AI Chatbot"
      disabled={loading}
    >
      <FaRobot />
      {loading && <span className="ml-2 text-sm text-gray-200">Loading...</span>}
      {status && <span className="ml-2 text-sm text-gray-200">{status}</span>}
      {error && <span className="ml-2 text-sm text-red-400">{error}</span>}
    </button>
  );
}