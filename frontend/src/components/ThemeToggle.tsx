import { Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const isDark = theme === 'dark';
  const label = isDark ? t('Activar modo claro') : t('Activar modo oscuro');

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      aria-pressed={isDark}
      title={label}
      className={`relative inline-flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176BFF] overflow-hidden ${
        isDark
          ? 'border-[rgba(23,107,255,0.3)] bg-gradient-to-br from-[#101B35] to-[#152342] hover:border-[#176BFF]/60'
          : 'border-[rgba(51,153,195,0.3)] bg-gradient-to-br from-[#BDE4EF] to-[#E5F4F7] hover:border-[#3399C3]/60'
      } ${className}`}
    >
      {/* Indicator dot */}
      <span
        className={`absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full transition-colors duration-300 ${
          isDark ? 'bg-[#176BFF]' : 'bg-amber-400'
        }`}
        aria-hidden="true"
      />

      {/* Icon with AnimatePresence for smooth transition */}
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.span
            key="sun"
            aria-hidden="true"
            initial={{ rotate: -90, scale: 0.5, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: 90, scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex"
          >
            <Sun className="h-4 w-4 text-[#00D9FF]" />
          </motion.span>
        ) : (
          <motion.span
            key="moon"
            aria-hidden="true"
            initial={{ rotate: 90, scale: 0.5, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: -90, scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex"
          >
            <Moon className="h-4 w-4 text-[#237894]" />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
