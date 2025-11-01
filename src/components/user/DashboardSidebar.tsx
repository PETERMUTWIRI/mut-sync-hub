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
  ChevronDown,
  ChevronUp,
  Menu,
  X,
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

function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

export default function DashboardSidebar({ displayName, avatarSrc, handleLogout }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const NavItem = ({ href, label, icon }: typeof navLinks[0]) => (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
        ${pathname === href
          ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-black'
          : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}
      aria-label={label}
      data-tooltip-id={collapsed ? href : undefined}
      data-tooltip-content={collapsed ? label : undefined}
      onClick={() => setMobileOpen(false)}
    >
      <span className="text-base">{icon}</span>
      {!collapsed && <span>{label}</span>}
    </Link>
  );

  /* ----------  MOBILE MENU  ---------- */
  const MobileMenu = () => (
    <div
      className={cn(
        'fixed inset-0 z-50 bg-black/70 backdrop-blur-md lg:hidden',
        mobileOpen ? 'block' : 'hidden'
      )}
      onClick={() => setMobileOpen(false)}
    >
      <div
        className="absolute right-0 top-0 h-full w-4/5 max-w-sm bg-[#0B1020] border-l border-white/10 p-6 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <span className="text-white font-semibold">Menu</span>
          <button onClick={() => setMobileOpen(false)} className="text-white">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 space-y-3">
          {navLinks.map((link) => (
            <NavItem key={link.href} {...link} />
          ))}
        </nav>

        {/* Avatar + Logout */}
        <div className="mt-6 flex items-center gap-4">
          <Avatar className="w-10 h-10">
            {avatarSrc ? (
              <AvatarImage src={avatarSrc} alt={displayName} />
            ) : (
              <AvatarFallback className="bg-cyan-400 text-black font-bold">
                {displayName[0]?.toUpperCase() ?? 'U'}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="flex-1">
            <p className="text-white text-sm font-semibold">{displayName}</p>
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="text-red-400 hover:text-red-300"
            >
              <LogOut size={16} className="mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  /* ----------  MAIN RENDER  ---------- */
  return (
    <>
      {/* ----------  TOP BAR  ---------- */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#0B1020]/90 border-b border-white/10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo + Collapse Toggle (desktop) */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3">
              <img
                src="/assets/images/mutsynchub-logo.png"
                alt="Logo"
                className="w-8 h-8"
              />
              {!collapsed && (
                <span className="text-white font-semibold">MutSyncHub</span>
              )}
            </Link>

            {/* Desktop collapse */}
            <button
              onClick={() => setCollapsed((c) => !c)}
              className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white"
              aria-label={collapsed ? 'Expand' : 'Collapse'}
            >
              {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </button>
          </div>

          {/* Desktop Nav */}
          <nav className={cn(
            'hidden lg:flex items-center gap-2',
            collapsed ? 'gap-1' : 'gap-3'
          )}>
            {navLinks.map((link) => (
              <NavItem key={link.href} {...link} />
            ))}
          </nav>

          {/* Avatar + Mobile Hamburger */}
          <div className="flex items-center gap-3">
            {/* Desktop Avatar + Logout */}
            <div className={cn('hidden lg:flex items-center gap-3', collapsed && 'gap-2')}>
              <Avatar className="w-9 h-9">
                {avatarSrc ? (
                  <AvatarImage src={avatarSrc} alt={displayName} />
                ) : (
                  <AvatarFallback className="bg-cyan-400 text-black font-bold text-xs">
                    {displayName[0]?.toUpperCase() ?? 'U'}
                  </AvatarFallback>
                )}
              </Avatar>
              {!collapsed && (
                <>
                  <span className="text-white text-sm font-semibold">{displayName}</span>
                  <Button
                    onClick={handleLogout}
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-300"
                  >
                    <LogOut size={16} />
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden text-white"
              aria-label="Open menu"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Portal */}
      <MobileMenu />
    </>
  );
};
