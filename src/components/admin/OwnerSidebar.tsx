// src/components/admin/OwnerSidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HiHome, HiUserGroup, HiServer, HiCurrencyDollar, 
  HiWifi, HiClipboard, HiShieldCheck, HiCog,
  HiInbox, HiBell, HiArrowRightOnRectangle
} from 'react-icons/hi2';
import { cn } from '@/lib/utils';

interface OwnerSidebarProps {
  handleLogout?: () => Promise<void>;
}

const menuItems = [
  { href: '/admin-dashboard', icon: HiHome, label: 'Mission Control' },
  { href: '/admin-dashboard/users', icon: HiUserGroup, label: 'All Users' },
  { href: '/admin-dashboard/organizations', icon: HiServer, label: 'Organizations' },
  { href: '/admin-dashboard/revenue', icon: HiCurrencyDollar, label: 'Platform Revenue' },
  { href: '/admin-dashboard/api-usage', icon: HiWifi, label: 'API Usage' },
  { href: '/admin-dashboard/audit-logs', icon: HiClipboard, label: 'Global Audit Logs' },
  { href: '/admin-dashboard/system-status', icon: HiShieldCheck, label: 'System Health' },
  { href: '/admin-dashboard/support', icon: HiInbox, label: 'Global Support' },
  { href: '/admin-dashboard/notifications', icon: HiBell, label: 'Owner Notifications' },
  { href: '/admin-dashboard/settings', icon: HiCog, label: 'Owner Settings' },
];

export default function OwnerSidebar({ handleLogout }: OwnerSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-72 bg-cockpit-panel/50 backdrop-blur border-r border-cyan-500/10 p-6 h-screen sticky top-0 flex flex-col">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-cyan-400 flex items-center gap-2">
          <HiCog className="animate-spin-slow" />
          Owner Console
        </h1>
        <p className="text-gray-500 text-sm mt-2">Platform-wide control</p>
      </div>
      
      <nav className="space-y-2 flex-1">
        {menuItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                isActive 
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
                  : 'text-gray-400 hover:bg-cockpit-panel hover:text-white'
              )}
            >
              <Icon className="text-xl" />
              <span className="font-medium">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      {handleLogout && (
        <button
          onClick={handleLogout}
          className="mt-6 flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all border border-red-500/20"
          title="Logout"
        >
          <HiArrowRightOnRectangle className="text-xl rotate-180" />
          <span className="font-medium">Logout</span>
        </button>
      )}
    </aside>
  );
}