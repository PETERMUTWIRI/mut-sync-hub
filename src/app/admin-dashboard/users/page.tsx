"use client";
import UserTable from '@/components/admin/components/UserTable';


const UserManagementPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto py-12 px-4 md:px-8 min-h-[80vh] flex flex-col">
      <h1 className="text-4xl font-extrabold text-white mb-8 tracking-tight drop-shadow-lg">User Management</h1>
      <div className="flex-1 flex flex-col rounded-2xl shadow-2xl bg-gradient-to-br from-cyan-800 to-blue-900 p-8">
        <UserTable />
      </div>
    </div>
  );
};

export default UserManagementPage;
