// app/page.tsx
'use client';

// import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

import  HeroSection  from '@/components/home/HeroSection';
import  AboutSection from '@/components/home/AboutSection';
import { FAQSection } from '@/components/home/faq';
import { CTASection } from '@/components/home/cta';
import  AnalyticsPreview  from '@/components/home/AnalyticsPreview';
import  SolutionsOverview  from '@/components/home/SolutionsOverview';
import  EnterpriseTrust from '@/components/home/EnterpriseTrust';
import  IndustryImpact  from '@/components/home/IndustryImpact';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#1E2A44]">
      <main className="w-full">
        <Suspense fallback={<div>Loading page...</div>}>
          <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-purple-500 min-h-screen">
            <HeroSection />
            <AboutSection />
            <EnterpriseTrust />
            <AnalyticsPreview />
            <SolutionsOverview />
            <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold text-[#1E2A44] dark:text-[#E2E8F0] text-center mb-8">
                Explore More
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-[#2E3A59] p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold text-[#2E7D7D] mb-4">Solutions</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Discover our full range of AI, cloud, and data solutions tailored for your business.
                  </p>
                  <Button asChild className="bg-[#2E7D7D] text-white hover:bg-[#256363]">
                    <Link href="/solutions">View All Solutions</Link>
                  </Button>
                </div>
                <div className="bg-white dark:bg-[#2E3A59] p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold text-[#2E7D7D] mb-4">Resources</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Access documentation, guides, and tutorials to get started with MutSyncHub.
                  </p>
                  <Button asChild className="bg-[#2E7D7D] text-white hover:bg-[#256363]">
                    <Link href="/resources">Explore Resources</Link>
                  </Button>
                </div>
                <div className="bg-white dark:bg-[#2E3A59] p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold text-[#2E7D7D] mb-4">Support</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Get help from our support team or check our community forums.
                  </p>
                  <Button asChild className="bg-[#2E7D7D] text-white hover:bg-[#256363]">
                    <Link href="/what-we-do-support">Visit Support Center</Link>
                  </Button>
                </div>
              </div>
            </section>
            <IndustryImpact />
            <FAQSection />
            <CTASection />
          </div>
        </Suspense>
      </main>
    </div>
  );
}
