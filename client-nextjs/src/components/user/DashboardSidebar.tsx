"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
} from "lucide-react";
import { Tooltip } from "react-tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface SidebarProps {
  isSidebarOpen: boolean;
  displayName: string;
  avatarSrc?: string;
  handleLogout: () => void;
}

const navLinks = [
  { to: "/dashboard", label: "Dashboard", icon: <Home size={18} /> },
  { to: "/billing", label: "Billing", icon: <CreditCard size={18} /> },
  { to: "/analytics", label: "Analytics", icon: <BarChart2 size={18} /> },
  { to: "/calendar", label: "Calendar", icon: <Calendar size={18} /> },
  { to: "/notifications", label: "Notifications", icon: <Bell size={18} /> },
  { to: "/support", label: "Support", icon: <HelpCircle size={18} /> },
  { to: "/settings", label: "Security", icon: <Settings size={18} /> },
];

export default function Sidebar({
  isSidebarOpen,
  displayName,
  avatarSrc,
  handleLogout,
}: SidebarProps) {
  const pathname = usePathname();
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <aside
      className={`flex flex-col h-screen bg-[#1E1E2F] text-gray-300 transition-all duration-300 ${
        isSidebarOpen ? "w-60" : "w-16"
      }`}
    >
      {/* Navigation links */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 flex flex-col gap-1">
        {navLinks.map((link, idx) => (
          <div key={link.to} className="relative group">
            <Link
              href={link.to}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-200 text-sm font-medium ${
                pathname === link.to
                  ? "bg-[#2E7D7D] text-white"
                  : "hover:bg-[#2E7D7D]/50 hover:text-white"
              }`}
              aria-label={link.label}
              data-tooltip-id={`nav-${idx}`}
              data-tooltip-content={isSidebarOpen ? "" : link.label}
            >
              <span className="text-lg">{link.icon}</span>
              {isSidebarOpen && <span>{link.label}</span>}
            </Link>
            {!isSidebarOpen && <Tooltip id={`nav-${idx}`} />}
          </div>
        ))}

        {/* Profile + Logout right under Security */}
        <div
          className="flex items-center justify-between gap-2 px-3 py-2 mt-2 rounded-lg bg-[#2E7D7D]/10 hover:bg-[#2E7D7D]/20 transition-colors"
          onMouseEnter={() => isSidebarOpen && setProfileOpen(true)}
          onMouseLeave={() => isSidebarOpen && setProfileOpen(false)}
        >
          <div className="flex items-center gap-2 cursor-pointer">
            <Avatar className="w-8 h-8">
              {avatarSrc ? (
                <AvatarImage src={avatarSrc} alt={displayName} />
              ) : (
                <AvatarFallback className="bg-[#2E7D7D] text-white font-bold">
                  {displayName[0]?.toUpperCase() ?? "U"}
                </AvatarFallback>
              )}
            </Avatar>
            {isSidebarOpen && (
              <span className="text-white text-sm font-semibold truncate">
                {displayName}
              </span>
            )}
          </div>

          <Button
            onClick={handleLogout}
            variant="ghost"
            size="sm"
            className="flex items-center gap-1 px-2 py-1 rounded-md text-gray-300 hover:bg-red-900/50 hover:text-red-400"
          >
            <LogOut size={16} />
            {isSidebarOpen && <span className="text-sm">Logout</span>}
          </Button>
        </div>
      </nav>
    </aside>
  );
}
