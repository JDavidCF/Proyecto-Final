import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

interface SmoothStaggerTextProps {
  text: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
  className?: string;
  delay?: number;
  stagger?: number;
  highlightWords?: string[];
  highlightClassName?: string;
  inViewOnly?: boolean;
}

export function SmoothStaggerText({
  text,
  as = 'h1',
  className = '',
  delay = 0,
  stagger = 0.045,
  highlightWords = [],
  highlightClassName = 'text-[#00D9FF]',
  inViewOnly = false,
}: SmoothStaggerTextProps) {
  const prefersReduced = useReducedMotion();
  const words = text.split(' ');
  const Component = motion[as];

  if (prefersReduced) {
    const PlainTag = as;
    return (
      <PlainTag className={className}>
        {words.map((word, idx) => {
          const clean = word.replace(/[.,;:!?]/g, '');
          const isHighlight = highlightWords.includes(clean);
          return (
            <React.Fragment key={idx}>
              <span className={isHighlight ? highlightClassName : undefined}>{word}</span>
              {idx < words.length - 1 ? ' ' : ''}
            </React.Fragment>
          );
        })}
      </PlainTag>
    );
  }

  return (
    <Component
      className={className}
      initial="hidden"
      {...(inViewOnly
        ? { whileInView: 'visible', viewport: { once: true, amount: 0.35 } }
        : { animate: 'visible' })}
      variants={{
        hidden: {},
        visible: {
          transition: {
            delayChildren: delay,
            staggerChildren: stagger,
          },
        },
      }}
    >
      {words.map((word, idx) => {
        const clean = word.replace(/[.,;:!?]/g, '');
        const isHighlight = highlightWords.includes(clean);
        return (
          <React.Fragment key={idx}>
            <span className="inline-block overflow-hidden align-bottom py-0.5">
              <motion.span
                className={`inline-block will-change-transform ${isHighlight ? highlightClassName : ''}`}
                variants={{
                  hidden: {
                    opacity: 0,
                    y: '38%',
                    filter: 'blur(6px)',
                  },
                  visible: {
                    opacity: 1,
                    y: '0%',
                    filter: 'blur(0px)',
                    transition: {
                      duration: 0.55,
                      ease: [0.16, 1, 0.3, 1],
                    },
                  },
                }}
              >
                {word}
              </motion.span>
            </span>
            {idx < words.length - 1 ? ' ' : ''}
          </React.Fragment>
        );
      })}
    </Component>
  );
}
