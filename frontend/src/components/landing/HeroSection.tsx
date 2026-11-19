import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowRight,
  ArrowUpRight,
  ArrowDownLeft,
  Box,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  Tooltip,
} from 'recharts';
import { SmoothStaggerText } from '../planes/SmoothStaggerText';
import { ScrollStage } from '../planes/ScrollStage';
import { AnimatedNumber } from '../planes/AnimatedNumber';
import { HeroAtmosphere } from './HeroAtmosphere';
import { formatCOP } from '../../utils/inventoryMath';
import { useLanguage } from '../../context/LanguageContext';

const HERO_CHART_7D = [
  { day: 'Lun', ventas: 2190000, movimientos: 14 },
  { day: 'Mar', ventas: 2450000, movimientos: 18 },
  { day: 'Mié', ventas: 1980000, movimientos: 12 },
  { day: 'Jue', ventas: 3120000, movimientos: 22 },
  { day: 'Vie', ventas: 3640000, movimientos: 26 },
  { day: 'Sáb', ventas: 2890000, movimientos: 15 },
  { day: 'Dom', ventas: 3840000, movimientos: 29 },
];

const HERO_CHART_30D = [
  { day: 'Sem 1', ventas: 11200000, movimientos: 64 },
  { day: 'Sem 2', ventas: 14850000, movimientos: 82 },
  { day: 'Sem 3', ventas: 13640000, movimientos: 71 },
  { day: 'Sem 4', ventas: 18920000, movimientos: 96 },
];

