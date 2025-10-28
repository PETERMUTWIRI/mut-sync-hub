'use client';

import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useSupportTickets(userEmail: string) {
  const { data, error, mutate } = useSWR(
    userEmail ? `/api/support/tickets?userEmail=${userEmail}` : null,
    fetcher,
    { refreshInterval: 5000 }
  );
  return { tickets: data || [], mutate, isLoading: !error && !data };
}

export function useServiceStatus() {
  const { data } = useSWR('/api/support/status', fetcher, { refreshInterval: 10000 });
  return data || [];
}
