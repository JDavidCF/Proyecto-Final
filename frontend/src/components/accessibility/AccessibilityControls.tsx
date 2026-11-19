import { useEffect, useRef, useState } from 'react';
import { Accessibility, Contrast, Type, X } from 'lucide-react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useLanguage } from '../../context/LanguageContext';

const FONT_SCALES = ['normal', 'large', 'larger'] as const;

export function AccessibilityControls() {
  const { fontScale, highContrast, setFontScale, toggleHighContrast } = useAccessibility();
  const { locale, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) return;
    const activeElement = document.activeElement;
    if (activeElement === document.body) triggerRef.current?.focus();
  }, [open]);

  return (
    <div
      className="fixed bottom-3 left-3 z-50 sm:bottom-4 sm:left-4"
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
      onKeyDown={(event) => {
        if (event.key === 'Escape') setOpen(false);
      }}
    >
      {open && (
        <section
          role="dialog"
          aria-label={t('Accesibilidad')}
          className="absolute bottom-16 left-0 w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-[rgba(170,184,204,0.2)] bg-[#101B35] p-4 shadow-2xl"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Accessibility className="h-4 w-4 text-[#00D9FF]" aria-hidden="true" />
              <h2 className="text-sm font-semibold text-[#EAF4FF]">{t('Accesibilidad')}</h2>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={t('Cerrar accesibilidad')}
              className="rounded-lg p-1.5 text-[#AAB8CC] hover:bg-[#080D1B] hover:text-[#EAF4FF]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <fieldset className="mt-4">
            <legend className="mb-2 flex items-center gap-2 text-xs font-medium text-[#AAB8CC]">
              <Type className="h-4 w-4" aria-hidden="true" />
              {t('Tamaño del texto')}
            </legend>
            <div className="grid grid-cols-3 gap-2">
              {FONT_SCALES.map((scale, index) => {
                const label = scale === 'normal'
                  ? t('Normal')
                  : scale === 'large'
                    ? t('Grande')
                    : t('Muy grande');
                return (
                  <button
                    key={scale}
                    type="button"
                    aria-label={label}
                    aria-pressed={fontScale === scale}
                    onClick={() => setFontScale(scale)}
                    className={`rounded-lg border px-2 py-2 text-xs font-medium transition-colors ${
                      fontScale === scale
                        ? 'border-[#176BFF] bg-[#176BFF]/20 text-[#EAF4FF]'
                        : 'border-[rgba(170,184,204,0.16)] text-[#AAB8CC] hover:bg-[#080D1B]'
                    }`}
                  >
                    <span className="block font-display text-base" aria-hidden="true">
                      {index === 0 ? 'A−' : index === 1 ? 'A' : 'A+'}
                    </span>
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <button
            type="button"
            aria-pressed={highContrast}
            onClick={toggleHighContrast}
            className="mt-4 flex w-full items-center justify-between gap-3 rounded-xl border border-[rgba(170,184,204,0.16)] px-3 py-2.5 text-start text-xs font-medium text-[#EAF4FF] transition-colors hover:bg-[#080D1B]"
          >
            <span className="flex items-center gap-2">
              <Contrast className="h-4 w-4 text-[#00D9FF]" aria-hidden="true" />
              {t('Alto contraste')}
            </span>
            <span className="text-[11px] text-[#AAB8CC]">
              {highContrast
                ? t('Contraste alto activado')
                : t('Contraste alto desactivado')}
            </span>
          </button>
        </section>
      )}

      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-label={t('Accesibilidad')}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(170,184,204,0.25)] bg-[#101B35] text-[#EAF4FF] shadow-lg transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D9FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#080D1B] sm:h-12 sm:w-12"
      >
        {open ? <X className="h-4 w-4 sm:h-5 sm:w-5" /> : <Accessibility className="h-4 w-4 sm:h-5 sm:w-5" />}
      </button>
    </div>
  );
}
