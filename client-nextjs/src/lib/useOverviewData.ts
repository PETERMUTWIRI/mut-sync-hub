import { useState, useEffect } from 'react';

interface OverviewData {
  announcements: string[];
  anomaly: { detected: boolean; message?: string } | null;
  billing: { lastInvoice?: string; nextPayment?: string; paymentMethod?: string } | null;
  forecast: { calls?: number; prediction?: string } | null;
  notifications: { unreadCount?: number; latest?: string } | null;
  plan: { name?: string; renewalDate?: string } | null;
  activity: { lastLogin?: string; recent?: string[] } | null;
  security: { twoFAEnabled?: boolean; sessions?: number; apiKeys?: number } | null;
  support: { openTickets?: number } | null;
  team: { members?: string[] } | null;
  usage: { usage?: number; quota?: number } | null;
  trends: { usage?: number[]; forecast?: number[] } | null;
  insights: { topUser?: string; churnRisk?: string; segment?: string } | null;
}

export function useOverviewData() {
  const [data, setData] = useState<OverviewData>({
    announcements: [],
    anomaly: null,
    billing: null,
    forecast: null,
    notifications: null,
    plan: null,
    activity: null,
    security: null,
    support: null,
    team: null,
    usage: null,
    trends: null,
    insights: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const mockData: OverviewData = {
          announcements: ['New feature release on Aug 28', 'Maintenance scheduled for Sep 1'],
          anomaly: { detected: true, message: '35% API call increase at 2:14 PM' },
          billing: { lastInvoice: 'Aug 20, 2025', nextPayment: 'Sep 20, 2025', paymentMethod: 'Visa ****1234' },
          forecast: { calls: 2800, prediction: '10% increase in usage and billing' },
          notifications: { unreadCount: 1, latest: 'New message received' },
          plan: { name: 'Pro', renewalDate: 'Sep 20, 2025' },
          activity: { lastLogin: 'Aug 26, 2025', recent: ['API call spike', 'Login attempt'] },
          security: { twoFAEnabled: true, sessions: 2, apiKeys: 3 },
          support: { openTickets: 1 },
          team: { members: ['John Doe', 'Jane Smith'] },
          usage: { usage: 75, quota: 100 },
          trends: { usage: [120, 190, 170, 220, 260, 210, 250], forecast: [130, 200, 180, 230, 270, 220, 260] },
          insights: { topUser: 'Alice', churnRisk: 'Low', segment: 'Enterprise' },
        };
        setData(mockData);
      } catch (err) {
        setError(true);
        console.error('Failed to fetch overview data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
}