export function HeroSection() {
  const { t } = useLanguage();
  const [range, setRange] = useState<'7d' | '30d'>('7d');
  const chartData = range === '7d' ? HERO_CHART_7D : HERO_CHART_30D;
  const revenueTotal = range === '7d' ? 20110000 : 58610000;
  const unitsMoved = range === '7d' ? 207 : 842;

  return (
    <section
      id="inicio"
      className="relative overflow-hidden pt-12 pb-20 sm:pt-16 sm:pb-28"
    >
      {/* Subtle architectural radial lighting */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[960px] h-[460px] rounded-full opacity-25 blur-[120px]"
        style={{
          background:
            'radial-gradient(circle, rgba(23,107,255,0.55) 0%, rgba(0,217,255,0.18) 45%, transparent 75%)',
        }}
      />
      <HeroAtmosphere />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Copy Block */}
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-medium tracking-wider uppercase text-[#00D9FF] mb-4">
            {t('Sistema de gestión de inventarios · Controla. Conecta. Evoluciona.')}
          </p>

          <SmoothStaggerText
            as="h1"
            text={t('El control de tu inventario comienza aquí.')}
            highlightWords={['inventario', 'aquí']}
            highlightClassName="sn-title-highlight"
            className="sn-title-shimmer font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#EAF4FF] leading-[1.08] text-balance"
          />

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="mt-5 text-base sm:text-lg text-[#AAB8CC] leading-relaxed max-w-2xl mx-auto"
          >
            {t('Una nueva forma de gestionar productos, ventas y operaciones. Mantén todo organizado, conectado y bajo control desde un solo lugar.')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 flex flex-wrap items-center justify-center gap-4"
          >
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#176BFF] hover:bg-[#2A7BFF] text-sm font-semibold text-[#EAF4FF] transition-all duration-150 shadow-lg shadow-[#176BFF]/25 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D9FF]"
            >
              {t('Comenzar ahora')}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#funcionalidades"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-[rgba(170,184,204,0.24)] bg-[#101B35]/60 hover:bg-[#101B35] text-sm font-semibold text-[#EAF4FF] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176BFF]"
            >
              {t('Explorar funcionalidades')}
            </a>
          </motion.div>
        </div>

        {/* Layered Interactive StockNova Dashboard Composition */}
        <ScrollStage depth={22} className="mt-14 sm:mt-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.42, ease: [0.16, 1, 0.3, 1] }}
            className="relative rounded-2xl border border-[rgba(170,184,204,0.18)] bg-[#101B35]/95 shadow-2xl overflow-hidden"
          >
            {/* Mock Workspace Header Bar */}
            <div className="px-5 py-3.5 border-b border-[rgba(170,184,204,0.12)] bg-[#080D1B]/70 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-xs text-[#AAB8CC]">
                <span className="font-display font-semibold text-[#EAF4FF]">
                  {t('Panel de demostración')}
                </span>
                <span aria-hidden="true">·</span>
                <span>{t('Datos ilustrativos')}</span>
              </div>

              <div className="flex items-center gap-1 p-1 rounded-lg bg-[#080D1B] border border-[rgba(170,184,204,0.12)]">
                <button
                  type="button"
                  onClick={() => setRange('7d')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    range === '7d'
                      ? 'bg-[#176BFF] text-[#EAF4FF]'
                      : 'text-[#AAB8CC] hover:text-[#EAF4FF]'
                  }`}
                >
                  {t('Últimos 7 días')}
                </button>
                <button
                  type="button"
                  onClick={() => setRange('30d')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    range === '30d'
                      ? 'bg-[#176BFF] text-[#EAF4FF]'
                      : 'text-[#AAB8CC] hover:text-[#EAF4FF]'
                  }`}
                >
                  {t('Últimos 30 días')}
                </button>
              </div>
            </div>

            {/* Inner Dashboard Grid */}
            <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Left 8 cols: KPIs + Chart + Top Products */}
              <div className="lg:col-span-8 flex flex-col gap-5">
                {/* 3 KPI Strip */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="rounded-xl border border-[rgba(170,184,204,0.12)] bg-[#080D1B]/75 p-4">
                    <div className="flex items-center justify-between text-xs text-[#AAB8CC]">
                      <span>{t('Ingresos del período')}</span>
                      <TrendingUp className="w-4 h-4 text-[#00D9FF]" />
                    </div>
                    <div className="mt-2 text-2xl font-bold text-[#EAF4FF]">
                      <AnimatedNumber value={revenueTotal} prefix="$" />
                    </div>
                    <div className="mt-1 text-xs text-emerald-400 font-mono-tabular">
                      {t('+18.4% vs período anterior')}
                    </div>
                  </div>

                  <div className="rounded-xl border border-[rgba(170,184,204,0.12)] bg-[#080D1B]/75 p-4">
                    <div className="flex items-center justify-between text-xs text-[#AAB8CC]">
                      <span>{t('Unidades en rotación')}</span>
                      <Box className="w-4 h-4 text-[#176BFF]" />
                    </div>
                    <div className="mt-2 text-2xl font-bold text-[#EAF4FF]">
                      <AnimatedNumber value={unitsMoved} suffix=" u." />
                    </div>
                    <div className="mt-1 text-xs text-[#AAB8CC] font-mono-tabular">
                      {t('10 SKU de ejemplo · 4 categorías')}
                    </div>
                  </div>

                  <div className="rounded-xl border border-[rgba(170,184,204,0.12)] bg-[#080D1B]/75 p-4">
                    <div className="flex items-center justify-between text-xs text-[#AAB8CC]">
                      <span>{t('Alertas de stock bajo')}</span>
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="mt-2 text-2xl font-bold text-[#EAF4FF]">
                      <AnimatedNumber value={4} suffix=" SKUs" />
                    </div>
                    <div className="mt-1 text-xs text-amber-400 font-mono-tabular">
                      {t('Reposición sugerida hoy')}
                    </div>
                  </div>
                </div>

                {/* Live Chart */}
                <div className="rounded-xl border border-[rgba(170,184,204,0.12)] bg-[#080D1B]/75 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-display text-sm font-semibold text-[#EAF4FF]">
                        {t('Ritmo de ventas e ingresos')}
                      </h3>
                      <p className="text-xs text-[#AAB8CC]">
                        {t('Facturación consolidada por jornada operativa')}
                      </p>
                    </div>
                    <span className="text-xs font-mono-tabular text-[#00D9FF]">COP</span>
                  </div>
                  <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 6, right: 8, left: -16, bottom: 0 }}>
                        <defs>
                          <linearGradient id="sn-hero-area" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#176BFF" stopOpacity={0.42} />
                            <stop offset="100%" stopColor="#00D9FF" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <XAxis
                          dataKey="day"
                          stroke="#AAB8CC"
                          fontSize={11}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip
                          formatter={(value) => [formatCOP(Number(value)), t('Ingresos')]}
                          contentStyle={{
                            backgroundColor: '#101B35',
                            borderColor: 'rgba(170,184,204,0.2)',
                            borderRadius: '10px',
                            color: '#EAF4FF',
                            fontSize: '12px',
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="ventas"
                          stroke="#00D9FF"
                          strokeWidth={2.2}
                          fill="url(#sn-hero-area)"
                          animationDuration={500}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Right 4 cols: Layered Products + Recent Activity */}
              <div className="lg:col-span-4 flex flex-col gap-5">
                <div className="rounded-xl border border-[rgba(170,184,204,0.12)] bg-[#080D1B]/75 p-4">
                  <h3 className="font-display text-sm font-semibold text-[#EAF4FF] mb-3">
                    {t('Productos destacados')}
                  </h3>
                  <div className="divide-y divide-[rgba(170,184,204,0.1)] text-xs">
                    {[
                      { name: 'Servomotor Brushless 750W', sku: 'SN-SRV-402', stock: '34 u.', status: t('Óptimo'), color: 'text-emerald-400' },
                      { name: 'Sensor Óptico LiDAR', sku: 'SN-IOT-118', stock: '6 u.', status: t('Bajo'), color: 'text-amber-400' },
                      { name: 'Switch PoE+ 16 Puertos', sku: 'SN-NET-880', stock: '19 u.', status: t('Óptimo'), color: 'text-emerald-400' },
                    ].map((item) => (
                      <div key={item.sku} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="font-medium text-[#EAF4FF] truncate">{item.name}</div>
                          <div className="font-mono-tabular text-[#AAB8CC]/75">{item.sku}</div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="font-mono-tabular font-semibold text-[#EAF4FF]">{item.stock}</div>
                          <div className={`font-medium ${item.color}`}>{item.status}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-[rgba(170,184,204,0.12)] bg-[#080D1B]/75 p-4 flex-1">
                  <h3 className="font-display text-sm font-semibold text-[#EAF4FF] mb-3">
                    {t('Actividad reciente')}
                  </h3>
                  <div className="space-y-3 text-xs">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <ArrowDownLeft className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <div className="text-[#EAF4FF] font-medium truncate">{t('Entrada')} · Fibra SFP+ 10G</div>
                          <div className="text-[#AAB8CC]">Camila Mendoza · {t('Hace 14 min')}</div>
                        </div>
                      </div>
                      <span className="font-mono-tabular text-emerald-400 shrink-0">+30</span>
                    </div>

                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <ArrowUpRight className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <div className="text-[#EAF4FF] font-medium truncate">{t('Venta')} VTA-1047 · AgroSensores</div>
                          <div className="text-[#AAB8CC]">Mateo Villalobos · {t('Hace 42 min')}</div>
                        </div>
                      </div>
                      <span className="font-mono-tabular text-[#EAF4FF] shrink-0">$ 1.508.000</span>
                    </div>

                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <ArrowUpRight className="w-4 h-4 text-[#00D9FF] shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <div className="text-[#EAF4FF] font-medium truncate">{t('Pedido')} PED-302 · {t('En preparación')}</div>
                          <div className="text-[#AAB8CC]">InnovaGrid Energía · {t('Hoy')}</div>
                        </div>
                      </div>
                      <span className="font-mono-tabular text-[#00D9FF] shrink-0">4 u.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </ScrollStage>
      </div>
    </section>
  );
}
