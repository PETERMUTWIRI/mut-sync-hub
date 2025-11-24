// hooks/useAIQuery.ts
import { useState, useCallback } from 'react';

interface AIQueryResponse {
  answer: string;
  sources: any[];
  query: string;
}

export const useAIQuery = () => {
  const [answer, setAnswer] = useState<string | null>(null);
  const [sources, setSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const askQuestion = useCallback(async (question: string, orgId: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch(`/api/v1/ai/query?query=${encodeURIComponent(question)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': process.env.ANALYTICS_ENGINE_API_KEY || '',
        },
        credentials: 'include',
        body: JSON.stringify({ org_id: orgId }),
      });
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
      const data: AIQueryResponse = await res.json();
      setAnswer(data.answer);
      setSources(data.sources);
      
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Query failed');
      setAnswer("I couldn't process that question. Try rephrasing it.");
    } finally {
      setLoading(false);
    }
  }, []);

  return { askQuestion, answer, sources, loading, error };
};