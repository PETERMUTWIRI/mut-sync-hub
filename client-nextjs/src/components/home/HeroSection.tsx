'use client';

import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const trustLogos = [
  '/assets/logos/aws.svg',
  '/assets/logos/cisco.svg',
  '/assets/logos/fortinet.svg',
  '/assets/logos/gdpr.svg',
  '/assets/logos/googlecloud.svg',
  '/assets/logos/ibm.svg',
  '/assets/logos/iso.svg',
  '/assets/logos/microsoft.svg',
  '/assets/logos/nist.svg',
  '/assets/logos/oracle.svg',
  '/assets/logos/sap.svg',
];

export default function HeroSection() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    const generateData = (count: number) => {
      const data = [];
      let lastRevenue = 500;
      let lastVolume = 200;

      for (let i = 0; i < count; i++) {
        const trend = Math.sin(i / 20) * 0.8 + Math.cos(i / 8) * 0.5;
        const volatility = Math.random() * 0.4 + 0.8;
        const revenue = lastRevenue * (1 + trend * 0.02 * volatility);
        const volume = lastVolume * (1 + trend * 0.03 * volatility);
        data.push({ x: i, revenue: Math.max(100, revenue), volume: Math.max(50, volume) });
        lastRevenue = revenue;
        lastVolume = volume;
      }
      return data;
    };

    const data = generateData(150);
    let animationFrame: number;
    let progress = 0;

    const animate = () => {
      if (!ctx) return;
      ctx.fillStyle = '#1E2A44';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const visiblePoints = Math.min(data.length, Math.floor(progress * data.length));
      const visibleData = data.slice(0, visiblePoints);

      if (visibleData.length < 2) {
        progress += 0.01;
        animationFrame = requestAnimationFrame(animate);
        return;
      }

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      const gridSize = 80;
      for (let x = gridSize; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = gridSize; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      const margin = 80;
      const graphWidth = canvas.width - margin * 2;
      const graphHeight = canvas.height - margin * 2;
      const minRevenue = Math.min(...visibleData.map((d) => d.revenue));
      const maxRevenue = Math.max(...visibleData.map((d) => d.revenue));
      const minVolume = Math.min(...visibleData.map((d) => d.volume));
      const maxVolume = Math.max(...visibleData.map((d) => d.volume));

      const barWidth = graphWidth / visibleData.length;
      visibleData.forEach((point, i) => {
        const x = margin + i * barWidth;
        const barHeight = (point.volume / maxVolume) * graphHeight * 0.3;
        const y = canvas.height - margin - barHeight;
        const isUp = i > 0 && point.volume > visibleData[i - 1].volume;
        ctx.fillStyle = isUp ? '#38A169' : '#E53E3E';
        ctx.fillRect(x, y, barWidth * 0.8, barHeight);
      });

      ctx.beginPath();
      ctx.strokeStyle = '#2E7D7D';
      ctx.lineWidth = 3;
      ctx.lineJoin = 'round';
      visibleData.forEach((point, i) => {
        const x = margin + i * barWidth + barWidth / 2;
        const y = margin + graphHeight - ((point.revenue - minRevenue) / (maxRevenue - minRevenue)) * graphHeight;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      if (visibleData.length > 1) {
        const lastPoint = visibleData[visibleData.length - 1];
        const lastX = margin + (visibleData.length - 1) * barWidth + barWidth / 2;
        const lastY = margin + graphHeight - ((lastPoint.revenue - minRevenue) / (maxRevenue - minRevenue)) * graphHeight;
        ctx.beginPath();
        ctx.moveTo(margin, margin + graphHeight);
        visibleData.forEach((point, i) => {
          const x = margin + i * barWidth + barWidth / 2;
          const y = margin + graphHeight - ((point.revenue - minRevenue) / (maxRevenue - minRevenue)) * graphHeight;
          ctx.lineTo(x, y);
        });
        ctx.lineTo(lastX, margin + graphHeight);
        ctx.closePath();
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, 'rgba(46, 125, 125, 0.3)');
        gradient.addColorStop(1, 'rgba(46, 125, 125, 0)');
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      ctx.fillStyle = '#A0AEC0';
      ctx.font = '12px Arial';
      ctx.fillText(`$${Math.round(maxRevenue / 1000)}K`, 10, margin + 15);
      ctx.fillText(`$${Math.round(minRevenue / 1000)}K`, 10, canvas.height - margin);

      if (visibleData.length > 1) {
        const lastPoint = visibleData[visibleData.length - 1];
        const lastX = margin + (visibleData.length - 1) * barWidth + barWidth / 2;
        const lastY = margin + graphHeight - ((lastPoint.revenue - minRevenue) / (maxRevenue - minRevenue)) * graphHeight;
        ctx.beginPath();
        ctx.arc(lastX, lastY, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#2E7D7D';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(lastX, lastY, 10, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(46, 125, 125, 0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 14px Arial';
        ctx.fillText(`$${Math.round(lastPoint.revenue)}`, lastX + 15, lastY - 10);
      }

      progress += 0.005;
      if (progress < 1.1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        progress = 0;
        setTimeout(() => {
          animationFrame = requestAnimationFrame(animate);
        }, 2000);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <>
      <style jsx>{`
        @keyframes logo-marquee {
          0% {
            transform: translateX(100vw);
          }
          100% {
            transform: translateX(-100vw);
          }
        }
        .animate-logo-marquee {
          animation: logo-marquee 30s linear infinite;
          display: flex;
          align-items: center;
        }
      `}</style>
      <div className="relative">
        <div className="relative overflow-hidden w-full h-[700px] flex items-center justify-start">
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover z-0" />
          <div className="absolute inset-0 bg-[#1E2A44]/70 z-10" />
          <div className="relative z-20 flex flex-col justify-center items-start h-full px-8 md:px-24 pt-24">
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="text-white text-4xl md:text-6xl font-bold mb-6 max-w-2xl"
            >
              The Intelligence Platform for Modern Enterprises
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 1 }}
              className="text-lg md:text-xl text-[#A0AEC0] font-normal max-w-2xl mb-8 leading-relaxed"
            >
              Accurate, Secure, and Scalable.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 1 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button
                size="lg"
                className="group bg-[#2E7D7D] text-white px-8 py-3 text-base font-semibold rounded-md hover:bg-[#256363] transition-colors duration-200 shadow-sm hover:shadow-md"
                onClick={() => router.push('/signup')}
              >
                Explore Analytics Engine
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                variant="outline"
                className="bg-transparent border-[#E2E8F0] text-[#2E7D7D] hover:bg-[#2E7D7D]/10 hover:border-[#256363] px-8 py-3 text-base font-semibold rounded-md"
                onClick={() => router.push('/solutions')}
              >
                View Enterprise Solutions
              </Button>
            </motion.div>
          </div>
        </div>
        <section className="w-full py-8 px-0 bg-white border-t border-[#E2E8F0]">
          <div className="overflow-hidden">
            <motion.div
              className="flex gap-8 animate-logo-marquee py-4 w-max min-w-[100vw]"
              aria-label="Trusted Companies Carousel"
            >
              {[...trustLogos, ...trustLogos].map((src, idx) => (
                <motion.div
                  key={idx}
                  className="rounded-full bg-[#F7FAFC] p-3 flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
                  tabIndex={0}
                  aria-label="Trusted Company Logo"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.img
                    src={src}
                    alt="Enterprise Logo"
                    className="h-10 w-10 object-contain grayscale hover:grayscale-0 opacity-80 hover:opacity-100 transition rounded-full"
                    draggable={false}
                    whileHover={{ scale: 1.1 }}
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>
          <div className="max-w-7xl mx-auto px-4 mt-4">
            <p className="text-center text-[#1E2A44] text-base font-semibold">
              Trusted by enterprises worldwide and compliant with industry-leading standards
            </p>
          </div>
        </section>
      </div>
    </>
  );
}