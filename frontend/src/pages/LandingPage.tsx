import React, { useEffect, useRef, useState } from 'react';
import { LandingNavbar } from '../components/landing/LandingNavbar';
import { HeroSection } from '../components/landing/HeroSection';
import { BentoPreviewSection } from '../components/landing/BentoPreviewSection';
import { CapabilitiesSection } from '../components/landing/CapabilitiesSection';
import { ModulesSection } from '../components/landing/ModulesSection';
import {
  ProductPresentationSection,
  BenefitsAndCtaSection,
} from '../components/landing/BenefitsAndCtaSection';
import { StockNovaAssistant } from '../components/assistant/StockNovaAssistant';
import { MovingBackdrop } from '../components/landing/MovingBackdrop';
import { LowerLandingStarfield } from '../components/landing/LowerLandingStarfield';
import gsap from 'gsap';

export default function LandingPage() {
  const mainRef = useRef<HTMLDivElement>(null);
  const waveCursorRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse') return;

    const bounds = mainRef.current?.getBoundingClientRect();
    const cursor = waveCursorRef.current;
    if (!bounds || !cursor) return;

    cursor.style.transform = `translate3d(${event.clientX - bounds.left - 170}px, ${event.clientY - bounds.top - 170}px, 0)`;
    cursor.classList.add('is-active');
  };

  const handlePointerLeave = () => {
    waveCursorRef.current?.classList.remove('is-active');
  };

  // GSAP page-level entrance animation
  useEffect(() => {
    if (!mainRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        mainRef.current,
        { opacity: 0, y: 12 },
        {
          opacity: 1,
          y: 0,
          duration: 0.75,
          ease: 'power3.out',
          onComplete: () => gsap.set(mainRef.current, { clearProps: 'transform' }),
        }
      );
    }, mainRef);
    return () => ctx.revert();
  }, []);

  // Scroll progress indicator
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <div
        ref={mainRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className="relative isolate min-h-screen bg-[var(--bg-canvas,#080D1B)] text-[#EAF4FF]"
      >
        {/* Scroll progress indicator */}
        <div
          aria-hidden="true"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            height: '3px',
            width: `${scrollProgress}%`,
            background: 'linear-gradient(90deg, #176BFF 0%, #00D9FF 60%, #A259FF 100%)',
            zIndex: 9999,
            transition: 'width 0.1s linear',
            boxShadow: '0 0 8px 1px rgba(23,107,255,0.6)',
            borderRadius: '0 2px 2px 0',
          }}
        />

        <MovingBackdrop scene="landing" />
        <div aria-hidden="true" className="sn-interactive-wave pointer-events-none absolute inset-0 overflow-hidden">
          <div ref={waveCursorRef} className="sn-interactive-wave__cursor" />
        </div>
        <LandingNavbar />
        <main className="relative z-10">
          <HeroSection />
          <ProductPresentationSection />
          <BentoPreviewSection />
          <div className="relative isolate">
            <LowerLandingStarfield />
            <div className="relative z-10">
              <CapabilitiesSection />
              <ModulesSection />
              <BenefitsAndCtaSection />
            </div>
          </div>
        </main>
      </div>
      <StockNovaAssistant section="general" publicAccess />
    </>
  );
}
