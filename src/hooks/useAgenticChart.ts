import { useState } from 'react';
import { v4 as uuid } from 'uuid'; // or use nanoid

type Visual = { type: 'line' | 'bar' | 'pie'; data: any };

interface AgentAnalytics {
  answer: { content: string };
  visual: Visual;
}

export default function useAgenticChart(threadId?: string) {
  const [insight, setInsight] = useState<string>('');
  const [visual, setVisual] = useState<Visual | null>(null);
  const [loading, setLoading] = useState(false);

  const ask = async (question: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'analytics',
          payload: { question, threadId: threadId || uuid() },
        }),
      });
      const json: AgentAnalytics = await res.json();
      setInsight(json.answer.content);
      setVisual(json.visual);
    } finally {
      setLoading(false);
    }
  };

  return { ask, insight, visual, loading };
}