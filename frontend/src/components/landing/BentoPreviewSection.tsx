import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  PackageCheck,
  Receipt,
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from 'recharts';
import { BentoGrid, BentoCard } from '../planes/BentoGrid';
import { ActivityFeed } from '../planes/ActivityFeed';
import { AnimatedNumber } from '../planes/AnimatedNumber';
import { formatCOP } from '../../utils/inventoryMath';
import type { InventoryMovement } from '../../types/stocknova';
import { useLanguage } from '../../context/LanguageContext';

const BENTO_SALES_BAR = [
  { cat: 'Electro', total: 6420000 },
  { cat: 'IoT', total: 3890000 },
  { cat: 'Redes', total: 4210000 },
  { cat: 'Energía', total: 5140000 },
  { cat: 'Robótica', total: 4680000 },
];

const SAMPLE_MOVEMENTS: InventoryMovement[] = [
  {
    id: 'm1',
    productId: 'p1',
    productName: 'Servomotor Brushless 750W',
    type: 'ENTRADA',
    quantity: 20,
    previousStock: 14,
    newStock: 34,
    userId: '1',
    createdAt: '2026-11-12T08:30:00Z',
  },
  {
    id: 'm2',
    productId: 'p2',
    productName: 'Sensor Óptico LiDAR',
    type: 'AJUSTE',
    quantity: 6,
    previousStock: 7,
    newStock: 6,
    userId: '2',
    createdAt: '2026-11-12T09:10:00Z',
  },
  {
    id: 'm3',
    productId: 'p5',
    productName: 'Pinza Neumática Paralela',
    type: 'SALIDA',
    quantity: 4,
    previousStock: 8,
    newStock: 4,
    userId: '3',
    createdAt: '2026-11-12T10:15:00Z',
  },
];

