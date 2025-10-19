'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { agentRequest } from '@/lib/agentClient';          // ← new helper
import { useVoiceAgent } from '@/hooks/useVoiceAgent';
import {
  HiOutlineMicrophone, HiOutlineCalendar
} from 'react-icons/hi2';

type Props = {
  context?: string;
};
export default function SolutionsAgent({ context = 'anon' }: Props) {
  const [thread, setThread] = useState<{role:'user'|'assistant';content:string}[]>([]);
  const [input, setInput]   = useState('');
  const [loading, setLoading] = useState(false);
  const [calendarOffer, setCalendarOffer] = useState(false);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [email, setEmail] = useState('');
  const threadId = context; 
  const { listen, reply, transcript, speaking } = useVoiceAgent();

  /* voice: auto-send final transcript */
  useEffect(() => { if (transcript) { setInput(transcript); } }, [transcript]);
  useEffect(() => { if (transcript && !speaking && !loading) send(); }, [transcript, speaking, loading]);

  /* first bot prompt on mount */
  useEffect(() => { if (thread.length === 0) triggerWelcome(); }, []);

  async function triggerWelcome() {
    setLoading(true);
    const res = await agentRequest('requirements', { service: 'unknown', threadId: 'support' });
    setThread([{ role: 'assistant', content: res.content }]);
    setLoading(false);
  }

  async function send() {
    if (!input.trim()) return;
    const userMsg = { role: 'user' as const, content: input };
    setThread((t) => [...t, userMsg]);
    setInput('');
    setLoading(true);

    try {
  const res = await agentRequest('chat', { message: input, threadId: 'support' });
  setThread((t) => [...t, { role: 'assistant', content: res.content }]);
      if (res.requiresContact) setCalendarOffer(true);
    } catch (e: any) {
      setThread((t) => [...t, { role: 'assistant', content: 'Sorry – ' + e.message }]);
    } finally {
      setLoading(false);
    }
  }

  async function book() {
    if (!date || !time || !email) return alert('Fill all fields');
    try {
      await agentRequest('book', { date, time, email, threadId: 'support', name: 'Support-Page-User' });
      alert('Calendar invite sent + email summary delivered!');
      setCalendarOffer(false);
    } catch (e: any) {
      alert('Booking failed – ' + e.message);
    }
  }

  /* voice starter */
  const startVoice = () => {
    if (!('webkitSpeechRecognition' in window)) return alert('Voice not supported');
    const rec = new (window as any).webkitSpeechRecognition();
    rec.lang = 'en-US'; rec.interimResults = false; rec.maxAlternatives = 1;
    rec.onresult = (e: any) => setInput(e.results[0][0].transcript);
    rec.start();
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 text-white text-sm">
      {/* header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-cyan-400 text-xl">🤖</span>
          <span className="font-semibold">AI Consultant</span>
        </div>
        <Button size="sm" variant="ghost" onClick={startVoice} disabled={speaking || loading}
                className={`px-2 py-1 rounded text-xs ${speaking ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-200'}`}>
          {speaking ? <HiOutlineMicrophone size={14} /> : <HiOutlineMicrophone size={14} />}
        </Button>
      </div>

      {/* chat window */}
      <div className="h-64 overflow-y-auto mb-3 space-y-2 rounded-lg bg-gray-900/50 p-3">
        {thread.map((m, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs px-3 py-2 rounded-lg text-xs ${m.role === 'user' ? 'bg-cyan-600' : 'bg-gray-700'}`}>
              {m.content}
            </div>
          </motion.div>
        ))}
        {loading && <div className="text-gray-400 text-xs animate-pulse">Typing…</div>}
      </div>

      {/* input */}
      <div className="flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()}
               placeholder="Type or speak…"
               className="flex-1 px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500" />
        <Button onClick={send} disabled={loading} className="bg-cyan-600 hover:bg-cyan-700 text-xs px-3 py-2">Send</Button>
      </div>

      {/* calendar offer */}
      {calendarOffer && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3 p-3 rounded-lg bg-cyan-600/10 border border-cyan-500">
          <p className="text-sm mb-2">Ready to book a free consultation?</p>
          <div className="flex gap-2">
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                   className="px-2 py-1 rounded bg-gray-700 border border-gray-600 text-white text-xs" />
            <select value={time} onChange={(e) => setTime(e.target.value)}
                    className="px-2 py-1 rounded bg-gray-700 border border-gray-600 text-white text-xs">
              {['09:00','10:00','11:00','13:00','14:00','15:00','16:00'].map(t => <option key={t}>{t}</option>)}
            </select>
            <input type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)}
                   className="px-2 py-1 rounded bg-gray-700 border border-gray-600 text-white text-xs" />
            <Button onClick={book} className="bg-cyan-600 hover:bg-cyan-700 text-xs px-3 py-1"><HiOutlineCalendar size={14} /></Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}