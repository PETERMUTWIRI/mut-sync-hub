// src/components/admin/TopOrganizationsTable.tsx
'use client';

import { motion } from 'framer-motion';
import { HiBuildingOffice, HiCurrencyDollar, HiUserGroup } from 'react-icons/hi2';
import { useRouter } from 'next/navigation';

interface Organization {
  id: string;
  name: string;
  subdomain: string;
  plan?: { name: string; price: number } | null;
  _count: {
    userProfiles: number;
    payments: number;
  };
  totalRevenue?: number;
}

interface TopOrganizationsTableProps {
  organizations?: Organization[];
}

export function TopOrganizationsTable({ organizations = [] }: TopOrganizationsTableProps) {
  const router = useRouter();

  if (organizations.length === 0) {
    return (
      <div className="bg-cockpit-panel/50 rounded-2xl p-6 border border-cyan-500/10 backdrop-blur">
        <h3 className="text-lg font-bold text-cyan-400 mb-4 flex items-center gap-2">
          <HiBuildingOffice /> Top Organizations
        </h3>
        <div className="text-gray-500 py-8 text-center">
          No organization data available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-cockpit-panel/50 rounded-2xl p-6 border border-cyan-500/10 backdrop-blur">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-cyan-400 flex items-center gap-2">
          <HiBuildingOffice /> Top Organizations
        </h3>
        <span className="text-xs px-2 py-1 bg-gray-700 rounded text-gray-400">
          Total: {organizations.length}
        </span>
      </div>

      <div className="space-y-3">
        {organizations.map((org, index) => (
          <motion.div
            key={org.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.02, backgroundColor: 'rgba(30, 42, 68, 0.8)' }}
            className="flex items-center justify-between p-4 bg-cockpit-panel rounded-xl border border-gray-700 cursor-pointer transition-all"
            onClick={() => router.push(`/admin-dashboard/organizations/${org.id}`)}
          >
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white font-bold">
                {org.name.charAt(0).toUpperCase()}
              </div>
              
              <div>
                <div className="text-gray-200 font-semibold">{org.name}</div>
                <div className="text-xs text-gray-500 font-mono">
                  {org.subdomain}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <HiUserGroup className="text-cyan-400" />
                <span className="text-gray-300 font-mono">
                  {org._count.userProfiles}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <HiCurrencyDollar className="text-green-400" />
                <span className="text-gray-300 font-mono">
                  {org._count.payments}
                </span>
              </div>

              <div className="px-2 py-1 rounded-lg bg-gray-700">
                <span className={`text-xs font-bold ${
                  org.plan?.name === 'Enterprise' ? 'text-purple-400' : 'text-gray-400'
                }`}>
                  {org.plan?.name || 'Free'}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-700">
        <button
          onClick={() => router.push('/admin-dashboard/organizations')}
          className="w-full py-2 text-cyan-400 hover:bg-cyan-400/10 rounded-lg transition-colors font-medium"
        >
          View All Organizations →
        </button>
      </div>
    </div>
  );
}