export function BentoPreviewSection() {
  const { t } = useLanguage();
  const [restockedIds, setRestockedIds] = useState<string[]>([]);

  const lowStockItems = [
    { id: 'ls1', name: 'Gateway LoRaWAN IP66', sku: 'SN-IOT-304', qty: 0, min: 5 },
    { id: 'ls2', name: 'Pinza Neumática Dual', sku: 'SN-ROB-905', qty: 4, min: 8 },
    { id: 'ls3', name: 'Sensor Óptico LiDAR', sku: 'SN-IOT-118', qty: 6, min: 12 },
  ];

  const toggleRestockPreview = (id: string) => {
    setRestockedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <section className="py-20 sm:py-24 border-t border-[rgba(170,184,204,0.1)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-12">
          <p className="text-xs font-medium tracking-wider uppercase text-[#00D9FF] mb-3">
            {t('Vista previa del sistema')}
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#EAF4FF] text-balance">
            {t('Una vista clara para cada decisión de inventario.')}
          </h2>
          <p className="mt-3 text-[#AAB8CC] text-base leading-relaxed">
            {t('Explora una vista ilustrativa del tablero. Los datos de tu cuenta se consultan directamente desde StockNova.')}
          </p>
        </div>

        <BentoGrid>
          {/* 1. Resumen de inventario (4 cols) */}
          <BentoCard className="md:col-span-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <span className="text-xs font-medium text-[#AAB8CC]">{t('Resumen de inventario · ejemplo')}</span>
                <div className="mt-1.5 text-3xl font-bold text-[#EAF4FF]">
                  <AnimatedNumber value={64820000} prefix="$" />
                </div>
                <p className="mt-1 text-xs text-[#AAB8CC]">
                {t('Ejemplo ilustrativo · 207 unidades en 5 categorías')}
                </p>
              </div>
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#00D9FF] hover:text-[#EAF4FF] transition-colors whitespace-nowrap shrink-0"
              >
                {t('Abrir consola')} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="mt-6 h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={BENTO_SALES_BAR} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                  <XAxis dataKey="cat" stroke="#AAB8CC" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    cursor={{ fill: 'rgba(23,107,255,0.08)' }}
                    formatter={(value) => [formatCOP(Number(value)), t('Ventas')]}
                    contentStyle={{
                      backgroundColor: '#080D1B',
                      borderColor: 'rgba(170,184,204,0.2)',
                      borderRadius: '8px',
                      color: '#EAF4FF',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="total" fill="#176BFF" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </BentoCard>

          {/* 2. Indicadores de rendimiento (2 cols) */}
          <BentoCard className="md:col-span-2" delay={0.06}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#AAB8CC]">{t('Rendimiento operativo')}</span>
              <BarChart3 className="w-4 h-4 text-[#00D9FF]" />
            </div>
            <div className="mt-5 space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-[#AAB8CC]">{t('Cumplimiento de pedidos')}</span>
                  <span className="font-mono-tabular font-semibold text-[#EAF4FF]">96.8%</span>
                </div>
                <div className="h-2 rounded-full bg-[#080D1B] overflow-hidden">
                  <div className="h-full w-[96.8%] rounded-full bg-[#176BFF]" />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-[#AAB8CC]">{t('Pedidos confirmados')}</span>
                  <span className="font-mono-tabular font-semibold text-[#EAF4FF]">82%</span>
                </div>
                <div className="h-2 rounded-full bg-[#080D1B] overflow-hidden">
                  <div className="h-full w-[68%] rounded-full bg-[#00D9FF]" />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-[#AAB8CC]">{t('Rotación mensual')}</span>
                  <span className="font-mono-tabular font-semibold text-[#EAF4FF]">4.2x</span>
                </div>
                <div className="h-2 rounded-full bg-[#080D1B] overflow-hidden">
                  <div className="h-full w-[82%] rounded-full bg-emerald-400" />
                </div>
              </div>
            </div>
          </BentoCard>

          {/* 3. Productos con stock bajo (2 cols) */}
          <BentoCard className="md:col-span-2" delay={0.1}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-medium text-[#AAB8CC]">{t('Productos con stock bajo')}</span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <div className="space-y-3">
              {lowStockItems.map((item) => {
                const simulated = restockedIds.includes(item.id);
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-2 pb-2.5 border-b border-[rgba(170,184,204,0.1)] last:border-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-[#EAF4FF] truncate">{item.name}</div>
                      <div className="text-[11px] font-mono-tabular text-[#AAB8CC]">
                        {item.sku} · {simulated ? item.min + 10 : item.qty} / {item.min} u.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleRestockPreview(item.id)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 ${
                        simulated
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-[#080D1B] text-[#00D9FF] border border-[rgba(0,217,255,0.3)] hover:bg-[#176BFF]/20'
                      }`}
                    >
                      {simulated ? t('Simulado +10') : t('Reponer')}
                    </button>
                  </div>
                );
              })}
            </div>
          </BentoCard>

          {/* 4. Ventas recientes (2 cols) */}
          <BentoCard className="md:col-span-2" delay={0.14}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-medium text-[#AAB8CC]">{t('Ventas recientes · ejemplo')}</span>
              <Receipt className="w-4 h-4 text-[#176BFF]" />
            </div>
            <div className="space-y-3">
              {[
                { code: 'VTA-1047', amount: '$ 1.508.000' },
                { code: 'VTA-1046', amount: '$ 3.640.000' },
                { code: 'VTA-1045', amount: '$ 2.420.000' },
              ].map((sale) => (
                <div
                  key={sale.code}
                  className="flex items-center justify-between gap-2 pb-2.5 border-b border-[rgba(170,184,204,0.1)] last:border-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-[#EAF4FF] truncate">{t('Operación de venta')}</div>
                    <div className="text-[11px] text-[#AAB8CC] font-mono-tabular">
                      {sale.code} · {t('datos de ejemplo')}
                    </div>
                  </div>
                  <span className="text-xs font-semibold font-mono-tabular text-[#EAF4FF] shrink-0">
                    {sale.amount}
                  </span>
                </div>
              ))}
            </div>
          </BentoCard>

          {/* 5. Actividad reciente (2 cols) */}
          <BentoCard className="md:col-span-2" delay={0.18}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-medium text-[#AAB8CC]">{t('Actividad reciente')}</span>
              <PackageCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <ActivityFeed movements={SAMPLE_MOVEMENTS} maxItems={3} />
          </BentoCard>
        </BentoGrid>
      </div>
    </section>
  );
}
