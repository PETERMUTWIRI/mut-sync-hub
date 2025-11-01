'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronDown, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const Navbar: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [accordion, setAccordion] = useState<string | null>(null);

  /* ----------  MOBILE ACCORDION ITEM  ---------- */
  const AccordionItem = ({ title, links }: { title: string; links: { label: string; href: string }[] }) => (
    <div className="border-b border-white/10">
      <button
        onClick={() => setAccordion((a) => (a === title ? null : title))}
        className="w-full flex items-center justify-between px-4 py-3 text-white hover:text-cyan-400"
      >
        <span className="text-sm font-medium">{title}</span>
        <ChevronDown
          className={cn('w-4 h-4 transition-transform', accordion === title && 'rotate-180')}
        />
      </button>
      <div
        className={cn(
          'overflow-hidden transition-all duration-200',
          accordion === title ? 'max-h-96' : 'max-h-0'
        )}
      >
        <div className="px-6 pb-3 space-y-2">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block text-sm text-gray-300 hover:text-cyan-400"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );

  /* ----------  MOBILE MENU  ---------- */
  const MobileMenu = () => (
    <div
      className={cn(
        'fixed inset-0 z-50 bg-black/70 backdrop-blur-md lg:hidden',
        open ? 'block' : 'hidden'
      )}
      onClick={() => setOpen(false)}
    >
      <div
        className="absolute right-0 top-0 h-full w-4/5 max-w-sm bg-[#0B1020] border-l border-white/10 p-4 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <span className="text-white font-semibold">Menu</span>
          <button onClick={() => setOpen(false)} className="text-white">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto">
          <Link href="/" onClick={() => setOpen(false)} className="block px-4 py-3 text-white hover:text-cyan-400">Home</Link>

          {/* Accordions */}
          <AccordionItem
            title="What We Do"
            links={[
              { label: 'AI Agent Ecosystems', href: '/solutions#ai-agents' },
              { label: 'Cloud-Native Architecture', href: '/solutions#cloud-architecture' },
              { label: 'Data Engineering', href: '/solutions#data-engineering' },
              { label: 'Enterprise Chatbot Systems', href: '/solutions#enterprise-chatbots' },
              { label: 'Full-Stack Development', href: '/solutions#fullstack' },
              { label: 'Enterprise API Integrations', href: '/solutions#api-integrations' },
              { label: 'IoT Cloud Platforms', href: '/solutions#iot-cloud' },
              { label: 'Blockchain Integration', href: '/solutions#blockchain' },
            ]}
          />

          <AccordionItem
            title="Resources"
            links={[
              { label: 'Documentation', href: '/resources?category=documentation' },
              { label: 'API Reference', href: '/resources?category=api' },
              { label: 'Guides & Tutorials', href: '/resources?category=guides' },
            ]}
          />

          <AccordionItem
            title="Support"
            links={[
              { label: 'Support Center', href: '/what-we-do-support' },
              { label: 'System Status', href: '/what-we-do-support' },
              { label: 'Contact Us', href: '/what-we-do-support' },
            ]}
          />

          <Link href="/user-dashboard-main" onClick={() => setOpen(false)} className="block px-4 py-3 text-white hover:text-cyan-400">Analytics Engine</Link>
        </nav>

        {/* Auth */}
        <div className="mt-4 flex gap-2">
          <Link href="/sign-in" onClick={() => setOpen(false)} className="flex-1 bg-white/10 text-white py-2 rounded-lg text-center text-sm">Login</Link>
          <Link href="/sign-up" onClick={() => setOpen(false)} className="flex-1 bg-cyan-500 text-black py-2 rounded-lg text-center text-sm">Sign Up</Link>
        </div>
      </div>
    </div>
  );

  /* ----------  DESKTOP MEGA-DROPDOWN (unchanged)  ---------- */
  const MegaDropdown = () => (
    <div className="relative group hidden lg:block">
      <button className="flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white bg-white/5 hover:bg-cyan-400/10 hover:text-cyan-400 transition-all duration-200">
        What We Do
        <ChevronDown className="ml-1 h-4 w-4 transition-transform group-hover:rotate-180" />
      </button>
      <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-[1100px] rounded-lg bg-[#0B1020] border border-white/10 shadow-xl p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto">
        <div className="grid grid-cols-3 gap-8">
          <div>
            <h4 className="text-white font-medium text-sm uppercase tracking-wider mb-4">What We Do</h4>
            <Link href="/solutions#ai-agents" className="block text-white hover:text-cyan-400 py-2">AI Agent Ecosystems</Link>
            <Link href="/solutions#cloud-architecture" className="block text-white hover:text-cyan-400 py-2">Cloud-Native Architecture</Link>
            <Link href="/solutions#data-engineering" className="block text-white hover:text-cyan-400 py-2">Data Engineering</Link>
            <Link href="/solutions#enterprise-chatbots" className="block text-white hover:text-cyan-400 py-2">Enterprise Chatbot Systems</Link>
          </div>
          <div>
            <h4 className="text-white font-medium text-sm uppercase tracking-wider mb-4">More Services</h4>
            <Link href="/solutions#fullstack" className="block text-white hover:text-cyan-400 py-2">Full-Stack Development</Link>
            <Link href="/solutions#api-integrations" className="block text-white hover:text-cyan-400 py-2">Enterprise API Integrations</Link>
            <Link href="/solutions#iot-cloud" className="block text-white hover:text-cyan-400 py-2">IoT Cloud Platforms</Link>
            <Link href="/solutions#blockchain" className="block text-white hover:text-cyan-400 py-2">Blockchain Integration</Link>
          </div>
          <div>
            <h4 className="text-white font-medium text-sm uppercase tracking-wider mb-4">Resources</h4>
            <Link href="/resources?category=documentation" className="block text-white hover:text-cyan-400 py-2">Documentation</Link>
            <Link href="/resources?category=api" className="block text-white hover:text-cyan-400 py-2">API Reference</Link>
            <Link href="/resources?category=guides" className="block text-white hover:text-cyan-400 py-2">Guides & Tutorials</Link>
            <h4 className="text-white font-medium text-sm uppercase tracking-wider mt-6 mb-4">Support</h4>
            <Link href="/what-we-do-support" className="block text-white hover:text-cyan-400 py-2">Support Center</Link>
            <Link href="/what-we-do-support" className="block text-white hover:text-cyan-400 py-2">System Status</Link>
          </div>
        </div>
      </div>
    </div>
  );

  /* ----------  MAIN RENDER  ---------- */
  return (
    <>
      <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-[#0B1020]/90 border-b border-white/10 shadow-lg">
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
            <span className="text-xl font-semibold text-white">MutSyncHub</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-6">
            <MegaDropdown />
            <Link
              href="/user-dashboard-main"
              className="px-4 py-2 rounded-lg text-sm font-medium text-white hover:bg-white/10 hover:text-cyan-400 transition-all duration-200"
            >
              Analytics Engine
            </Link>
          </nav>

          {/* Auth + Hamburger */}
          <div className="flex items-center gap-3">
            {/* Desktop Auth */}
            <div className="hidden lg:flex items-center gap-2">
              <Link
                href="/sign-in"
                className="bg-transparent border border-white/20 text-white hover:bg-white/10 hover:border-cyan-400 px-4 py-2 text-sm font-semibold rounded-md transition-all duration-200"
              >
                Login
              </Link>
              <Link
                href="/sign-up"
                className="bg-cyan-500 text-black px-4 py-2 text-sm font-semibold rounded-md hover:bg-cyan-400 transition-all duration-200"
              >
                Sign Up
              </Link>
            </div>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setOpen(true)}
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

export default Navbar;