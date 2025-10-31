'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Tooltip } from 'react-tooltip';
import {
  Home,
  CreditCard,
  BarChart2,
  Calendar,
  Bell,
  HelpCircle,
  Settings,
  LogOut,
  User,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  displayName: string;
  avatarSrc?: string;
  handleLogout: () => void;
}

const navLinks = [
  { href: '/user-dashboard-main', label: 'Dashboard', icon: <Home size={20} /> },
  { href: '/user-dashboard-main/analytics', label: 'Analytics', icon: <BarChart2 size={20} /> },
  { href: '/user-dashboard-main/billing', label: 'Billing', icon: <CreditCard size={20} /> },
  { href: '/user-dashboard-main/data-source', label: 'Data-source', icon: <Calendar size={20} /> },
  { href: '/user-dashboard-main/notifications', label: 'Notifications', icon: <Bell size={20} /> },
  { href: '/user-dashboard-main/profile', label: 'Profile', icon: <User size={20} /> },
  { href: '/user-dashboard-main/support', label: 'Support', icon: <HelpCircle size={20} /> },
  { href: '/user-dashboard-main/security', label: 'Security', icon: <Settings size={20} /> },
];

export default function DashboardSidebar({ displayName, avatarSrc, handleLogout }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const NavItem = ({ href, label, icon }: typeof navLinks[0]) => (
    <Link
      href={href}
      className={`flex items-center gap-4 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg
        ${pathname === href ? 'bg-gradient-to-r from-teal-500 to-cyan-400 text-white shadow-md'
                            : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}
      aria-label={label}
      data-tooltip-id={collapsed ? href : undefined}
      data-tooltip-content={collapsed ? label : undefined}
    >
      <span className="text-xl">{icon}</span>
      {!collapsed && <span>{label}</span>}
    </Link>
  );

  return (
    <aside
      className={`shrink-0 flex flex-col h-screen bg-[#1E1E2F] text-gray-300 transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* ---- Top toggle ---- */}
      <div className="p-4 border-b border-white/10">
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* ---- Navigation ---- */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-3">
        {navLinks.map((link) => (
          <div key={link.href} className="relative group">
            <NavItem {...link} />
            {collapsed && <Tooltip id={link.href} />}
          </div>
        ))}
      </nav>

      {/* ---- Divider ---- */}
      <div className="px-6 my-4">
        <div className="h-px bg-white/10" />
      </div>

      {/* ---- Profile + Logout ---- */}
      <div className="p-4 border-t border-white/10">
        <div
          className={`flex items-center gap-3 px-3 py-3 rounded-xl bg-[#2E7D7D]/10 hover:bg-[#2E7D7D]/20 transition-all ${
            collapsed ? 'justify-center' : 'justify-between'
          }`}
        >
          <Avatar className="w-9 h-9">
            {avatarSrc ? (
              <AvatarImage src={avatarSrc} alt={displayName} />
            ) : (
              <AvatarFallback className="bg-[#2E7D7D] text-white font-bold text-xs">
                {displayName[0]?.toUpperCase() ?? 'U'}
              </AvatarFallback>
            )}
          </Avatar>
          {!collapsed && (
            <>
              <span className="text-white text-sm font-semibold truncate">{displayName}</span>
              <Button onClick={handleLogout} variant="ghost" size="sm" className="text-gray-300 hover:bg-red-900/50 hover:text-red-400">
                <LogOut size={16} />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* ---- Bottom toggle ---- */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="w-full h-10 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>
    </aside>
  );
}