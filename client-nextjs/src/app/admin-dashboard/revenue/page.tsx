"use client";
import RevenueChart from '@/components/admin/components/RevenueChart';
import PaymentsTable from '@/components/admin/components/PaymentsTable';

const RevenuePage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto py-12 px-4 md:px-8">
      <h1 className="text-4xl font-extrabold text-white mb-8 tracking-tight drop-shadow-lg">Revenue</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Revenue Chart Card */}
        <div className="rounded-2xl shadow-2xl bg-gradient-to-br from-emerald-800 to-green-900 p-8 flex flex-col items-center justify-center min-h-[420px]">
          <span className="flex items-center gap-2 mb-4 text-emerald-200 text-xl font-bold"><svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>Revenue Trend</span>
          <RevenueChart />
        </div>
        {/* Payments Table Card */}
        <div className="rounded-2xl shadow-2xl bg-gradient-to-br from-blue-800 to-indigo-900 p-8 flex flex-col items-center justify-center min-h-[420px]">
          <span className="flex items-center gap-2 mb-4 text-cyan-200 text-xl font-bold"><svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a5 5 0 00-10 0v2a2 2 0 00-2 2v7a2 2 0 002 2h10a2 2 0 002-2v-7a2 2 0 00-2-2z" /></svg>User Payments</span>
          <PaymentsTable />
        </div>
      </div>
    </div>
  );
};

export default RevenuePage;
