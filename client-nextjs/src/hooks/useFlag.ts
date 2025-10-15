import { useQuery } from '@tanstack/react-query';
import { useOrgProfile } from './useOrgProfile'; // returns { orgId, planId, role }

export function useFlag(flagKey: string) {
  const { orgId, planId, role } = useOrgProfile();
  const { data } = useQuery({
    queryKey: ['flags', orgId, flagKey],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_FLAGS_URL}/flags/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ org_id: orgId, plan_id: planId, role }),
      });
      const flags: { key: string; enabled: boolean }[] = await res.json();
      return flags.find((f) => f.key === flagKey)?.enabled ?? false;
    },
    enabled: !!orgId,
    staleTime: 1000 * 60,
  });
  return data ?? false;
}