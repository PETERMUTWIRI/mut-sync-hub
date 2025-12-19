// src/components/Navbar.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ChevronDown, 
  Menu, 
  X, 
  Briefcase, 
  BookOpen, 
  Headset, 
  Server, 
  LogIn, 
  UserCheck,
  LayoutGrid,
  Cpu,
  Cloud,
  Database,
  Bot,
  Globe,
  Code2
} from 'lucide-react';
import { cn } from '@/lib/utils';

const Navbar: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Desktop dropdown component
  const NavDropdown = ({ title, icon, links }: { title: string, icon: React.ReactNode, links: { label: string; href: string }[] }) => (
    <div 
      className="relative group"
      onMouseEnter={() => setActiveDropdown(title)}
      onMouseLeave={() => setActiveDropdown(null)}
    >
      <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white hover:text-cyan-400 hover:bg-white/5 transition-all duration-200">
        {icon}
        <span>{title}</span>
        <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
      </button>
      <div className={cn(
        "absolute left-0 mt-2 w-64 rounded-lg bg-[#1E2A44] border border-[#2E7D7D]/30 shadow-xl p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200",
        activeDropdown === title && "opacity-100 visible"
      )}>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-[#2E7D7D]/20 rounded-md transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );

  // Mobile accordion component
  const MobileAccordion = ({ title, icon, links }: { title: string, icon: React.ReactNode, links: { label: string; href: string }[] }) => (
    <div className="border-b border-[#2E7D7D]/20">
      <button
        onClick={() => setActiveDropdown(activeDropdown === title ? null : title)}
        className="w-full flex items-center justify-between px-4 py-3 text-white hover:text-cyan-400"
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-medium">{title}</span>
        </div>
        <ChevronDown className={cn('w-4 h-4 transition-transform', activeDropdown === title && 'rotate-180')} />
      </button>
      <div className={cn(
        'overflow-hidden transition-all duration-200',
        activeDropdown === title ? 'max-h-96' : 'max-h-0'
      )}>
        <div className="px-6 pb-3 space-y-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block text-sm text-gray-300 hover:text-cyan-400 py-2"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );

  // Mobile menu
  const MobileMenu = () => (
    <div className={cn('fixed inset-0 z-50 bg-black/70 backdrop-blur-md lg:hidden', open ? 'block' : 'hidden')} onClick={() => setOpen(false)}>
      <div className="absolute right-0 top-0 h-full w-4/5 max-w-sm bg-[#1E2A44] border-l border-[#2E7D7D]/30 p-4 flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <span className="text-white font-semibold">Menu</span>
          <button onClick={() => setOpen(false)} className="text-white">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto">
          <Link href="/" onClick={() => setOpen(false)} className="block px-4 py-3 text-white hover:text-cyan-400">Home</Link>
          
          <MobileAccordion
            title="Services"
            icon={<Briefcase size={16} />}
            links={[
              { label: 'AI Agent Ecosystems', href: '/solutions#ai-agents' },
              { label: 'Cloud Solutions', href: '/solutions#cloud-architecture' },
              { label: 'Data Engineering', href: '/solutions#data-engineering' },
              { label: 'Enterprise Chatbots', href: '/solutions#enterprise-chatbots' },
              { label: 'Web Development', href: '/solutions#fullstack' },
              { label: 'API Integrations', href: '/solutions#api-integrations' },
              { label: 'IoT Platforms', href: '/solutions#iot-cloud' },
              { label: 'Blockchain', href: '/solutions#blockchain' },
            ]}
          />

          <MobileAccordion
            title="Resources"
            icon={<BookOpen size={16} />}
            links={[
              { label: 'Documentation', href: '/resources?category=documentation' },
              { label: 'API Reference', href: '/resources?category=api' },
              { label: 'Guides & Tutorials', href: '/resources?category=guides' },
            ]}
          />

          <MobileAccordion
            title="Support"
            icon={<Headset size={16} />}
            links={[
              { label: 'Support Center', href: '/what-we-do-support' },
              { label: 'System Status', href: '/what-we-do-support' },
              { label: 'Contact Us', href: '/what-we-do-support' },
            ]}
          />

          {/* Analytics Engine always visible */}
          <Link
            href="/dashboard"
            onClick={() => setOpen(false)}
            className="block px-4 py-3 text-sm font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-2"
          >
            <Server size={16} />
            Analytics Engine
          </Link>
        </nav>

        {/* Auth buttons with icons */}
        <div className="mt-4 flex items-center gap-2">
          <Link href="/sign-in" onClick={() => setOpen(false)} className="flex-1 bg-white/10 text-white py-2 rounded-lg text-center text-sm flex items-center justify-center gap-2">
            <LogIn size={14} /> Login
          </Link>
          <Link href="/sign-up" onClick={() => setOpen(false)} className="flex-1 bg-cyan-500 text-black py-2 rounded-lg text-center text-sm flex items-center justify-center gap-2">
            <UserCheck size={14} /> Sign Up
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-[#1E2A44]/95 border-b border-[#2E7D7D]/30 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/assets/images/mutsynchub-logo.png"
              alt="MutSyncHub Logo"
              width={32}
              height={32}
              priority
            />
            <span className="text-xl font-semibold text-white hover:text-cyan-400 transition-colors">MutSyncHub</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-4">
            <NavDropdown
              title="Services"
              icon={<Briefcase size={16} className="text-cyan-400" />}
              links={[
                { label: 'AI Agent Ecosystems', href: '/solutions#ai-agents' },
                { label: 'Cloud Solutions', href: '/solutions#cloud-architecture' },
                { label: 'Data Engineering', href: '/solutions#data-engineering' },
                { label: 'Enterprise Chatbots', href: '/solutions#enterprise-chatbots' },
                { label: 'Web Development', href: '/solutions#fullstack' },
                { label: 'API Integrations', href: '/solutions#api-integrations' },
                { label: 'IoT Platforms', href: '/solutions#iot-cloud' },
                { label: 'Blockchain', href: '/solutions#blockchain' },
              ]}
            />

            <NavDropdown
              title="Resources"
              icon={<BookOpen size={16} className="text-blue-400" />}
              links={[
                { label: 'Documentation', href: '/resources?category=documentation' },
                { label: 'API Reference', href: '/resources?category=api' },
                { label: 'Guides & Tutorials', href: '/resources?category=guides' },
              ]}
            />

            <NavDropdown
              title="Support"
              icon={<Headset size={16} className="text-green-400" />}
              links={[
                { label: 'Support Center', href: '/what-we-do-support' },
                { label: 'System Status', href: '/what-we-do-support' },
                { label: 'Contact Us', href: '/what-we-do-support' },
              ]}
            />

            {/* Analytics Engine always visible */}
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-cyan-400 hover:text-cyan-300 hover:bg-white/5 transition-all duration-200"
            >
              <Server size={16} />
              Analytics Engine
            </Link>
          </nav>

          {/* Right side - Auth + Mobile */}
          <div className="flex items-center gap-3">
            {/* Desktop Auth Icons */}
            <div className="hidden lg:flex items-center gap-2">
              <Link
                href="/sign-in"
                className="p-2 rounded-lg text-white hover:text-cyan-400 hover:bg-white/5 transition-all duration-200"
                title="Login"
              >
                <LogIn size={18} />
              </Link>
              <Link
                href="/sign-up"
                className="p-2 rounded-lg text-white hover:text-cyan-400 hover:bg-white/5 transition-all duration-200"
                title="Sign Up"
              >
                <UserCheck size={18} />
              </Link>
            </div>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setOpen(true)}
              className="lg:hidden text-white hover:text-cyan-400"
              aria-label="Open menu"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <MobileMenu />
    </>
  );
};

export default Navbar;