// src/components/home/IndustryImpact.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { ShoppingCart, Factory, Activity, Truck, Hospital, CreditCard, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const IndustryImpact = () => {
  const industries = [
    {
      icon: <ShoppingCart className="h-12 w-12 text-[#2E7D7D]" />,
      name: 'Retail & E-commerce',
      impact: 'Increased revenue by 35% through AI-driven demand forecasting',
      description:
        'Our predictive analytics platform analyzes market trends, customer behavior, and inventory data to optimize stock levels and pricing strategies. Clients achieved a 25% reduction in overstock and a 35% increase in sales through personalized recommendations.',
      stats: '35% revenue increase | 25% inventory reduction',
    },
    {
      icon: <Factory className="h-12 w-12 text-[#2E7D7D]" />,
      name: 'Manufacturing',
      impact: 'Reduced downtime by 42% with predictive maintenance solutions',
      description:
        'Our IoT sensors and machine learning algorithms monitor equipment health in real-time, predicting failures before they occur. Manufacturers have minimized unexpected breakdowns, optimized maintenance schedules, and extended equipment lifespan by 30%.',
      stats: '42% downtime reduction | 30% equipment lifespan increase',
    },
    {
      icon: <Activity className="h-12 w-12 text-[#2E7D7D]" />,
      name: 'Financial Services',
      impact: 'Decreased fraud losses by 67% with real-time anomaly detection',
      description:
        'Our advanced fraud detection system uses behavioral biometrics and transaction pattern analysis to identify suspicious activities with 99.8% accuracy. Financial institutions have significantly reduced false positives while catching sophisticated fraud attempts.',
      stats: '67% fraud reduction | 99.8% detection accuracy',
    },
    {
      icon: <Truck className="h-12 w-12 text-[#2E7D7D]" />,
      name: 'Logistics',
      impact: 'Optimized routes reducing fuel costs by 28%',
      description:
        'Our route optimization platform combines traffic patterns, weather data, and delivery constraints to create the most efficient routes. Logistics companies have reduced mileage by 22%, decreased fuel consumption, and improved on-time delivery rates to 98.5%.',
      stats: '28% fuel cost reduction | 98.5% on-time delivery',
    },
    {
      icon: <Hospital className="h-12 w-12 text-[#2E7D7D]" />,
      name: 'Healthcare',
      impact: 'Improved patient outcomes with predictive analytics',
      description:
        'Our healthcare analytics platform identifies at-risk patients and predicts treatment outcomes. Hospitals have reduced readmission rates by 35%, decreased diagnostic errors by 42%, and improved patient satisfaction scores by 28%.',
      stats: '35% readmission reduction | 42% diagnostic error decrease',
    },
    {
      icon: <CreditCard className="h-12 w-12 text-[#2E7D7D]" />,
      name: 'Fintech',
      impact: 'Scaled transaction processing to handle 5M+ daily operations',
      description:
        'Our high-performance transaction processing engine handles massive volumes with sub-millisecond latency. Fintech companies have achieved 99.999% uptime while reducing processing costs by 40% and scaling to handle peak holiday volumes.',
      stats: '5M+ daily transactions | 99.999% uptime',
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [autoSlide, setAutoSlide] = useState(true);

  // Auto slide functionality
  useEffect(() => {
    if (!autoSlide) return;

    const interval = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % industries.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [autoSlide, industries.length]);

  const nextSlide = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % industries.length);
    setAutoSlide(false);
    setTimeout(() => setAutoSlide(true), 10000);
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + industries.length) % industries.length);
    setAutoSlide(false);
    setTimeout(() => setAutoSlide(true), 10000);
  };

  // Animation variants
  const cardVariants: Variants = {
    initial: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.8,
    }),
    animate: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 25,
        duration: 0.5,
      },
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -300 : 300,
      opacity: 0,
      scale: 0.8,
      transition: {
        duration: 0.3,
      },
    }),
  };

  return (
    <section className="relative bg-white py-16 px-6 text-[#1E2A44] overflow-hidden">
      {/* Subtle gradient overlays */}
      <div
        className="pointer-events-none absolute top-0 left-0 w-full h-16 z-10"
        style={{ background: 'linear-gradient(to bottom, rgba(46, 125, 125, 0.1) 0%, transparent 100%)' }}
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 w-full h-16 z-10"
        style={{ background: 'linear-gradient(to top, rgba(46, 125, 125, 0.1) 0%, transparent 100%)' }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <div className="inline-block bg-[#2E7D7D]/10 px-4 py-1 rounded-full text-base font-semibold text-[#2E7D7D] mb-4">
            Industry Impact
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-[#1E2A44]">
            Transforming Industries with Data Intelligence
          </h2>
          <p className="text-lg text-[#4A5568] max-w-3xl mx-auto mt-2">
            Proven results across diverse sectors through our tailored solutions
          </p>
        </div>

        {/* Carousel container */}
        <div className="relative h-[500px] md:h-[550px] overflow-hidden">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={cardVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="absolute inset-0 flex justify-center"
          >
            <div className="w-full max-w-4xl">
              <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] overflow-hidden">
                <div className="md:flex">
                  {/* Left side - Whitish background */}
                  <div className="md:w-2/5 p-8 flex flex-col justify-center items-center text-center bg-[#F7FAFC]">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                      className="mb-6"
                    >
                      {industries[currentIndex].icon}
                    </motion.div>
                    <h3 className="text-xl font-semibold text-[#1E2A44] mb-2">
                      {industries[currentIndex].name}
                    </h3>
                    <p className="text-base font-medium text-[#2E7D7D] mb-4">
                      {industries[currentIndex].impact}
                    </p>
                    <div className="bg-[#2E7D7D]/10 text-[#2E7D7D] px-3 py-1 rounded-full text-sm font-medium">
                      {industries[currentIndex].stats}
                    </div>
                  </div>

                  {/* Right side - Bluish background */}
                  <div className="md:w-3/5 p-8 bg-[#2A3756]">
                    <h4 className="text-base font-semibold text-white mb-4">Solution Overview</h4>
                    <p className="text-[#A0AEC0] mb-6 leading-relaxed">
                      {industries[currentIndex].description}
                    </p>

                    <div className="mt-8">
                      <h4 className="text-base font-semibold text-white mb-3">Key Benefits</h4>
                      <ul className="space-y-2">
                        {[
                          'Real-time analytics dashboard',
                          'AI-powered predictive models',
                          'Seamless integration with existing systems',
                          '24/7 monitoring and support',
                          'Customizable to specific industry needs',
                        ].map((item, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="text-[#2E7D7D] mr-2">✓</span>
                            <span className="text-[#A0AEC0]">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Navigation controls */}
        <div className="flex justify-center mt-8 space-x-4">
          <Button
            variant="outline"
            size="icon"
            onClick={prevSlide}
            className="rounded-full border-[#2E7D7D] text-[#2E7D7D] hover:bg-[#2E7D7D]/10 hover:border-[#256363] hover:text-[#256363]"
            aria-label="Previous"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>

          <div className="flex items-center space-x-2">
            {industries.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setDirection(idx > currentIndex ? 1 : -1);
                  setCurrentIndex(idx);
                  setAutoSlide(false);
                  setTimeout(() => setAutoSlide(true), 10000);
                }}
                className={`w-3 h-3 rounded-full transition-all ${
                  currentIndex === idx ? 'bg-[#2E7D7D] w-6' : 'bg-[#A0AEC0] hover:bg-[#2E7D7D]/60'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={nextSlide}
            className="rounded-full border-[#2E7D7D] text-[#2E7D7D] hover:bg-[#2E7D7D]/10 hover:border-[#256363] hover:text-[#256363]"
            aria-label="Next"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>

        {/* Industry indicators at bottom */}
        <div className="mt-12 flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
          {industries.map((industry, idx) => (
            <button
              key={idx}
              onClick={() => {
                setDirection(idx > currentIndex ? 1 : -1);
                setCurrentIndex(idx);
                setAutoSlide(false);
                setTimeout(() => setAutoSlide(true), 10000);
              }}
              className={`px-4 py-2 rounded-md transition-all flex items-center border ${
                currentIndex === idx
                  ? 'bg-[#2E7D7D] text-white shadow-sm'
                  : 'bg-white text-[#2E7D7D] border-[#E2E8F0] hover:bg-[#2E7D7D]/10 hover:border-[#2E7D7D]/50'
              }`}
            >
              <span className="mr-2">
                {React.cloneElement(industry.icon, {
                  className: `h-4 w-4 ${currentIndex === idx ? 'text-white' : 'text-[#2E7D7D]'}`,
                })}
              </span>
              {industry.name}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default IndustryImpact;