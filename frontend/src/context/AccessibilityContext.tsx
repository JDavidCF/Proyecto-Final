import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type FontScale = 'normal' | 'large' | 'larger';

interface AccessibilityContextValue {
  fontScale: FontScale;
  highContrast: boolean;
  setFontScale: (fontScale: FontScale) => void;
  toggleHighContrast: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextValue | null>(null);

function getInitialFontScale(): FontScale {
  const saved = localStorage.getItem('stocknova_font_scale');
  return saved === 'large' || saved === 'larger' ? saved : 'normal';
}

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [fontScale, setFontScale] = useState<FontScale>(getInitialFontScale);
  const [highContrast, setHighContrast] = useState(
    () => localStorage.getItem('stocknova_high_contrast') === 'true'
  );

  useEffect(() => {
    document.documentElement.dataset.fontScale = fontScale;
    localStorage.setItem('stocknova_font_scale', fontScale);
  }, [fontScale]);

  useEffect(() => {
    document.documentElement.dataset.contrast = highContrast ? 'high' : 'normal';
    localStorage.setItem('stocknova_high_contrast', String(highContrast));
  }, [highContrast]);

  const toggleHighContrast = () => setHighContrast((current) => !current);

  return (
    <AccessibilityContext.Provider
      value={{ fontScale, highContrast, setFontScale, toggleHighContrast }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility debe utilizarse dentro de AccessibilityProvider.');
  }
  return context;
}
