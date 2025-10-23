// src/components/home/FAQSection.tsx
'use client';

import React, { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { motion } from 'framer-motion';
import { ShieldCheck, Clock, Headset, Star } from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  icon: React.ReactNode;
}

const FAQ_DATA: FAQItem[] = [
  {
    id: 'item-1',
    question: 'What services does MutSyncHub offer?',
    answer:
      'We provide end-to-end digital transformation solutions including cloud computing, data automation, AI integration, and custom software development tailored to your business needs.',
    icon: <ShieldCheck className="text-[#2E7D7D] w-5 h-5" />,
  },
  {
    id: 'item-2',
    question: 'How long does implementation typically take?',
    answer:
      'Project timelines vary based on complexity, but most implementations range from 4–12 weeks. We provide a detailed roadmap after our initial consultation.',
    icon: <Clock className="text-[#2E7D7D] w-5 h-5" />,
  },
  {
    id: 'item-3',
    question: 'Do you offer ongoing support?',
    answer:
      'Yes, we provide comprehensive maintenance and support packages with 24/7 monitoring, regular updates, and dedicated account managers.',
    icon: <Headset className="text-[#2E7D7D] w-5 h-5" />,
  },
  {
    id: 'item-4',
    question: 'What makes MutSyncHub different?',
    answer:
      'Our unique Synchronized Technology Framework ensures all your systems work in harmony, eliminating data silos and creating seamless workflows across your organization.',
    icon: <Star className="text-[#2E7D7D] w-5 h-5" />,
  },
];

export const FAQSection: React.FC = () => {
  const [isChatHovered, setIsChatHovered] = useState(false);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { y: 10, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { duration: 0.3 } },
  };

  return (
    <section className="bg-white py-16 px-6">
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="mx-auto max-w-7xl"
      >
        <motion.div variants={item} className="text-center mb-12">
          <span className="inline-block bg-[#1E2A44] px-4 py-1 rounded-full text-sm font-semibold text-white shadow-md mb-4">
            FAQ
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#1E2A44]">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-[#4A5568] max-w-3xl mx-auto mt-2">
            Everything you need to know about our services, timelines, and support.
          </p>
        </motion.div>

        <Accordion type="multiple" className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FAQ_DATA.map((faq) => (
            <motion.div
              key={faq.id}
              variants={item}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="rounded-lg border border-[#E2E8F0] bg-white shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <AccordionItem value={faq.id} className="border-0">
                <AccordionTrigger className="text-left text-lg font-semibold text-[#1E2A44] px-6 py-4 hover:no-underline flex items-start gap-3">
                  <span className="mt-1">{faq.icon}</span>
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-base text-[#4A5568] px-6 pb-4">
                  <p>{faq.answer}</p>
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </Accordion>

        <motion.div
          variants={item}
          className="mt-12 text-center p-6 bg-white rounded-lg shadow-sm border border-[#E2E8F0]"
        >
          <h3 className="text-xl font-semibold text-[#1E2A44] mb-2">
            Need More Help?
          </h3>
          <p className="text-base text-[#4A5568] mb-4">
            Contact our support team for real-time assistance.
          </p>
          <motion.button
            className="inline-flex items-center gap-2 bg-[#2E7D7D] text-white px-6 py-2 rounded-md font-semibold hover:bg-[#256363] transition-colors duration-200"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onHoverStart={() => setIsChatHovered(true)}
            onHoverEnd={() => setIsChatHovered(false)}
            onClick={() => {
              if (window && window.dispatchEvent) {
                window.dispatchEvent(new CustomEvent('openChatWidget'));
              }
            }}
          >
            <motion.div
              animate={{ rotate: isChatHovered ? [0, 5, -5, 0] : 0 }}
              transition={{ duration: 0.4 }}
            >
              <Headset className="w-5 h-5" />
            </motion.div>
            Contact Support
          </motion.button>
        </motion.div>
      </motion.div>
    </section>
  );
};