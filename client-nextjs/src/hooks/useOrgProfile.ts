// src/hooks/useOrgProfile.ts
import { useQuery } from '@tanstack/react-query';
import { useUser } from '@stackframe/stack';

export function useOrgProfile() {
  const user = useUser({ or: 'redirect' });
  return useQuery({
    queryKey: ['org-profile', user.id],
    queryFn: () =>
      fetch('/api/org-profile', { credentials: 'include' })
        .then((r) => r.json())
        .then((j) => j as any),
    enabled: !!user.id,
    retry: 1,
  });
}