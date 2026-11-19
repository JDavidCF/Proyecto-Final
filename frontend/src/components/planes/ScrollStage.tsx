import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react';

interface ScrollStageProps {
  children: React.ReactNode;
  className?: string;
  depth?: number;
}

export function ScrollStage({ children, className = '', depth = 28 }: ScrollStageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 0.5, 1], [depth, 0, -depth]);
  const opacity = useTransform(scrollYProgress, [0, 0.16, 0.85, 1], [0.45, 1, 1, 0.75]);
  const scale = useTransform(scrollYProgress, [0, 0.35, 0.75, 1], [0.985, 1, 1, 0.99]);

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div ref={ref} className={`relative ${className}`}>
      <motion.div style={{ y, opacity, scale }} className="will-change-transform">
        {children}
      </motion.div>
    </div>
  );
}
