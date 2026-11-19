import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../../context/LanguageContext';

export interface HoverTabItem {
  id: string;
  label: string;
  subtitle: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

interface HoverTabsProps {
  items: HoverTabItem[];
  className?: string;
}

export function HoverTabs({ items, className = '' }: HoverTabsProps) {
  const { t } = useLanguage();
  const [activeId, setActiveId] = useState<string>(items[0]?.id ?? '');
  const activeItem = items.find((item) => item.id === activeId) ?? items[0];

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch ${className}`}>
      <div
        role="tablist"
        aria-label={t('Módulos de StockNova')}
        className="lg:col-span-5 flex flex-col gap-2"
      >
        {items.map((item) => {
          const isActive = item.id === activeId;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onMouseEnter={() => setActiveId(item.id)}
              onFocus={() => setActiveId(item.id)}
              onClick={() => setActiveId(item.id)}
              className={`relative text-left px-4 py-3.5 rounded-xl border transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176BFF] ${
                isActive
                  ? 'border-[#176BFF]/50 text-[#EAF4FF]'
                  : 'border-[rgba(170,184,204,0.12)] text-[#AAB8CC] hover:text-[#EAF4FF] hover:border-[rgba(170,184,204,0.25)]'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="hover-tabs-indicator"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  className="absolute inset-0 rounded-xl bg-[#101B35] -z-10"
                />
              )}
              <div className="flex items-start gap-3">
                <span
                  className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                    isActive
                      ? 'bg-[#176BFF]/15 border-[#176BFF]/40 text-[#00D9FF]'
                      : 'bg-[#080D1B]/70 border-[rgba(170,184,204,0.12)] text-[#AAB8CC]'
                  }`}
                >
                  {item.icon}
                </span>
                <div className="min-w-0">
                  <div className="font-display text-sm font-semibold tracking-tight text-[#EAF4FF]">
                    {item.label}
                  </div>
                  <p className="mt-0.5 text-xs leading-relaxed text-[#AAB8CC] line-clamp-2">
                    {item.subtitle}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="lg:col-span-7 flex">
        <div className="w-full rounded-2xl border border-[rgba(170,184,204,0.14)] bg-[#101B35]/90 p-5 sm:p-6 flex flex-col justify-between overflow-hidden">
          <AnimatePresence mode="wait">
            {activeItem && (
              <motion.div
                key={activeItem.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                className="h-full flex flex-col"
              >
                {activeItem.content}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
