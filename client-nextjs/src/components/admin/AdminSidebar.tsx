"use client";
import React from 'react';
import Link from 'next/link';
import { FaHome, FaChartBar, FaUsers, FaFileAlt, FaMoneyBill, FaCog, FaSignOutAlt } from 'react-icons/fa';
// Removed useNeonUser import
import { useRouter } from 'next/navigation';

const navItems = [
  { to: '/admin', icon: <FaHome />, label: 'Dashboard' },
  { to: '/admin/analytics', icon: <FaChartBar />, label: 'Analytics' },
  { to: '/admin/audit-logs', icon: <FaFileAlt />, label: 'Audit Logs' },
  { to: '/admin/revenue', icon: <FaMoneyBill />, label: 'Revenue' },
  { to: '/admin/users', icon: <FaUsers />, label: 'Users/Orgs' },
  { to: '/admin/settings', icon: <FaCog />, label: 'Settings' },
];



interface AdminSidebarProps {
  user?: any;
  isAuthenticated?: boolean;
  loading?: boolean;
  role?: string;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ user, isAuthenticated, loading, role }) => {
  const router = useRouter();

  const handleLogout = () => {
    // Implement logout logic using Stack Auth or Next.js
    router.replace('/');
  };

  return (
    <aside className="w-24 bg-white border-r flex flex-col items-center py-6 shadow-md min-h-screen">
      {/* Sidebar header */}
      <div className="mb-10 flex flex-col items-center">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold text-lg mb-1 shadow-lg">M</div>
        <span className="text-xs font-bold text-gray-700 tracking-wide text-center">MutSyncHub Admin</span>
      </div>
      <nav className="flex-1 flex flex-col items-center w-full">
        {navItems.map((item) => (
          <Link
            key={item.to}
            href={item.to}
            className="flex flex-col items-center mb-8 text-xl transition-colors duration-150 text-gray-400 hover:text-blue-500 w-full py-2"
            title={item.label}
          >
            {item.icon}
            <span className="text-xs mt-1">{item.label}</span>
          </Link>
        ))}
      </nav>
      {/* Logout button */}
      <button
        onClick={handleLogout}
        className="flex flex-col items-center text-xl text-gray-400 hover:text-red-500 mt-8 mb-2 transition-colors duration-150"
        title="Logout"
      >
        <FaSignOutAlt />
        <span className="text-xs mt-1">Logout</span>
      </button>
    </aside>
  );
};

export default AdminSidebar;
