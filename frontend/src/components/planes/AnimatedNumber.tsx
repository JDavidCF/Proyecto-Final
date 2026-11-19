import React, { useEffect, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import { formatCOP } from '../../utils/inventoryMath';

interface AnimatedNumberProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

export function AnimatedNumber({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  className = '',
}: AnimatedNumberProps) {
  const prefersReduced = useReducedMotion();
  const [display, setDisplay] = useState<number>(prefersReduced ? value : 0);

  useEffect(() => {
    if (prefersReduced) {
      setDisplay(value);
      return;
    }
    const start = display;
    const diff = value - start;
    if (Math.abs(diff) < 0.001) return;

    const duration = 520;
    const startTime = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const elapsed = Math.max(0, now - startTime);
      const t = Math.min(1, elapsed / duration);
      // easeOutExpo
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      setDisplay(start + diff * eased);
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, prefersReduced]);

  const formatted = prefix === '$'
    ? formatCOP(display)
    : new Intl.NumberFormat('es-CO', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(display);

  return (
    <span className={`font-mono-tabular ${className}`}>
      {prefix === '$' ? '' : prefix}
      {formatted}
      {suffix}
    </span>
  );
}
