// src/hooks/useQueryHistory.ts
import { useQuery } from '@tanstack/react-query';

export function useQueryHistory() {
  return useQuery({
    queryKey: ['analytics-query-history'],
    queryFn: () => fetch('/api/analytics/query-history', { credentials: 'include' }).then((r) => r.json()),
    staleTime: 60_000,
  });
}

// src/hooks/useSchedules.ts
export function useSchedules() {
  return useQuery({
    queryKey: ['analytics-schedules'],
    queryFn: () => fetch('/api/analytics/schedule', { credentials: 'include' }).then((r) => r.json()),
    staleTime: 60_000,
  });
}