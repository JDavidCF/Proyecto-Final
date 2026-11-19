import React, { useEffect, useState } from 'react';
import { AlertTriangle, BarChart3, Boxes, DollarSign, TrendingUp } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { extractApiError, statsService } from '../services/api';
import { formatCOP } from '../utils/inventoryMath';
import type { StatsSummary } from '../types/stocknova';
import { AnimatedNumber } from '../components/planes/AnimatedNumber';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

export default function EstadisticasPage() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [stats, setStats] = useState<StatsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const chartTextColor = theme === 'dark' ? '#AAB8CC' : '#426B7B';
  const tooltipStyle = {
    backgroundColor: theme === 'dark' ? '#080D1B' : '#FFFFFF',
    borderColor: theme === 'dark' ? 'rgba(170,184,204,0.2)' : 'rgba(35,120,148,0.2)',
    borderRadius: '10px',
    color: theme === 'dark' ? '#EAF4FF' : '#153F51',
    fontSize: '12px',
  };

  useEffect(() => {
    let active = true;
    statsService
      .summary()
      .then((data) => {
        if (active) setStats(data);
      })
      .catch((err) => {
        if (active) setError(extractApiError(err, t('No se pudieron cargar las estadísticas.')));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [t]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-56 rounded-lg bg-[#101B35] animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-28 rounded-2xl bg-[#101B35] animate-pulse" />
          ))}
        </div>
        <div className="h-80 rounded-2xl bg-[#101B35] animate-pulse" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div role="alert" className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-5 text-sm text-rose-200">
        {error || t('Datos no disponibles.')}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#EAF4FF]">
          {t('Estadísticas ejecutivas')}
        </h1>
        <p className="text-sm text-[#AAB8CC] mt-1">
          {t('Análisis consolidado de ingresos, rotación de productos y valoración de bodega')}
        </p>
      </div>

      {/* 4 Analytical KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-[rgba(170,184,204,0.14)] bg-[#101B35]/85 p-5">
          <div className="flex items-center justify-between text-xs text-[#AAB8CC]">
            <span>{t('Ingresos por ventas')}</span>
            <DollarSign className="w-4 h-4 text-[#00D9FF]" />
          </div>
          <div className="mt-2 text-2xl font-bold text-[#EAF4FF]">
            {formatCOP(stats.totalRevenue)}
          </div>
          <div className="mt-1 text-xs text-[#AAB8CC] font-mono-tabular">
            {stats.salesCount} {t('transacciones totales')}
          </div>
        </div>

        <div className="rounded-2xl border border-[rgba(170,184,204,0.14)] bg-[#101B35]/85 p-5">
          <div className="flex items-center justify-between text-xs text-[#AAB8CC]">
            <span>{t('Valor comercial del inventario')}</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-[#EAF4FF]">
            {formatCOP(stats.totalRetailValue)}
          </div>
        </div>

        <div className="rounded-2xl border border-[rgba(170,184,204,0.14)] bg-[#101B35]/85 p-5">
          <div className="flex items-center justify-between text-xs text-[#AAB8CC]">
            <span>{t('Unidades en almacén')}</span>
            <Boxes className="w-4 h-4 text-[#176BFF]" />
          </div>
          <div className="mt-2 text-2xl font-bold text-[#EAF4FF]">
            <AnimatedNumber value={stats.totalUnits} suffix=" u." />
          </div>
          <div className="mt-1 text-xs text-[#AAB8CC] font-mono-tabular">
            {stats.totalProducts} {t('referencias activas')}
          </div>
        </div>

        <div className="rounded-2xl border border-[rgba(170,184,204,0.14)] bg-[#101B35]/85 p-5">
          <div className="flex items-center justify-between text-xs text-[#AAB8CC]">
            <span>{t('Stock crítico / agotado')}</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-[#EAF4FF]">
            <AnimatedNumber value={stats.lowStockCount + stats.outOfStockCount} suffix=" SKUs" />
          </div>
          <div className="mt-1 text-xs text-amber-400 font-mono-tabular">
            {stats.outOfStockCount} {t('agotado(s)')} · {stats.lowStockCount} {t('en alerta')}
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 rounded-2xl border border-[rgba(170,184,204,0.14)] bg-[#101B35]/85 p-5 sm:p-6">
          <div className="mb-4">
            <h2 className="font-display text-base font-semibold text-[#EAF4FF]">
              {t('Ingresos por fecha')}
            </h2>
            <p className="text-xs text-[#AAB8CC]">{t('Evolución diaria de facturación comercial (COP)')}</p>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.revenueByDate} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id="sn-stats-rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#176BFF" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#00D9FF" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={theme === 'dark' ? 'rgba(170,184,204,0.08)' : 'rgba(24,49,83,0.12)'}
                />
                <XAxis dataKey="date" stroke={chartTextColor} fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke={chartTextColor} fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value) => formatCOP(Number(value))}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name={t('Ingresos')}
                  stroke="#00D9FF"
                  strokeWidth={2.4}
                  fill="url(#sn-stats-rev)"
                  animationDuration={350}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-5 rounded-2xl border border-[rgba(170,184,204,0.14)] bg-[#101B35]/85 p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-base font-semibold text-[#EAF4FF]">
                {t('Productos más vendidos')}
              </h2>
              <p className="text-xs text-[#AAB8CC]">{t('Top 5 por ingresos generados')}</p>
            </div>
            <BarChart3 className="w-4 h-4 text-[#00D9FF]" />
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.topProducts}
                layout="vertical"
                margin={{ top: 4, right: 16, left: 10, bottom: 4 }}
              >
                <XAxis type="number" stroke={chartTextColor} fontSize={11} tickLine={false} axisLine={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke={theme === 'dark' ? '#EAF4FF' : '#153F51'}
                  fontSize={11}
                  width={84}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value) => formatCOP(Number(value))}
                />
                <Bar dataKey="revenue" name={t('Ingresos (COP)')} fill="#176BFF" radius={[0, 6, 6, 0]} animationDuration={350} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Category Breakdown & Low Stock Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-5 rounded-2xl border border-[rgba(170,184,204,0.14)] bg-[#101B35]/85 p-5 sm:p-6">
          <h2 className="font-display text-base font-semibold text-[#EAF4FF] mb-4">
            {t('Valor en inventario por categoría')}
          </h2>
          <div className="space-y-4">
            {stats.categoryDistribution.map((cat) => {
              const pct =
                stats.totalRetailValue > 0
                  ? Math.round((cat.value / stats.totalRetailValue) * 100)
                  : 0;
              return (
                <div key={cat.category}>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-medium text-[#EAF4FF]">
                      {cat.category} ({cat.count} SKUs)
                    </span>
                    <span className="font-mono-tabular text-[#00D9FF]">
                      {formatCOP(cat.value)} · {pct}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-[#080D1B] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#176BFF]"
                      style={{ width: `${Math.max(4, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-7 rounded-2xl border border-[rgba(170,184,204,0.14)] bg-[#101B35]/85 p-5 sm:p-6">
          <h2 className="font-display text-base font-semibold text-[#EAF4FF] mb-4">
            {t('Detalle de productos con stock bajo o agotado')}
          </h2>
          {stats.lowStockProducts.length === 0 ? (
            <p className="text-sm text-[#AAB8CC]">{t('No hay productos bajo umbral mínimo.')}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[rgba(170,184,204,0.12)] text-xs text-[#AAB8CC]">
                    <th className="py-2 pr-4 font-medium">SKU</th>
                    <th className="py-2 pr-4 font-medium">{t('Producto')}</th>
                    <th className="py-2 pr-4 font-medium">{t('Marca')}</th>
                    <th className="py-2 pr-4 font-medium text-right">{t('Stock')}</th>
                    <th className="py-2 font-medium text-right">{t('Estado')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(170,184,204,0.08)]">
                  {stats.lowStockProducts.map((p) => (
                    <tr key={p.id}>
                      <td className="py-2.5 pr-4 font-mono-tabular text-xs text-[#00D9FF]">{p.sku}</td>
                      <td className="py-2.5 pr-4 font-medium text-[#EAF4FF]">{p.name}</td>
                      <td className="py-2.5 pr-4 text-xs text-[#AAB8CC]">{p.supplier}</td>
                      <td
                        className={`py-2.5 pr-4 text-right font-mono-tabular font-semibold ${
                          p.stock === 0 ? 'text-rose-400' : 'text-amber-400'
                        }`}
                      >
                        {p.stock} u.
                      </td>
                      <td className="py-2.5 text-right text-xs text-[#AAB8CC]">
                        {p.stock === 0 ? t('Agotado') : t('Stock bajo')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
