"use client";
import { useEffect, useState } from 'react';
import { getUserGrowth, getRevenueTrend, getActiveUsersTrend, getChurnTrend } from '@/lib/user';
import AnalyticsLineChart from '@/components/admin/AnalyticsLineChart';
import api from '@/lib/api';

type ChartPoint = { date: string; value: number };

type StatChanges = {
  totalUsers: string;
  mrr: string;
  activeUsers: string;
  churnRate: string;
  uptime: string;
};

type Stats = {
  totalUsers: number | null;
  mrr: number | null;
  activeUsers: number | null;
  churnRate: number | null;
  uptime: string | null;
  changes: StatChanges;
  loading: boolean;
};

const initialStats: Stats = {
  totalUsers: null,
  mrr: null,
  activeUsers: null,
  churnRate: null,
  uptime: null,
  changes: {
    totalUsers: '+0%',
    mrr: '+0%',
    activeUsers: '+0%',
    churnRate: '0%',
    uptime: '0%',
  },
  loading: true,
};


const AdvancedAnalytics: React.FC = () => {
  const [profile, setProfile] = useState<any | null>(null);
  const user = profile; // keep variable name used later
  const [stats, setStats] = useState<Stats>(initialStats);
  // Chart state
  const [userGrowth, setUserGrowth] = useState<ChartPoint[]>([]);
  const [revenueTrend, setRevenueTrend] = useState<ChartPoint[]>([]);
  const [activeUsersTrend, setActiveUsersTrend] = useState<ChartPoint[]>([]);
  const [churnTrend, setChurnTrend] = useState<ChartPoint[]>([]);
  // Filters
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [plan, setPlan] = useState<string>('All');

  // Fetch chart data
  useEffect(() => {
    if (!user) return;
    let query = '';
    const params: string[] = [];
    if (plan && plan !== 'All') params.push(`plan=${encodeURIComponent(plan)}`);
    if (dateFrom) params.push(`dateFrom=${encodeURIComponent(dateFrom)}`);
    if (dateTo) params.push(`dateTo=${encodeURIComponent(dateTo)}`);
    if (params.length > 0) query = '?' + params.join('&');
    getUserGrowth(user.orgId, query).then(res => setUserGrowth(res.data.data)).catch(() => setUserGrowth([]));
    getRevenueTrend(user.orgId, query).then(res => setRevenueTrend(res.data.data)).catch(() => setRevenueTrend([]));
    getActiveUsersTrend(user.orgId, query).then(res => setActiveUsersTrend(res.data.data)).catch(() => setActiveUsersTrend([]));
    getChurnTrend(user.orgId, query).then(res => setChurnTrend(res.data.data)).catch(() => setChurnTrend([]));
  }, [user, plan, dateFrom, dateTo]);

  useEffect(() => {
    if (!user) return;
    setStats(s => ({ ...s, loading: true }));
    let query = '';
    const params: string[] = [];
    if (plan && plan !== 'All') params.push(`plan=${encodeURIComponent(plan)}`);
    if (dateFrom) params.push(`dateFrom=${encodeURIComponent(dateFrom)}`);
    if (dateTo) params.push(`dateTo=${encodeURIComponent(dateTo)}`);
    if (params.length > 0) query = '?' + params.join('&');
    Promise.all([
      api.get(`/admin/stats/users/${user.orgId}${query}`),
      api.get(`/admin/stats/mrr/${user.orgId}${query}`),
      api.get(`/admin/stats/active-users/${user.orgId}${query}`),
      api.get(`/admin/stats/churn/${user.orgId}${query}`),
      api.get('/system-status'),
    ]).then(([usersRes, mrrRes, activeRes, churnRes, uptimeRes]) => {
      setStats({
        totalUsers: typeof usersRes.data.count === 'number' ? usersRes.data.count : 0,
        mrr: typeof mrrRes.data.mrr === 'number' ? mrrRes.data.mrr : null,
        activeUsers: typeof activeRes.data.count === 'number' ? activeRes.data.count : null,
        churnRate: typeof churnRes.data.churn === 'number' ? churnRes.data.churn : null,
        uptime: uptimeRes.data.status === 'operational' ? '99.99%' : 'N/A',
        changes: {
          totalUsers: '+5%',
          mrr: '+3%', // Placeholder, update if backend provides change
          activeUsers: '+2%', // Placeholder
          churnRate: '-0.3%', // Placeholder
          uptime: '0%',
        },
        loading: false,
      });
    }).catch(() => setStats(s => ({ ...s, loading: false })));
  }, [user, plan, dateFrom, dateTo]);

  // Fetch profile once on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/org-profile', { credentials: 'include' });
        if (!res.ok) return;
        const json = await res.json();
        if (mounted) setProfile(json);
      } catch (e) {
        // ignore, default behavior will handle missing user
      }
    })();
    return () => { mounted = false; };
  }, []);

  const statCards = [
    {
      label: 'Total Users',
      value: stats.totalUsers !== null ? stats.totalUsers : '...',
      change: stats.changes.totalUsers,
      color: 'from-blue-700 to-indigo-900',
      icon: '👥',
    },
    {
      label: 'MRR',
      value: stats.mrr !== null ? `$${stats.mrr.toLocaleString()}` : '...',
      change: stats.changes.mrr,
      color: 'from-green-700 to-teal-900',
      icon: '💰',
    },
    {
      label: 'Active Users',
      value: stats.activeUsers !== null ? stats.activeUsers : '...',
      change: stats.changes.activeUsers,
      color: 'from-purple-700 to-indigo-900',
      icon: '🟢',
    },
    {
      label: 'Churn Rate',
      value: stats.churnRate !== null ? `${stats.churnRate}%` : '...',
      change: stats.changes.churnRate,
      color: 'from-red-700 to-pink-900',
      icon: '🔻',
    },
    {
      label: 'System Uptime',
      value: stats.uptime !== null ? stats.uptime : '...',
      change: stats.changes.uptime,
      color: 'from-emerald-800 to-green-900',
      icon: '⏱️',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto pt-4 pb-8">
      <h1 className="text-4xl font-extrabold text-white mb-8 tracking-tight drop-shadow-lg">Advanced Analytics</h1>
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-10">
        {statCards.map(card => (
          <div key={card.label} className={`rounded-2xl shadow-2xl bg-gradient-to-br ${card.color} p-6 flex flex-col items-center min-h-[120px] transition-transform duration-200 hover:scale-105 cursor-pointer`}>
            <div className="text-3xl mb-2">{card.icon}</div>
            <div className="text-lg font-bold text-gray-200 mb-1">{card.label}</div>
            <div className="text-3xl font-extrabold text-white mb-1">{card.value}</div>
            <div className="text-xs text-green-400">{card.change} this month</div>
          </div>
        ))}
      </div>
      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
      <div className="flex gap-2 items-center">
        <label className="text-gray-300 font-semibold">Date Range:</label>
        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="rounded px-2 py-1 bg-[#232347] text-gray-200 border border-[#282A36]" />
        <span className="text-gray-400">to</span>
        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="rounded px-2 py-1 bg-[#232347] text-gray-200 border border-[#282A36]" />
      </div>
      <div className="flex gap-2 items-center">
        <label className="text-gray-300 font-semibold">Plan:</label>
        <select value={plan} onChange={e => setPlan(e.target.value)} className="rounded px-2 py-1 bg-[#232347] text-gray-200 border border-[#282A36]">
          <option>All</option>
          <option>Free</option>
          <option>Pro</option>
          <option>Enterprise</option>
        </select>
      </div>
      </div>
      {/* Chart Placeholders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="rounded-2xl shadow-2xl bg-gradient-to-br from-blue-900 to-indigo-900 p-8 flex flex-col">
          <div className="text-lg font-bold text-cyan-200 mb-4">User Growth</div>
          <div className="flex-1 flex items-center justify-center text-gray-400 w-full">
            {userGrowth.length > 0 ? (
              <AnalyticsLineChart data={userGrowth.filter(p => (!dateFrom || p.date >= dateFrom) && (!dateTo || p.date <= dateTo))} color="#06b6d4" label="Users" />
            ) : '[User Growth Chart]'}
          </div>
        </div>
        <div className="rounded-2xl shadow-2xl bg-gradient-to-br from-green-900 to-teal-900 p-8 flex flex-col">
          <div className="text-lg font-bold text-green-200 mb-4">Revenue Trends</div>
          <div className="flex-1 flex items-center justify-center text-gray-400 w-full">
            {revenueTrend.length > 0 ? (
              <AnalyticsLineChart data={revenueTrend.filter(p => (!dateFrom || p.date >= dateFrom) && (!dateTo || p.date <= dateTo))} color="#22c55e" label="Revenue" />
            ) : '[Revenue Chart]'}
          </div>
        </div>
        <div className="rounded-2xl shadow-2xl bg-gradient-to-br from-purple-900 to-indigo-900 p-8 flex flex-col">
          <div className="text-lg font-bold text-purple-200 mb-4">Active Users</div>
          <div className="flex-1 flex items-center justify-center text-gray-400 w-full">
            {activeUsersTrend.length > 0 ? (
              <AnalyticsLineChart data={activeUsersTrend.filter(p => (!dateFrom || p.date >= dateFrom) && (!dateTo || p.date <= dateTo))} color="#a78bfa" label="Active Users" />
            ) : '[Active Users Chart]'}
          </div>
        </div>
        <div className="rounded-2xl shadow-2xl bg-gradient-to-br from-red-900 to-pink-900 p-8 flex flex-col">
          <div className="text-lg font-bold text-red-200 mb-4">Churn Rate</div>
          <div className="flex-1 flex items-center justify-center text-gray-400 w-full">
            {churnTrend.length > 0 ? (
              <AnalyticsLineChart data={churnTrend.filter(p => (!dateFrom || p.date >= dateFrom) && (!dateTo || p.date <= dateTo))} color="#f43f5e" label="Churn Rate" />
            ) : '[Churn Chart]'}
          </div>
        </div>
        <div className="rounded-2xl shadow-2xl bg-gradient-to-br from-emerald-900 to-green-900 p-8 flex flex-col md:col-span-2">
          <div className="text-lg font-bold text-emerald-200 mb-4">System Health</div>
          <div className="flex-1 flex items-center justify-center text-gray-400">[System Health/Uptime Chart]</div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedAnalytics;
