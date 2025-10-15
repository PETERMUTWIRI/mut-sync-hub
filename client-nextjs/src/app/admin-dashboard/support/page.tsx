"use client";
import SupportTicketsTable from '@/components/admin/components/SupportTicketsTable';

const SupportPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto py-12 px-4 md:px-8">
      <h1 className="text-4xl font-extrabold text-white mb-8 tracking-tight drop-shadow-lg">Support</h1>
      <div className="grid grid-cols-1 gap-8">
        <div className="rounded-2xl shadow-2xl bg-gradient-to-br from-yellow-700 to-orange-900 p-8">
          <SupportTicketsTable />
        </div>
      </div>
    </div>
  );
};

export default SupportPage;
