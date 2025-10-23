import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { HiChat, HiX } from 'react-icons/hi';

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ text: string; sender: 'user' | 'bot' }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    if (input.trim() === '') return;
    setLoading(true);
    setError(null);
    const newMessages = [
      ...messages,
      { text: input, sender: 'user' as 'user' }
    ];
    setMessages(newMessages);
    setInput('');
    try {
      const res = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input }),
      });
      if (!res.ok) throw new Error('Failed to get chatbot response');
      const data = await res.json();
      setMessages([
        ...newMessages,
        { text: data.reply, sender: 'bot' as 'bot' }
      ]);
    } catch (err: any) {
      setError(err.message);
      setMessages([
        ...newMessages,
        { text: 'Sorry, I am having trouble connecting.', sender: 'bot' as 'bot' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <Button
        size="lg"
        className="rounded-full w-16 h-16 bg-[#2E7D7D] text-white shadow-xl hover:bg-[#1E2A44] transition-all duration-200"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <HiX size={24} /> : <HiChat size={24} />}
      </Button>

      {isOpen && (
        <Card className="absolute bottom-20 right-0 w-80 bg-[#1E2A44] border border-[#2E7D7D]/30 shadow-xl">
          <CardHeader>
            <CardTitle className="text-white font-inter text-lg">Chatbot</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
              {messages.map((msg, idx) => (
                <div key={idx} className={`text-base ${msg.sender === 'user' ? 'text-[#2E7D7D]' : 'text-gray-200'}`}>{msg.text}</div>
              ))}
              {error && <div className="text-sm text-red-400">{error}</div>}
            </div>
            <div className="flex gap-2 mt-4">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="bg-[#2E2A44] text-white border-[#2E7D7D]/30"
                disabled={loading}
              />
              <Button
                size="sm"
                className="bg-[#2E7D7D] hover:bg-[#1E2A44] text-white"
                onClick={handleSend}
                disabled={loading || !input.trim()}
              >
                Send
              </Button>
            </div>
            {loading && <div className="text-sm text-gray-400 mt-2">Loading...</div>}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Chatbot;