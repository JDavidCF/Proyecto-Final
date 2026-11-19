import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

interface MarqueeProps {
  items: React.ReactNode[];
  duration?: number;
  className?: string;
}

export function Marquee({ items, duration = 28, className = '' }: MarqueeProps) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return (
      <div className={`flex flex-wrap items-center justify-center gap-6 py-4 ${className}`}>
        {items.map((item, idx) => (
          <div key={idx} className="shrink-0">
            {item}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden select-none [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)] ${className}`}
    >
      <motion.div
        className="flex w-max gap-6 py-2"
        animate={{ x: ['0%', '-50%'] }}
        transition={{
          repeat: Infinity,
          ease: 'linear',
          duration,
        }}
      >
        {[...items, ...items].map((item, idx) => (
          <div key={idx} className="shrink-0">
            {item}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
