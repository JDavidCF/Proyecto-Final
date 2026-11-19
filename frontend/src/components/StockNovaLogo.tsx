import React from 'react';

interface StockNovaLogoProps {
  size?: number;
  showWordmark?: boolean;
  className?: string;
}

export function StockNovaLogo({
  size = 32,
  showWordmark = true,
  className = '',
}: StockNovaLogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 whitespace-nowrap shrink-0 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        <defs>
          <linearGradient id="sn-cube-top" x1="12" y1="8" x2="36" y2="22" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#4B95FF" />
            <stop offset="100%" stopColor="#176BFF" />
          </linearGradient>
          <linearGradient id="sn-cube-left" x1="10" y1="18" x2="24" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1A45A3" />
            <stop offset="100%" stopColor="#0D2259" />
          </linearGradient>
          <linearGradient id="sn-cube-right" x1="24" y1="18" x2="38" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#2673FF" />
            <stop offset="100%" stopColor="#10368A" />
          </linearGradient>
          <linearGradient id="sn-orbit" x1="4" y1="30" x2="44" y2="18" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#00D9FF" />
            <stop offset="50%" stopColor="#EAF4FF" />
            <stop offset="100%" stopColor="#176BFF" />
          </linearGradient>
        </defs>

        {/* Back orbital arc */}
        <path
          d="M7 27.5C4.5 22 10.5 14.5 22 11.5C33.5 8.5 42.5 11.5 42.5 17.5"
          stroke="url(#sn-orbit)"
          strokeWidth="1.8"
          strokeLinecap="round"
          opacity="0.45"
        />

        {/* Isometric metallic cube */}
        <path d="M24 9L37 16.5L24 24L11 16.5L24 9Z" fill="url(#sn-cube-top)" />
        <path d="M11 16.5L24 24V39L11 31.5V16.5Z" fill="url(#sn-cube-left)" />
        <path d="M37 16.5L24 24V39L37 31.5V16.5Z" fill="url(#sn-cube-right)" />

        {/* Crisp edge highlights */}
        <path
          d="M24 9L37 16.5V31.5L24 39L11 31.5V16.5L24 9Z"
          stroke="#8CC2FF"
          strokeOpacity="0.45"
          strokeWidth="1"
        />
        <path d="M11 16.5L24 24L37 16.5M24 24V39" stroke="#EAF4FF" strokeOpacity="0.35" strokeWidth="1" />

        {/* Integrated geometric 'S' path across top-front plane */}
        <path
          d="M28.5 16.5C28.5 15 26.5 14.2 24 14.2C21.5 14.2 19.8 15.2 19.8 16.7C19.8 18.4 22.2 18.8 24.4 19.3C26.8 19.8 28.8 20.5 28.8 22.3C28.8 24.1 26.7 25.1 24 25.1C21.3 25.1 19.4 24.1 19.2 22.6"
          stroke="#EAF4FF"
          strokeWidth="2.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Front orbital ring crossing cube */}
        <path
          d="M42.5 17.5C44.5 24 36.5 31.8 24.5 34.8C13.5 37.5 6.5 33.8 7 27.5"
          stroke="url(#sn-orbit)"
          strokeWidth="2.1"
          strokeLinecap="round"
        />
      </svg>

      {showWordmark && (
        <span className="font-display text-xl font-bold tracking-tight text-[#EAF4FF]">
          Stock<span className="text-[#00D9FF]">Nova</span>
        </span>
      )}
    </span>
  );
}
