// hooks/useAnalyticsPoll.ts
import { useEffect, useState, useRef, useCallback } from 'react';

// ── TYPES ─────────────────────────────────────────────────────────────────

interface AnalyticsMessage {
  type: 'kpi_update' | 'insight';
  timestamp: string;
  data: any;
}

interface AnalyticsResponse {
  messages: AnalyticsMessage[];
  error?: string;
}

interface OrgProfile {
  userId: string;
  orgId: string;
  role: string;
  plan: string;
}

interface UseAnalyticsPollOptions {
  intervalMs?: number;
  maxRetries?: number;
  enabled?: boolean;
  onKpiUpdate?: (data: any) => void;
  onInsight?: (data: any) => void;
}

interface UseAnalyticsPollReturn {
  kpis: any | null;
  insights: any[];
  status: 'idle' | 'loading' | 'connected' | 'error';
  error: string | null;
  triggerComputation: () => Promise<boolean>;
  reconnect: () => void;
  lastUpdated: Date | null;
  isTriggering: boolean;
  rateLimitRemaining?: number;
}

/**
 * # useAnalyticsPoll
 * 
 * Production-ready analytics polling hook for MutSyncHub.
 * 
 * ## Architecture
 * 
 * ### Pattern A: Server-Side Rendering (Recommended)
 * ```tsx
 * // app/analytics/[sourceId]/page.tsx
 * import { getOrgProfileInternal } from '@/lib/orgprofile';
 * 
 * export default async function Page({ params }) {
 *   const profile = await getOrgProfileInternal();
 *   return <AnalyticsClient orgId={profile.orgId} sourceId={params.sourceId} />;
 * }
 * 
 * // AnalyticsClient.tsx
 * 'use client';
 * const { kpis } = useAnalyticsPoll(orgId, sourceId);
 * ```
 * 
 * ### Pattern B: Client-Side Resolution (Fallback)
 * ```tsx
 * // When orgId is not available server-side
 * const { kpis } = useAnalyticsPoll(null, sourceId); // Fetches /api/orgprofile
 * ```
 * 
 * ## Data Flow
 * 1. Resolve orgId (from props or /api/orgprofile)
 * 2. Poll HF endpoint via `/api/v1/analytics/stream/recent`
 * 3. Process KPI updates & insights from Redis streams
 * 4. Trigger computation via QStash webhook
 */
