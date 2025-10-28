import * as React from 'react';

export interface SwitchProps {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  id?: string;
  className?: string;
}

const Switch: React.FC<SwitchProps> = ({ checked, onChange, onCheckedChange, disabled = false, label, id, className }) => {
  const handleChange = (checked: boolean) => {
    if (onChange) onChange(checked);
    if (onCheckedChange) onCheckedChange(checked);
  };
  return (
    <label className={`flex items-center gap-2 cursor-pointer select-none ${className}`} htmlFor={id}>
      {label && <span className="text-sm text-gray-300">{label}</span>}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        id={id}
        onClick={() => !disabled && handleChange(!checked)}
        className={`relative w-12 h-6 rounded-full transition ${checked ? 'bg-gradient-to-r from-teal-500 to-cyan-400' : 'bg-gray-700'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span
          className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${checked ? 'translate-x-6' : ''}`}
        />
      </button>
    </label>
  );
};

export default Switch;
