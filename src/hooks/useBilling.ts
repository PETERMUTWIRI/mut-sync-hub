// src/hooks/useBilling.ts
import { useQuery } from '@tanstack/react-query';

export function useBilling() {
  return useQuery({
    queryKey: ['billing'],
    queryFn: () => fetch('/api/billing', { credentials: 'include' }).then((r) => r.json()),
    staleTime: 60_000,
  });
}