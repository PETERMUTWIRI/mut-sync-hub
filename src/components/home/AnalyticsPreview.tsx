// src/components/home/AnalyticsPreview.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { BarChart4, Database, Gauge, ScrollText, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AnalyticsPreview = () => {
  const features = [
    {
      icon: <Database className="h-6 w-6 text-[#2E7D7D]" />,
      title: 'Unified Data Ecosystem',
      desc: 'Connect all your data sources into a single source of truth',
    },
    {
      icon: <BarChart4 className="h-6 w-6 text-[#2E7D7D]" />,
      title: 'Predictive Analytics',
      desc: 'AI-powered forecasting for accurate business planning',
    },
    {
      icon: <Gauge className="h-6 w-6 text-[#2E7D7D]" />,
      title: 'Real-time Dashboards',
      desc: 'Monitor KPIs with live, interactive visualizations',
    },
    {
      icon: <ScrollText className="h-6 w-6 text-[#2E7D7D]" />,
      title: 'Automated Reporting',
      desc: 'Schedule and distribute insights without manual effort',
    },
  ];

  const router = useRouter();

  return (
    <section className="bg-white py-16 px-6 text-[#1E2A44]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-block bg-[#2E7D7D]/10 px-4 py-1 rounded-full text-base font-semibold text-[#2E7D7D] mb-4">
              Analytics Engine
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1E2A44] mb-6">
              AI-Powered Business Intelligence
            </h2>
            <p className="text-lg text-[#4A5568] mb-8 max-w-2xl">
              Transform raw data into strategic insights with our enterprise-grade analytics platform. Designed for decision-makers who demand accuracy, speed, and depth.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              {features.map((feature, idx) => (
                <motion.div
                  key={idx}
                  className="bg-white border border-[#E2E8F0] p-5 rounded-md shadow-sm hover:shadow-md transition-shadow duration-300"
                  whileHover={{ y: -4 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <div className="mb-3">
                    <div className="bg-[#F7FAFC] border border-[#E2E8F0] rounded-md flex items-center justify-center w-12 h-12 mx-auto mb-1">
                      {feature.icon}
                    </div>
                  </div>
                  <h4 className="text-lg font-semibold text-[#1E2A44] mb-2">{feature.title}</h4>
                  <p className="text-base text-[#4A5568]">{feature.desc}</p>
                </motion.div>
              ))}
            </div>

            <Button
              size="lg"
              className="group bg-[#2E7D7D] text-white px-8 py-3 text-base font-semibold rounded-md hover:bg-[#256363] transition-colors duration-200 shadow-sm hover:shadow-md"
              onClick={() => router.push('/signup')}
            >
              Explore Analytics Engine
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>

          <div className="bg-[#2A3756] border border-[#E2E8F0]/30 rounded-2xl p-2">
            <div className="bg-[#1E2A44] rounded-xl overflow-hidden">
              <div className="h-8 bg-[#2A3756] flex items-center px-4">
                <div className="flex gap-1">
                  <div className="w-3 h-3 bg-[#E53E3E] rounded-full"></div>
                  <div className="w-3 h-3 bg-[#F6E05E] rounded-full"></div>
                  <div className="w-3 h-3 bg-[#38A169] rounded-full"></div>
                </div>
              </div>
              <div className="p-6">
                <div className="bg-[#2A3756] rounded-lg p-6 mb-6">
                  <div className="flex justify-between mb-4">
                    <div>
                      <h3 className="font-medium text-white">Revenue Dashboard</h3>
                      <p className="text-[#A0AEC0] text-sm">Real-time performance</p>
                    </div>
                    <div className="text-[#38A169] font-semibold">+24.7%</div>
                  </div>

                  <div className="h-48 relative">
                    {/* Chart placeholder */}
                    <div className="absolute bottom-0 left-0 right-0 h-[85%] grid grid-cols-7 gap-2 items-end">
                      {[40, 70, 55, 85, 65, 90, 75].map((height, idx) => (
                        <div
                          key={idx}
                          className="bg-gradient-to-t from-[#2E7D7D] to-[#256363] rounded-t"
                          style={{ height: `${height}%` }}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#2A3756] p-4 rounded-lg">
                    <div className="text-base font-semibold text-white mb-1">Customer Acquisition</div>
                    <div className="text-xl font-bold text-white">1,247</div>
                    <div className="text-[#38A169] text-sm font-semibold">+12.4%</div>
                  </div>
                  <div className="bg-[#2A3756] p-4 rounded-lg">
                    <div className="text-base font-semibold text-white mb-1">Churn Rate</div>
                    <div className="text-xl font-bold text-white">3.2%</div>
                    <div className="text-[#E53E3E] text-sm font-semibold">-1.8%</div>
                  </div>
                  <div className="bg-[#2A3756] p-4 rounded-lg">
                    <div className="text-base font-semibold text-white mb-1">Avg. Order Value</div>
                    <div className="text-xl font-bold text-white">$147.50</div>
                    <div className="text-[#38A169] text-sm font-semibold">+8.3%</div>
                  </div>
                  <div className="bg-[#2A3756] p-4 rounded-lg">
                    <div className="text-base font-semibold text-white mb-1">LTV</div>
                    <div className="text-xl font-bold text-white">$2,450</div>
                    <div className="text-[#38A169] text-sm font-semibold">+15.7%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AnalyticsPreview;