// src/components/support/ContactOption.tsx
import React from 'react';

interface ContactOptionProps {
  icon: React.ReactNode;
  title: string;
  details: string;
  actionText: string;
  href: string;
  onClick?: () => void;
}

const ContactOption: React.FC<ContactOptionProps> = ({ icon, title, details, actionText, href, onClick }) => {
  return (
    <div className="flex items-start gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-300">
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="font-medium text-gray-900 dark:text-white">{title}</h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">{details}</p>
      </div>
      {href ? (
        <a 
          href={href} 
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm whitespace-nowrap"
        >
          {actionText}
        </a>
      ) : (
        <button 
          onClick={onClick}
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm whitespace-nowrap"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default ContactOption;