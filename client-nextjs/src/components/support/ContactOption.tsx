// client-nextjs/src/components/support/ContactOption.tsx
import React from 'react';

interface ContactOptionProps {
  icon: React.ReactNode;
  title: string;
  details: string;
  actionText: string;
  href?: string;
  onClick?: () => void;
}

const ContactOption: React.FC<ContactOptionProps> = ({ icon, title, details, actionText, href, onClick }) => {
  return (
    <div className="flex items-start gap-4 p-4 hover:bg-[#2E7D7D]/10 rounded-lg transition-colors border border-[#2E7D7D]/20">
      {/* icon */}
      <div className="p-2 bg-[#2E7D7D]/20 rounded-lg text-[#2E7D7D]">
        {icon}
      </div>

      {/* text */}
      <div className="flex-1">
        <h3 className="font-medium text-white">{title}</h3>
        <p className="text-gray-300 text-sm mt-1">{details}</p>
      </div>

      {/* CTA */}
      {href ? (
        <a
          href={href}
          className="text-[#2E7D7D] hover:text-teal-400 font-medium text-sm whitespace-nowrap"
        >
          {actionText}
        </a>
      ) : (
        <button
          onClick={onClick}
          className="text-[#2E7D7D] hover:text-teal-400 font-medium text-sm whitespace-nowrap"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default ContactOption;