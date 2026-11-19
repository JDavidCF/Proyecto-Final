import React from 'react';
import { Boxes, TrendingUp, Cpu, Zap } from 'lucide-react';
import { SpaceWallpaper } from '../SpaceWallpaper';
import { AmbientOrbField, type AmbientOrbScene } from './AmbientOrbField';

interface MovingBackdropProps {
  scene: AmbientOrbScene;
}

/* ─────────────────────────────────────────────────────────────────────────────
   MovingBackdrop – immersive animated background for StockNova landing page
   ───────────────────────────────────────────────────────────────────────────── */

/** Mini SVG chart line used in one of the floating cards */
const MiniChart = () => (
  <svg width="52" height="22" viewBox="0 0 52 22" fill="none" aria-hidden="true">
    <polyline
      points="2,18 10,12 18,15 26,8 34,10 42,4 50,6"
      stroke="#00D9FF"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <circle cx="50" cy="6" r="2.2" fill="#00D9FF" opacity="0.9" />
  </svg>
);

export function MovingBackdrop({ scene }: MovingBackdropProps) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <SpaceWallpaper />
      <AmbientOrbField scene={scene} />

      {/* ── FLOATING ICON CARDS ── */}

      {/* Card 1 — inventory tag */}
      <span
        className="sn-floating-icon absolute left-[7%] top-[22rem] hidden flex-col gap-1.5 rounded-2xl border border-[rgba(170,184,204,0.18)] bg-[#0A1225]/75 px-4 py-3 shadow-xl backdrop-blur-md md:flex"
        style={{ minWidth: '9.5rem' }}
      >
        <span className="flex items-center gap-2 text-[#00D9FF]">
          <Boxes className="h-5 w-5 shrink-0" />
          <span className="text-xs font-semibold text-[#EAF4FF]">Inventario</span>
        </span>
        <span className="font-mono text-[10px] text-[#AAB8CC]">SKU: SN-404</span>
        <span className="font-mono text-[10px] text-emerald-400">Stock: 1 284 u.</span>
      </span>

      {/* Card 2 — trend chart */}
      <span
        className="sn-floating-icon sn-floating-icon--delayed absolute right-[8%] top-[48rem] hidden flex-col gap-1.5 rounded-2xl border border-[rgba(170,184,204,0.18)] bg-[#0A1225]/75 px-4 py-3 shadow-xl backdrop-blur-md md:flex"
        style={{ minWidth: '10rem' }}
      >
        <span className="flex items-center gap-2 text-[#176BFF]">
          <TrendingUp className="h-5 w-5 shrink-0" />
          <span className="text-xs font-semibold text-[#EAF4FF]">Ventas hoy</span>
        </span>
        <MiniChart />
        <span className="font-mono text-[10px] text-[#176BFF]">+12.4 %  ↑</span>
      </span>

      {/* Card 3 — system status */}
      <span
        className="sn-floating-icon absolute left-[14%] top-[78rem] hidden flex-col gap-1.5 rounded-2xl border border-[rgba(170,184,204,0.18)] bg-[#0A1225]/75 px-4 py-3 shadow-xl backdrop-blur-md md:flex"
        style={{ minWidth: '9rem', animationDelay: '2.8s' }}
      >
        <span className="flex items-center gap-2 text-violet-400">
          <Cpu className="h-5 w-5 shrink-0" />
          <span className="text-xs font-semibold text-[#EAF4FF]">Sistema</span>
        </span>
        <span className="font-mono text-[10px] text-[#AAB8CC]">Latencia: 42 ms</span>
        <span className="flex items-center gap-1 text-[10px] text-emerald-400">
          <Zap className="h-3 w-3" /> Operativo
        </span>
      </span>

    </div>
  );
}
