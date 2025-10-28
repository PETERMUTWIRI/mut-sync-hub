'use client'; // Required for Client Component in Next.js App Router

import React from 'react';

interface DatePickerProps {
  date?: Date;
  onDateChange: (date: Date | undefined) => void;
  placeholder?: string;
  label?: string;
  id?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  date,
  onDateChange,
  placeholder = 'Select date',
  label = 'Select Date',
  id = 'date-picker',
}) => {
  return (
    <div className="flex flex-col">
      <label htmlFor={id} className="mb-1 text-sm font-medium text-gray-200">
        {label}
      </label>
      <input
        type="date"
        id={id}
        value={date ? date.toISOString().substring(0, 10) : ''}
        onChange={(e) => {
          const value = e.target.value;
          onDateChange(value ? new Date(value) : undefined);
        }}
        placeholder={placeholder}
        className="rounded-lg px-3 py-2 bg-[#232347] text-gray-200 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500 hover:border-amber-500 transition-colors duration-200"
        style={{ minWidth: '160px' }}
        aria-label={label}
      />
    </div>
  );
};