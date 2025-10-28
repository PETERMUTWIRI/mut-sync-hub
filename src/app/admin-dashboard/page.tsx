
'use client'; // Required for Client Component in Next.js App Router

import { HiUserGroup, HiCurrencyDollar, HiShieldCheck, HiClipboardList, HiUsers, HiCog } from 'react-icons/hi';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const RevenuePanel = dynamic(() => import('@/components/admin/RevenuePanel'), {
  ssr: false,
});

const DataSources = dynamic(() => import('@/components/admin/DataSources'), { ssr: false });
const NLQueries = dynamic(() => import('@/components/admin/NLQueries'), { ssr: false });
const Schedules = dynamic(() => import('@/components/admin/Schedules'), { ssr: false });

const AdminDashboard: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto py-12">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
        {/* Overview Title (left) */}
        <h1 className="text-4xl font-extrabold text-white tracking-tight drop-shadow-lg mb-4 md:mb-0 text-left">
          Overview
        </h1>
        {/* Welcome Banner (right) */}
        <div className="rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-900 shadow-xl p-8 flex flex-col justify-center animate-fade-in max-w-xl w-full md:w-auto">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-2">Welcome back, Admin!</h2>
          <p className="text-gray-300 text-lg">Here's a quick overview of your system health and activity.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
        {/* Data Sources Card */}
        <div className="rounded-2xl shadow-2xl bg-gradient-to-br from-blue-800 to-indigo-900 p-6 md:p-10 transition-transform duration-200 hover:scale-105 cursor-pointer flex flex-col items-center justify-center min-h-[180px]">
          <HiClipboardList className="text-cyan-400 text-4xl mb-2" />
          <DataSources />
        </div>
        {/* NL Queries Card */}
        <div className="rounded-2xl shadow-2xl bg-gradient-to-br from-purple-800 to-indigo-900 p-6 md:p-10 transition-transform duration-200 hover:scale-105 cursor-pointer flex flex-col items-center justify-center min-h-[180px]">
          <HiUsers className="text-purple-300 text-4xl mb-2" />
          <NLQueries />
        </div>
        {/* Schedules Card */}
        <div className="rounded-2xl shadow-2xl bg-gradient-to-br from-green-800 to-teal-900 p-6 md:p-10 transition-transform duration-200 hover:scale-105 cursor-pointer flex flex-col items-center justify-center min-h-[180px]">
          <HiCog className="text-green-300 text-4xl mb-2" />
          <Schedules />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 mt-8">
        {/* Total Users Card */}
        <div className="rounded-2xl shadow-2xl bg-gradient-to-br from-blue-700 to-indigo-900 p-6 md:p-10 transition-transform duration-200 hover:scale-105 cursor-pointer flex flex-col items-center justify-center min-h-[180px]">
          <HiUserGroup className="text-blue-300 text-4xl mb-2" />
          <div className="text-lg font-bold text-gray-200 mb-2">Total Users</div>
          <div className="text-4xl font-extrabold text-white mb-1">2,340</div>
          <div className="text-sm text-gray-400">Active Accounts</div>
          <div className="text-xs text-green-400 mt-2">+5% since last month</div>
        </div>
        {/* Revenue Card */}
        <div className="rounded-2xl shadow-2xl bg-gradient-to-br from-green-700 to-teal-900 p-6 md:p-10 transition-transform duration-200 hover:scale-105 cursor-pointer flex flex-col items-center justify-center min-h-[180px]">
          <HiCurrencyDollar className="text-green-300 text-4xl mb-2" />
          <RevenuePanel />
        </div>
        {/* System Status Card */}
        <div className="rounded-2xl shadow-2xl bg-gradient-to-br from-purple-700 to-indigo-900 p-6 md:p-10 transition-transform duration-200 hover:scale-105 cursor-pointer flex flex-col items-center justify-center min-h-[180px]">
          <HiShieldCheck className="text-purple-300 text-4xl mb-2" />
          <div className="text-lg font-bold text-gray-200 mb-2">System Status</div>
          <div className="text-4xl font-extrabold text-green-400 mb-1">All Systems Operational</div>
          <div className="text-sm text-gray-400">No major incidents</div>
          <div className="text-xs text-green-400 mt-2">100% uptime</div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-7 gap-6 md:gap-8 mt-8">
        {/* User Management Card */}
        <div className="col-span-1 md:col-span-5 rounded-2xl shadow-2xl bg-gradient-to-br from-cyan-800 to-blue-900 flex flex-col p-8 min-h-[340px]">
          <HiUsers className="text-cyan-300 text-4xl mb-2 self-center" />
          <div className="text-lg font-bold text-gray-200 mb-2 text-center">User Management</div>
          <div className="flex-1 overflow-y-auto bg-[#232347] rounded-lg p-4 text-gray-300 mb-4">
            <div className="text-gray-400 text-center">
              Navigate to the User Management page to view and manage users.
            </div>
          </div>
          <Link
            href="/admin/users"
            className="text-sm text-amber-500 hover:underline font-semibold mt-auto text-center"
          >
            Manage All Users
          </Link>
        </div>
        {/* Recent Audit Logs Card */}
        <div className="col-span-1 md:col-span-2 rounded-2xl shadow-2xl bg-gradient-to-br from-fuchsia-800 to-indigo-900 flex flex-col p-8 min-h-[340px]">
          <HiClipboardList className="text-fuchsia-300 text-4xl mb-2 self-center" />
          <div className="text-lg font-bold text-gray-200 mb-2 text-center">Recent Audit Logs</div>
          <div className="flex-1 overflow-y-auto">
            <div className="text-gray-400 text-center">
              Navigate to the Audit Logs page to view all logs.
            </div>
          </div>
          <Link
            href="/admin/audit-logs"
            className="text-sm text-amber-500 hover:underline font-semibold mt-4 text-center"
          >
            View All Logs
          </Link>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 mt-8">
        {/* Revenue Breakdown Card */}
        <div className="rounded-2xl shadow-2xl bg-gradient-to-br from-emerald-800 to-green-900 flex flex-col p-8 min-h-[240px] items-center justify-center">
          <HiCurrencyDollar className="text-emerald-300 text-4xl mb-2" />
          <div className="text-lg font-bold text-gray-200 mb-2">Revenue Breakdown</div>
          <div className="flex-1 w-full">
            <div className="flex items-center gap-3 py-2">
              <div className="h-3 w-3 rounded-full bg-green-400" />
              <div className="flex-1 text-gray-100">Enterprise</div>
              <div className="text-xs text-gray-400">$12,000</div>
            </div>
            <div className="flex items-center gap-3 py-2">
              <div className="h-3 w-3 rounded-full bg-blue-400" />
              <div className="flex-1 text-gray-100">SaaS</div>
              <div className="text-xs text-gray-400">$6,900</div>
            </div>
          </div>
          <Link
            href="/admin/revenue"
            className="text-sm text-amber-500 hover:underline font-semibold mt-4"
          >
            View Revenue Details
          </Link>
        </div>
        {/* System Alerts Card */}
        <div className="rounded-2xl shadow-2xl bg-gradient-to-br from-yellow-700 to-orange-900 flex flex-col p-8 min-h-[240px] items-center justify-center">
          <HiShieldCheck className="text-yellow-300 text-4xl mb-2" />
          <div className="text-lg font-bold text-gray-200 mb-2">System Alerts</div>
          <div className="flex-1 w-full overflow-y-auto">
            <div className="flex items-center gap-3 py-2">
              <div className="h-3 w-3 rounded-full bg-green-400" />
              <div className="flex-1 text-gray-100">No incidents reported</div>
              <div className="text-xs text-gray-400">2h ago</div>
            </div>
            <div className="flex items-center gap-3 py-2">
              <div className="h-3 w-3 rounded-full bg-yellow-400" />
              <div className="flex-1 text-gray-100">Scheduled maintenance</div>
              <div className="text-xs text-gray-400">1d ago</div>
            </div>
          </div>
          <Link
            href="/admin/system-status"
            className="text-sm text-amber-500 hover:underline font-semibold mt-4"
          >
            View System Status
          </Link>
        </div>
        {/* Admin Controls Card */}
        <div className="rounded-2xl shadow-2xl bg-gradient-to-br from-gray-700 to-gray-900 flex flex-col p-8 min-h-[240px] items-center justify-center">
          <HiCog className="text-gray-300 text-4xl mb-2" />
          <div className="text-lg font-bold text-gray-200 mb-2">Admin Controls</div>
          <div className="flex-1 w-full flex flex-col gap-2">
            <button className="w-full rounded-lg bg-[#232347] px-4 py-2 text-white font-semibold mb-2 hover:bg-[#282A36]">
              Invite User
            </button>
            <button className="w-full rounded-lg bg-[#232347] px-4 py-2 text-white font-semibold mb-2 hover:bg-[#282A36]">
              Manage Roles
            </button>
            <button className="w-full rounded-lg bg-[#232347] px-4 py-2 text-white font-semibold hover:bg-[#282A36]">
              System Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