export const useAnalyticsPoll = (
  orgId: string | null, // null = fetch from /api/orgprofile
  sourceId: string,
  options: UseAnalyticsPollOptions = {}
): UseAnalyticsPollReturn => {
  const {
    intervalMs = 5000,
    maxRetries = 3,
    enabled = true,
    onKpiUpdate,
    onInsight,
  } = options;

  const [kpis, setKpis] = useState<any | null>(null);
  const [insights, setInsights] = useState<any[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'connected' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isTriggering, setIsTriggering] = useState(false);
  const [resolvedOrgId, setResolvedOrgId] = useState<string | null>(null);
  const [rateLimitRemaining, setRateLimitRemaining] = useState<number | undefined>(undefined);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef<number>(0);
  const isMountedRef = useRef<boolean>(true);

  // ── ORGID RESOLUTION ───────────────────────────────────────────────────
  useEffect(() => {
    let isActive = true;

    const resolveOrgId = async () => {
      if (orgId) {
        // Server-side: use provided orgId
        setResolvedOrgId(orgId);
        return;
      }

      // Client-side: fetch from your API
      try {
        const res = await fetch('/api/orgprofile', {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        const profile: OrgProfile = await res.json();
        if (isActive) setResolvedOrgId(profile.orgId);
      } catch (e) {
        const errorMsg = e instanceof Error ? e.message : 'Failed to resolve orgId';
        setError(errorMsg);
        setStatus('error');
        console.error('[useAnalyticsPoll] Org resolution failed:', e);
      }
    };

    resolveOrgId();

    return () => {
      isActive = false;
    };
  }, [orgId]);

  // ── CLEANUP ─────────────────────────────────────────────────────────────
  const clearPoll = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // ── MESSAGE PROCESSING ─────────────────────────────────────────────────
  const processMessages = useCallback((messages: AnalyticsMessage[]) => {
    if (!isMountedRef.current) return;

    const newKpis: any[] = [];
    const newInsights: any[] = [];

    messages.forEach((msg: AnalyticsMessage) => {
      if (msg.type === 'kpi_update') {
        newKpis.push(msg.data);
      } else if (msg.type === 'insight') {
        newInsights.push(msg.data);
      }
    });

    if (newKpis.length > 0) {
      const latestKpis = newKpis[newKpis.length - 1];
      setKpis(latestKpis);
      onKpiUpdate?.(latestKpis);
      setLastUpdated(new Date());
    }

    if (newInsights.length > 0) {
      setInsights(prev => [...newInsights, ...prev].slice(0, 50));
      newInsights.forEach(insight => onInsight?.(insight));
    }
  }, [onKpiUpdate, onInsight]);

  // ── POLLING LOGIC ──────────────────────────────────────────────────────
  const poll = useCallback(async () => {
    if (!resolvedOrgId || !enabled) return;
    if (status === 'loading' && kpis === null) return; // Prevent overlapping

    try {
      setStatus(prev => (prev === 'idle' || prev === 'error') ? 'loading' : prev);
      setError(null);

      const apiUrl = process.env.ANALYTICS_ENGINE_URL || 'http://localhost:8000';
      const url = `${apiUrl}/api/v1/analytics/stream/recent?org_id=${resolvedOrgId}&source_id=${sourceId}&count=10`;
      
      const res = await fetch(url, {
        credentials: 'include',
        headers: { 
          'Content-Type': 'application/json',
          'X-API-KEY': process.env.ANALYTICS_ENGINE_URL || '',
        },
      });
      
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      
      const data: AnalyticsResponse = await res.json();
      
      if (data.error) throw new Error(data.error);

      if (data.messages && data.messages.length > 0) {
        processMessages(data.messages);
      }
      
      setStatus('connected');
      retryCountRef.current = 0;
      
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'Unknown error';
      setError(errorMsg);
      setStatus('error');
      
      retryCountRef.current += 1;
      
      if (retryCountRef.current >= maxRetries) {
        console.error(`[useAnalyticsPoll] Max retries (${maxRetries}) exceeded`);
        clearPoll();
      }
    }
  }, [resolvedOrgId, sourceId, enabled, status, kpis, processMessages, maxRetries, clearPoll]);

  // ── POLLING EFFECT ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!resolvedOrgId || !enabled) {
      setStatus('idle');
      return;
    }

    isMountedRef.current = true;
    
    // Initial poll
    poll();
    
    // Set up interval
    intervalRef.current = setInterval(poll, intervalMs);
    console.log(`[useAnalyticsPoll] Started polling for ${resolvedOrgId}/${sourceId}`);

    return () => {
      isMountedRef.current = false;
      clearPoll();
      retryCountRef.current = 0;
    };
  }, [poll, intervalMs, resolvedOrgId, enabled, clearPoll]);

  // ── TRIGGER COMPUTATION ────────────────────────────────────────────────
  const triggerComputation = useCallback(async (): Promise<boolean> => {
    if (!resolvedOrgId) {
      setError('Organization ID not available');
      return false;
    }

    setIsTriggering(true);
    setStatus('loading');
    setError(null);

    try {
      const apiUrl = process.env.ANALYTICS_ENGINE_URL || 'http://localhost:8000';
      const res = await fetch(`${apiUrl}/api/v1/kpi/compute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': process.env.ANALYTICS_ENGINE_API_KEY || '',
        },
        credentials: 'include',
        body: JSON.stringify({
          org_id: resolvedOrgId,
          source_id: sourceId,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text().catch(() => 'Unknown error');
        throw new Error(`Trigger failed: ${res.status} - ${errorText}`);
      }

      const result = await res.json();
      if (result.rate_limit?.remaining !== undefined) {
        setRateLimitRemaining(result.rate_limit.remaining);
      }
      // Poll immediately to catch cached result
      await poll();
      
      return true;
      
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'Trigger failed';
      setError(errorMsg);
      setStatus('error');
      return false;
    } finally {
      setIsTriggering(false);
    }
  }, [resolvedOrgId, sourceId, poll]);

  // ── MANUAL RECONNECT ──────────────────────────────────────────────────
  const reconnect = useCallback(() => {
    retryCountRef.current = 0;
    setError(null);
    clearPoll();
    poll();
  }, [poll, clearPoll]);

  return {
  kpis,
  insights,
  status,
  error,
  lastUpdated,
  isTriggering,
  triggerComputation,
  reconnect,
  rateLimitRemaining, // Add this
 }
};