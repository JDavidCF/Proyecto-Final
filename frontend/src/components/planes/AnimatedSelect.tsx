import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  hint?: string;
}

interface AnimatedSelectProps {
  id?: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
}

export function AnimatedSelect({
  id,
  label,
  value,
  onChange,
  options,
  placeholder = 'Seleccionar...',
  disabled = false,
  className = '',
  ariaLabel,
}: AnimatedSelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, []);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="block text-xs font-medium text-[#AAB8CC] mb-1.5"
        >
          {label}
        </label>
      )}
      <button
        id={id}
        type="button"
        disabled={disabled}
        aria-label={ariaLabel || label || placeholder}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => !disabled && setOpen((prev) => !prev)}
        className="w-full min-h-[40px] flex items-center justify-between gap-2 px-3.5 py-2 rounded-lg border border-[rgba(170,184,204,0.2)] bg-[#080D1B] text-sm text-[#EAF4FF] hover:border-[#176BFF]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176BFF] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <span className={`truncate ${selected ? 'text-[#EAF4FF]' : 'text-[#AAB8CC]/70'}`}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 shrink-0 text-[#AAB8CC] transition-transform duration-150 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
            className="absolute z-50 mt-1.5 w-full max-h-60 overflow-auto rounded-xl border border-[rgba(170,184,204,0.2)] bg-[#101B35] py-1 shadow-2xl"
          >
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <li key={opt.value} role="option" aria-selected={isSelected}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setOpen(false);
                    }}
                    className={`w-full px-3.5 py-2 text-left text-sm flex items-center justify-between gap-2 transition-colors ${
                      isSelected
                        ? 'bg-[#176BFF]/20 text-[#EAF4FF]'
                        : 'text-[#AAB8CC] hover:bg-[#EAF4FF]/5 hover:text-[#EAF4FF]'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="truncate font-medium">{opt.label}</div>
                      {opt.hint && (
                        <div className="truncate text-xs text-[#AAB8CC]/75">{opt.hint}</div>
                      )}
                    </div>
                    {isSelected && <Check className="w-4 h-4 shrink-0 text-[#00D9FF]" />}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
