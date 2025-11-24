import { useState, useCallback } from 'react';

interface AIQueryResponse {
  answer: string;
  sources: any[];
  query: string;
}

interface SchemaMapping {
  [semanticField: string]: string;
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
      // Step 1: Fetch schema hints
      const schemaRes = await fetch(`/api/v1/schema/discover?org_id=${orgId}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': process.env.ANALYTICS_ENGINE_API_KEY || '',
        },
      });
      
      let mappings: SchemaMapping = {};
      if (schemaRes.ok) {
        mappings = await schemaRes.json();
      }
      
      // Step 2: Build enhanced question
      const schemaHints = Object.entries(mappings)
        .map(([semantic, actual]) => `• ${semantic} → ${actual}`)
        .join('\n');
      
      const enhancedQuestion = schemaHints 
        ? `${question}\n\nAvailable Data Fields:\n${schemaHints}`
        : question;
      
      // Step 3: Query AI with enhanced context
      const res = await fetch(`/api/v1/ai/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': process.env.ANALYTICS_ENGINE_API_KEY || '',
        },
        credentials: 'include',
        body: JSON.stringify({ query: enhancedQuestion, org_id: orgId }),
      });
      
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
      const data: AIQueryResponse = await res.json();
      setAnswer(data.answer);
      setSources(data.sources);
      
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Query failed';
      setError(errorMessage);
      setAnswer("I couldn't process that question. Try rephrasing it with specific metrics or time periods.");
    } finally {
      setLoading(false);
    }
  }, []);

  return { askQuestion, answer, sources, loading, error };
};