// src/app/admin-dashboard/organizations/page.tsx
'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DataTable } from '@/components/admin/DataTable';
import { MetricCard } from '@/components/admin/MetricCard';
import { HiBuildingOffice, HiCurrencyDollar, HiUserGroup, HiWifi } from 'react-icons/hi2';

export default function OrganizationsPage() {
  const [selectedOrg, setSelectedOrg] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: organizations, isLoading } = useQuery({
    queryKey: ['admin-organizations'],
    queryFn: () => fetch('/api/admin/organizations', { credentials: 'include' }).then(r => r.json())
  });

  const columns = [
    { key: 'name', label: 'Organization' },
    { key: 'subdomain', label: 'Subdomain' },
    { 
      key: 'plan', 
      label: 'Plan',
      render: (plan: any) => plan?.name || 'Free'
    },
    { 
      key: '_count.userProfiles', 
      label: 'Users',
      render: (_: any, row: any) => row._count?.userProfiles || 0
    },
    { 
      key: '_count.payments', 
      label: 'Payments',
      render: (_: any, row: any) => row._count?.payments || 0
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (status: string) => (
        <span className={`px-2 py-1 rounded text-xs font-bold ${
          status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
        }`}>
          {status}
        </span>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-cockpit-bg p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-cyan-400">Organizations</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          icon={<HiBuildingOffice />}
          title="Total Orgs"
          value={organizations?.length || 0}
          change="+12%"
          color="cyan"
        />
        <MetricCard
          icon={<HiCurrencyDollar />}
          title="Revenue"
          value={`$${organizations?.reduce((acc: number, org: any) => acc + (org.totalRevenue || 0), 0).toLocaleString()}`}
          change="+8%"
          color="green"
        />
        <MetricCard
          icon={<HiUserGroup />}
          title="Total Users"
          value={organizations?.reduce((acc: number, org: any) => acc + (org._count?.userProfiles || 0), 0).toLocaleString() || 0}
          change="+5%"
          color="purple"
        />
        <MetricCard
          icon={<HiWifi />}
          title="Active APIs"
          value={organizations?.reduce((acc: number, org: any) => acc + (org._count?.apiKeys || 0), 0).toLocaleString() || 0}
          change="+3%"
          color="amber"
        />
      </div>

      <DataTable
        columns={columns}
        data={organizations}
        loading={isLoading}
        searchable
        searchKeys={['name', 'subdomain']}
        onRowClick={(row) => setSelectedOrg(row)}
      />

      {selectedOrg && (
        <div className="bg-cockpit-panel rounded-2xl p-6 border border-gray-700 mt-6">
          <h2 className="text-xl font-bold text-cyan-400">{selectedOrg.name}</h2>
          <p className="text-gray-400 mt-2">Plan: {selectedOrg.plan?.name || 'Free'}</p>
          <p className="text-gray-400">Users: {selectedOrg._count?.userProfiles || 0}</p>
          <p className="text-gray-400">Payments: {selectedOrg._count?.payments || 0}</p>
        </div>
      )}
    </div>
  );
}