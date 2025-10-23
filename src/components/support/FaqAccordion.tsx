// src/components/support/FaqAccordion.tsx
import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Faq {
  question: string;
  answer: string;
}

interface FaqAccordionProps {
  faqs: Faq[];
}

const FaqAccordion: React.FC<FaqAccordionProps> = ({ faqs }) => {
  const [openIndex, setOpenIndex] = useState<number>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <div className="space-y-4">
      {faqs.map((faq: Faq, index: number) => (
        <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg">
          <button
            className="flex justify-between items-center w-full p-4 text-left"
            onClick={() => toggleFaq(index)}
          >
            <span className="font-medium text-gray-900 dark:text-white">{faq.question}</span>
            {openIndex === index ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          {openIndex === index && (
            <div className="p-4 pt-0 text-gray-600 dark:text-gray-300">
              {faq.answer}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default FaqAccordion;