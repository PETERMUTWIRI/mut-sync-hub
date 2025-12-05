// app/page.tsx

// import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ClientChrome as Chrome } from '@/components/Chrome';

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
    <Chrome>
      <div className="min-h-screen bg-gray-50 dark:bg-[#1E2A44]">
        <main className="w-full">
        <Suspense fallback={<div>Loading page...</div>}>
          <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-purple-500 min-h-screen">
            <HeroSection />
            <AboutSection />
            <EnterpriseTrust />
            <AnalyticsPreview />
            <SolutionsOverview />
            
            {/* Updated Explore More section with EnterpriseTrust theme */}
            <section className="bg-[#1E2A44] py-16 px-6">
              <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold text-white">
                    Explore More
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-[#2A3756] rounded-lg p-6 border border-[#E2E8F0]/20 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                    <h3 className="text-xl font-semibold text-white mb-4">Solutions</h3>
                    <p className="text-[#A0AEC0] mb-6">
                      Discover our full range of AI, cloud, and data solutions tailored for your business.
                    </p>
                    <Button asChild className="bg-[#2E7D7D] text-white hover:bg-[#256363] w-full">
                      <Link href="/solutions">View All Solutions</Link>
                    </Button>
                  </div>
                  <div className="bg-[#2A3756] rounded-lg p-6 border border-[#E2E8F0]/20 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                    <h3 className="text-xl font-semibold text-white mb-4">Resources</h3>
                    <p className="text-[#A0AEC0] mb-6">
                      Access documentation, guides, and tutorials to get started with MutSyncHub.
                    </p>
                    <Button asChild className="bg-[#2E7D7D] text-white hover:bg-[#256363] w-full">
                      <Link href="/resources">Explore Resources</Link>
                    </Button>
                  </div>
                  <div className="bg-[#2A3756] rounded-lg p-6 border border-[#E2E8F0]/20 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                    <h3 className="text-xl font-semibold text-white mb-4">Support</h3>
                    <p className="text-[#A0AEC0] mb-6">
                      Get help from our support team or check our community forums.
                    </p>
                    <Button asChild className="bg-[#2E7D7D] text-white hover:bg-[#256363] w-full">
                      <Link href="/what-we-do-support">Visit Support Center</Link>
                    </Button>
                  </div>
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
    </Chrome>
  );
}