
'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const Navbar: React.FC = () => {
  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full backdrop-blur-md bg-dark-bg/90 border-b border-white/20 transition-all duration-300 shadow-lg'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center space-x-3">
            <Image
              src="/assets/images/mutsynchub-logo.png"
              alt="MutSyncHub Logo"
              width={32}
              height={32}
              priority // Optimize loading for above-the-fold content
            />
            <span className="text-xl font-semibold text-white font-inter">MutSyncHub</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex items-center justify-center flex-1 gap-6">
          {/* Static Dropdown */}
          <div className="relative group">
            <button
              className={cn(
                'flex items-center px-4 py-2 rounded-lg text-sm font-medium text-white bg-dark-bg hover:bg-primary/10 hover:text-primary transition-all duration-200'
              )}
              aria-haspopup="true"
              aria-expanded="false"
            >
              What We Do
              <ChevronDown
                className={cn('ml-1 h-4 w-4 transition-transform group-hover:rotate-180')}
                aria-hidden="true"
              />
            </button>
            <div
              className={cn(
                'absolute left-1/2 transform -translate-x-1/2 mt-2 w-[1100px] rounded-lg bg-dark-bg border border-white/20 shadow-xl p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto animate-fade-in'
              )}
            >
              <div className="grid grid-cols-3 gap-8">
                {/* What We Do */}
                <div>
                  <h4 className="text-white font-medium text-sm uppercase tracking-wider mb-4">
                    What We Do
                  </h4>
                  <Link
                    href="/solutions#ai-agents"
                    className={cn(
                      'block text-white hover:text-primary py-2 font-medium text-base leading-relaxed transition-colors flex items-center gap-3'
                    )}
                  >
                    <span>
                      <svg width="20" height="20" fill="none">
                        <path
                          d="M10 2a8 8 0 1 1 0 16A8 8 0 0 1 10 2Zm0 2a6 6 0 1 0 0 12A6 6 0 0 0 10 4Z"
                          fill="hsl(var(--primary))"
                        />
                      </svg>
                    </span>
                    AI Agent Ecosystems
                  </Link>
                  <Link
                    href="/solutions#cloud-architecture"
                    className={cn(
                      'block text-white hover:text-primary py-2 font-medium text-base leading-relaxed transition-colors flex items-center gap-3'
                    )}
                  >
                    <span>
                      <svg width="20" height="20" fill="none">
                        <path d="M16 10a4 4 0 1 0-8 0H4a6 6 0 1 1 12 0h-2Z" fill="hsl(var(--primary))" />
                      </svg>
                    </span>
                    Cloud-Native Architecture
                  </Link>
                  <Link
                    href="/solutions#data-engineering"
                    className={cn(
                      'block text-white hover:text-primary py-2 font-medium text-base leading-relaxed transition-colors flex items-center gap-3'
                    )}
                  >
                    <span>
                      <svg width="20" height="20" fill="none">
                        <rect x="4" y="4" width="12" height="12" rx="3" fill="hsl(var(--primary))" />
                      </svg>
                    </span>
                    Data Engineering
                  </Link>
                  <Link
                    href="/solutions#enterprise-chatbots"
                    className={cn(
                      'block text-white hover:text-primary py-2 font-medium text-base leading-relaxed transition-colors flex items-center gap-3'
                    )}
                  >
                    <span>
                      <svg width="20" height="20" fill="none">
                        <circle cx="10" cy="10" r="8" fill="hsl(var(--primary))" />
                        <rect x="7" y="7" width="6" height="6" rx="2" fill="hsl(var(--primary-foreground))" />
                      </svg>
                    </span>
                    Enterprise Chatbot Systems
                  </Link>
                </div>
                {/* More Services */}
                <div>
                  <h4 className="text-white font-medium text-sm uppercase tracking-wider mb-4">
                    More Services
                  </h4>
                  <Link
                    href="/solutions#fullstack"
                    className={cn(
                      'block text-white hover:text-primary py-2 font-medium text-base leading-relaxed transition-colors flex items-center gap-3'
                    )}
                  >
                    <span>
                      <svg width="20" height="20" fill="none">
                        <rect x="3" y="3" width="14" height="14" rx="4" fill="hsl(var(--primary))" />
                      </svg>
                    </span>
                    Full-Stack Development
                  </Link>
                  <Link
                    href="/solutions#api-integrations"
                    className={cn(
                      'block text-white hover:text-primary py-2 font-medium text-base leading-relaxed transition-colors flex items-center gap-3'
                    )}
                  >
                    <span>
                      <svg width="20" height="20" fill="none">
                        <rect x="5" y="5" width="10" height="10" rx="2" fill="hsl(var(--primary))" />
                      </svg>
                    </span>
                    Enterprise API Integrations
                  </Link>
                  <Link
                    href="/solutions#iot-cloud"
                    className={cn(
                      'block text-white hover:text-primary py-2 font-medium text-base leading-relaxed transition-colors flex items-center gap-3'
                    )}
                  >
                    <span>
                      <svg width="20" height="20" fill="none">
                        <circle cx="10" cy="10" r="8" fill="hsl(var(--primary))" />
                        <rect x="8" y="8" width="4" height="4" rx="1" fill="hsl(var(--primary-foreground))" />
                      </svg>
                    </span>
                    IoT Cloud Platforms
                  </Link>
                  <Link
                    href="/solutions#blockchain"
                    className={cn(
                      'block text-white hover:text-primary py-2 font-medium text-base leading-relaxed transition-colors flex items-center gap-3'
                    )}
                  >
                    <span>
                      <svg width="20" height="20" fill="none">
                        <rect x="6" y="6" width="8" height="8" rx="2" fill="hsl(var(--primary))" />
                      </svg>
                    </span>
                    Blockchain Integration
                  </Link>
                </div>
                {/* Resources and Support */}
                <div>
                  <h4 className="text-white font-medium text-sm uppercase tracking-wider mb-4">
                    Resources
                  </h4>
                  <Link
                    href="/resources?category=documentation"
                    className={cn(
                      'block text-white hover:text-primary py-2 font-medium text-base leading-relaxed transition-colors'
                    )}
                  >
                    Documentation
                  </Link>
                  <Link
                    href="/resources?category=api"
                    className={cn(
                      'block text-white hover:text-primary py-2 font-medium text-base leading-relaxed transition-colors'
                    )}
                  >
                    API Reference
                  </Link>
                  <Link
                    href="/resources?category=guides"
                    className={cn(
                      'block text-white hover:text-primary py-2 font-medium text-base leading-relaxed transition-colors'
                    )}
                  >
                    Guides & Tutorials
                  </Link>
                  <h4 className="text-white font-medium text-sm uppercase tracking-wider mt-6 mb-4">
                    Support
                  </h4>
                  <Link
                    href="/what-we-do-support"
                    className={cn(
                      'block text-white hover:text-primary py-2 font-medium text-base leading-relaxed transition-colors'
                    )}
                  >
                    Support Center
                  </Link>
                  <Link
                    href="/what-we-do-support"
                    className={cn(
                      'block text-white hover:text-primary py-2 font-medium text-base leading-relaxed transition-colors'
                    )}
                  >
                    Help Center
                  </Link>
                  <Link
                    href="/what-we-do-support"
                    className={cn(
                      'block text-white hover:text-primary py-2 font-medium text-base leading-relaxed transition-colors'
                    )}
                  >
                    Contact Us
                  </Link>
                  <Link
                    href="/what-we-do-support"
                    className={cn(
                      'block text-white hover:text-primary py-2 font-medium text-base leading-relaxed transition-colors'
                    )}
                  >
                    Community Forum
                  </Link>
                  <Link
                    href="/what-we-do-support"
                    className={cn(
                      'block text-white hover:text-primary py-2 font-medium text-base leading-relaxed transition-colors'
                    )}
                  >
                    System Status
                  </Link>
                </div>
              </div>
            </div>
          </div>
          {/* Analytics Engine */}
          <Link
            href="/user-dashboard-main"
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium text-white hover:text-primary hover:bg-primary/10 transition-all duration-200'
            )}
          >
            Analytics Engine
          </Link>
        </nav>

        {/* Auth Buttons */}
        <div className="flex items-center gap-2">
          <Link
            href="/sign-in"
            className={cn(
              'bg-transparent border border-white/20 text-white hover:bg-primary/10 hover:border-primary px-4 py-2 text-sm font-semibold rounded-md shadow-sm hover:shadow-md transition-all duration-200'
            )}
          >
            Login
          </Link>
          <Link
            href="/sign-up"
            className={cn(
              'bg-primary text-white px-4 py-2 text-sm font-semibold rounded-md hover:bg-primary/90 shadow-sm hover:shadow-md transition-all duration-200'
            )}
          >
            Sign Up
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
