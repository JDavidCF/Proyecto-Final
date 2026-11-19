import { LANGUAGES, useLanguage } from '../context/LanguageContext';

interface LanguageSelectorProps {
  className?: string;
}

export function LanguageSelector({ className = '' }: LanguageSelectorProps) {
  const { locale, setLocale, t } = useLanguage();

  return (
    <label className={`inline-flex items-center gap-2 ${className}`}>
      <span className="sr-only">{t('Idioma')}</span>
      <select
        aria-label={t('Idioma')}
        value={locale}
        onChange={(event) => setLocale(event.target.value as (typeof LANGUAGES)[number]['code'])}
        className="min-w-0 rounded-lg border border-[rgba(170,184,204,0.2)] bg-[#101B35] px-2.5 py-2 text-xs font-medium text-[#EAF4FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176BFF]"
      >
        {LANGUAGES.map(({ code, label }) => (
          <option key={code} value={code}>{label}</option>
        ))}
      </select>
    </label>
  );
}
