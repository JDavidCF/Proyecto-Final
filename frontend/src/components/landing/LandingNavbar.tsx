import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { StockNovaLogo } from '../StockNovaLogo';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { LanguageSelector } from '../LanguageSelector';
import { ThemeToggle } from '../ThemeToggle';

export function LandingNavbar() {
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { label: t('Inicio'), href: '#inicio' },
    { label: t('Funcionalidades'), href: '#funcionalidades' },
    { label: t('Módulos'), href: '#modulos' },
    { label: t('Nosotros'), href: '#nosotros' },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#080D1B]/88 backdrop-blur-md border-b border-[rgba(23,107,255,0.2)] shadow-[0_1px_20px_rgba(23,107,255,0.08)]'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Animated logo entrance */}
        <motion.a
          href="#inicio"
          aria-label={`StockNova ${t('Inicio')}`}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176BFF] rounded-lg"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <StockNovaLogo size={36} showWordmark />
        </motion.a>

        <nav aria-label={t('Navegación principal')} className="hidden md:flex items-center gap-7">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-[#AAB8CC] hover:text-[#EAF4FF] transition-colors whitespace-nowrap shrink-0 relative py-1
                after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[1.5px] after:w-0 hover:after:w-full
                after:bg-[#00D9FF] after:transition-all after:duration-250
                after:shadow-[0_0_6px_rgba(0,217,255,0.8)] hover:after:shadow-[0_0_8px_rgba(0,217,255,1)]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4 shrink-0">
          <LanguageSelector />
          <ThemeToggle />
          {isAuthenticated ? (
            <Link
              to="/app"
              className="relative px-4 py-2 rounded-lg bg-[#176BFF] hover:bg-[#2A7BFF] text-sm font-semibold text-[#EAF4FF] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D9FF] overflow-hidden group"
            >
              <span className="relative z-10">{t('Ir al panel')}</span>
              <span
                aria-hidden="true"
                className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-500 bg-gradient-to-r from-transparent via-white/15 to-transparent skew-x-12"
              />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-[#AAB8CC] hover:text-[#EAF4FF] transition-colors whitespace-nowrap shrink-0 px-2 py-1.5 relative overflow-hidden group rounded-lg"
              >
                <span className="relative z-10">{t('Iniciar sesión')}</span>
                <span
                  aria-hidden="true"
                  className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-500 bg-gradient-to-r from-transparent via-white/8 to-transparent skew-x-12"
                />
              </Link>
              <Link
                to="/register"
                className="relative px-4 py-2 rounded-lg bg-[#176BFF] hover:bg-[#2A7BFF] text-sm font-semibold text-[#EAF4FF] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D9FF] overflow-hidden group"
              >
                <span className="relative z-10">{t('Comenzar')}</span>
                <span
                  aria-hidden="true"
                  className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-500 bg-gradient-to-r from-transparent via-white/15 to-transparent skew-x-12"
                />
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label={mobileOpen ? t('Cerrar menú') : t('Abrir menú')}
          aria-expanded={mobileOpen}
          className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-lg border border-[rgba(170,184,204,0.2)] text-[#EAF4FF] hover:bg-[#101B35]"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="md:hidden bg-[#080D1B]/95 backdrop-blur-lg border-b border-[rgba(23,107,255,0.15)] px-4 pb-5 pt-2"
          >
            <nav className="flex flex-col gap-2">
              <div className="flex items-center justify-between px-3 py-2">
                <LanguageSelector />
                <ThemeToggle />
              </div>
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-2.5 rounded-lg text-sm font-medium text-[#AAB8CC] hover:text-[#EAF4FF] hover:bg-[#101B35]"
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-2 mt-2 border-t border-[rgba(170,184,204,0.12)] flex flex-col gap-2">
                {isAuthenticated ? (
                  <Link
                    to="/app"
                    onClick={() => setMobileOpen(false)}
                    className="w-full text-center px-4 py-2.5 rounded-lg bg-[#176BFF] text-sm font-semibold text-[#EAF4FF]"
                  >
                    {t('Ir al panel')}
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMobileOpen(false)}
                      className="w-full text-center px-4 py-2.5 rounded-lg border border-[rgba(170,184,204,0.2)] text-sm font-medium text-[#EAF4FF]"
                    >
                      {t('Iniciar sesión')}
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileOpen(false)}
                      className="w-full text-center px-4 py-2.5 rounded-lg bg-[#176BFF] text-sm font-semibold text-[#EAF4FF]"
                    >
                      {t('Comenzar')}
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
