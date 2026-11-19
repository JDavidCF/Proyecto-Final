import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Check,
  Search,
  ShieldCheck,
  Truck,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis } from 'recharts';
import { useLanguage } from '../../context/LanguageContext';

const MINI_ANALYTICS = [
  { name: 'Srv', v: 42 },
  { name: 'PLC', v: 36 },
  { name: 'UPS', v: 29 },
  { name: 'PoE', v: 24 },
];

export function CapabilitiesSection() {
  const { t } = useLanguage();
  const [searchFilter, setSearchFilter] = useState('');
  const [orderStep, setOrderStep] = useState(2);

  const catalogSample = [
    { sku: 'SN-SRV-402', name: 'Servomotor 750W', qty: '34 u.' },
    { sku: 'SN-IOT-118', name: 'Sensor LiDAR', qty: '6 u.' },
    { sku: 'SN-NET-880', name: 'Switch PoE+ 16P', qty: '19 u.' },
  ].filter(
    (p) =>
      p.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const steps = ['Pendiente', 'Confirmado', 'Preparando', 'Enviado'].map(t);

  return (
    <section id="funcionalidades" className="py-20 sm:py-24 border-t border-[rgba(170,184,204,0.1)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-12">
          <p className="text-xs font-medium tracking-wider uppercase text-[#00D9FF] mb-3">
            {t('Capacidades operativas')}
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#EAF4FF] text-balance">
            {t('Siete disciplinas conectadas en una arquitectura limpia.')}
          </h2>
        </div>

        {/* Varied compositions — no 7 identical cloned cards */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* 01. Gestión de productos (Interactive mini-search list, 6 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.4 }}
            className="md:col-span-6 rounded-2xl border border-[rgba(170,184,204,0.14)] bg-[#101B35]/80 p-6 flex flex-col justify-between"
          >
            <div>
              <div className="text-xs font-mono-tabular text-[#00D9FF] mb-2">01 · {t('Catálogo maestro')}</div>
              <h3 className="font-display text-xl font-bold text-[#EAF4FF]">{t('Gestión de productos')}</h3>
              <p className="mt-2 text-sm text-[#AAB8CC]">
                {t('Alta, edición y consulta por código SKU, categoría y marca; actualiza precios y existencias.')}
              </p>
            </div>
            <div className="mt-5 rounded-xl border border-[rgba(170,184,204,0.14)] bg-[#080D1B] p-3.5">
              <div className="relative mb-3">
                <Search className="w-3.5 h-3.5 text-[#AAB8CC] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder={t('Filtrar SKU o nombre...')}
                  aria-label={t('Filtrar catálogo de ejemplo')}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-[rgba(170,184,204,0.16)] bg-[#101B35]/60 text-xs text-[#EAF4FF] placeholder:text-[#AAB8CC]/60 focus:outline-none focus:border-[#176BFF]"
                />
              </div>
              <div className="divide-y divide-[rgba(170,184,204,0.08)] text-xs">
                {catalogSample.map((row) => (
                  <div key={row.sku} className="py-2 flex items-center justify-between">
                    <span className="text-[#EAF4FF] font-medium">{row.name}</span>
                    <span className="font-mono-tabular text-[#AAB8CC]">
                      {row.sku} · {row.qty}
                    </span>
                  </div>
                ))}
                {catalogSample.length === 0 && (
                  <div className="py-2 text-[#AAB8CC]">{t('Sin coincidencias para "{searchFilter}"').replace('{searchFilter}', searchFilter)}</div>
                )}
              </div>
            </div>
          </motion.div>

          {/* 02. Control de inventario (Threshold meters, 6 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="md:col-span-6 rounded-2xl border border-[rgba(170,184,204,0.14)] bg-[#101B35]/80 p-6 flex flex-col justify-between"
          >
            <div>
              <div className="text-xs font-mono-tabular text-[#00D9FF] mb-2">02 · {t('Umbrales de stock')}</div>
              <h3 className="font-display text-xl font-bold text-[#EAF4FF]">{t('Control de inventario')}</h3>
              <p className="mt-2 text-sm text-[#AAB8CC]">
                {t('Clasificación automática de disponibilidad óptima, stock bajo y quiebre para evitar paradas.')}
              </p>
            </div>
            <div className="mt-5 space-y-3 rounded-xl border border-[rgba(170,184,204,0.14)] bg-[#080D1B] p-4">
              {[
                { label: t('Disponibilidad óptima'), pct: '70%', state: '7 SKUs', bar: 'bg-emerald-400', w: 'w-[70%]' },
                { label: t('Stock bajo mínimo'), pct: '20%', state: '2 SKUs', bar: 'bg-amber-400', w: 'w-[20%]' },
                { label: t('Agotado en bodega'), pct: '10%', state: '1 SKU', bar: 'bg-rose-500', w: 'w-[10%]' },
              ].map((row) => (
                <div key={row.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#EAF4FF]">{row.label}</span>
                    <span className="font-mono-tabular text-[#AAB8CC]">{row.state}</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#101B35] overflow-hidden">
                    <div className={`h-full rounded-full ${row.bar} ${row.w}`} />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* 03. Registro de ventas (Receipt layout, 4 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.4, delay: 0.08 }}
            className="md:col-span-4 rounded-2xl border border-[rgba(170,184,204,0.14)] bg-[#101B35]/80 p-6 flex flex-col justify-between"
          >
            <div>
              <div className="text-xs font-mono-tabular text-[#00D9FF] mb-2">03 · {t('Facturación')}</div>
              <h3 className="font-display text-xl font-bold text-[#EAF4FF]">{t('Registro de ventas')}</h3>
              <p className="mt-2 text-sm text-[#AAB8CC]">
                {t('Registra ventas con descuento automático de existencias y consulta su historial por fecha.')}
              </p>
            </div>
            <div className="mt-5 rounded-xl border border-dashed border-[rgba(170,184,204,0.25)] bg-[#080D1B] p-4 font-mono-tabular text-xs space-y-2">
              <div className="flex justify-between text-[#AAB8CC]">
                <span>VTA-2026-1047</span>
                <span>{t('TRANSFERENCIA')}</span>
              </div>
              <div className="border-t border-[rgba(170,184,204,0.12)] pt-2 flex justify-between text-[#EAF4FF]">
                <span>4× Sensor LiDAR</span>
                <span>$ 740.000</span>
              </div>
              <div className="flex justify-between text-[#EAF4FF]">
                <span>6× Fuente 24V 20A</span>
                <span>$ 768.000</span>
              </div>
              <div className="border-t border-[rgba(170,184,204,0.12)] pt-2 flex justify-between font-semibold text-[#00D9FF]">
                <span>{t('TOTAL')}</span>
                <span>$ 1.508.000</span>
              </div>
            </div>
          </motion.div>

          {/* 04. Movimientos de inventario (Ledger timeline, 4 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.4, delay: 0.12 }}
            className="md:col-span-4 rounded-2xl border border-[rgba(170,184,204,0.14)] bg-[#101B35]/80 p-6 flex flex-col justify-between"
          >
            <div>
              <div className="text-xs font-mono-tabular text-[#00D9FF] mb-2">04 · {t('Trazabilidad')}</div>
              <h3 className="font-display text-xl font-bold text-[#EAF4FF]">{t('Movimientos de inventario')}</h3>
              <p className="mt-2 text-sm text-[#AAB8CC]">
                {t('Bitácora inmutable de entradas, salidas y ajustes manuales vinculados al usuario responsable.')}
              </p>
            </div>
            <div className="mt-5 space-y-2.5 text-xs">
              <div className="flex items-center justify-between rounded-lg bg-[#080D1B] px-3 py-2 border border-[rgba(170,184,204,0.1)]">
                <span className="inline-flex items-center gap-2 text-emerald-400">
                  <ArrowDownLeft className="w-3.5 h-3.5" /> {t('Entrada')} OC-884
                </span>
                <span className="font-mono-tabular text-[#EAF4FF]">+20 u.</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-[#080D1B] px-3 py-2 border border-[rgba(170,184,204,0.1)]">
                <span className="inline-flex items-center gap-2 text-amber-400">
                  <ArrowUpRight className="w-3.5 h-3.5" /> {t('Despacho')} VTA-1046
                </span>
                <span className="font-mono-tabular text-[#EAF4FF]">-6 u.</span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-[#080D1B] px-3 py-2 border border-[rgba(170,184,204,0.1)]">
                <span className="inline-flex items-center gap-2 text-[#00D9FF]">
                  <RefreshCw className="w-3.5 h-3.5" /> {t('Ajuste Conteo QA')}
                </span>
                <span className="font-mono-tabular text-[#EAF4FF]">=6 u.</span>
              </div>
            </div>
          </motion.div>

          {/* 05. Estadísticas (Mini bar chart, 4 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.4, delay: 0.16 }}
            className="md:col-span-4 rounded-2xl border border-[rgba(170,184,204,0.14)] bg-[#101B35]/80 p-6 flex flex-col justify-between"
          >
            <div>
              <div className="text-xs font-mono-tabular text-[#00D9FF] mb-2">05 · {t('Analítica')}</div>
              <h3 className="font-display text-xl font-bold text-[#EAF4FF]">{t('Estadísticas ejecutivas')}</h3>
              <p className="mt-2 text-sm text-[#AAB8CC]">
                {t('Ingresos por fecha, ranking de productos más vendidos y proyección de reposición.')}
              </p>
            </div>
            <div className="mt-5 h-28 rounded-xl border border-[rgba(170,184,204,0.14)] bg-[#080D1B] px-3 pt-3">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={MINI_ANALYTICS}>
                  <XAxis dataKey="name" stroke="#AAB8CC" fontSize={10} tickLine={false} axisLine={false} />
                  <Bar dataKey="v" fill="#00D9FF" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* 06. Gestión de pedidos (Interactive step rail, 7 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.4, delay: 0.18 }}
            className="md:col-span-7 rounded-2xl border border-[rgba(170,184,204,0.14)] bg-[#101B35]/80 p-6 flex flex-col justify-between"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-xs font-mono-tabular text-[#00D9FF] mb-2">06 · {t('Flujo de despacho')}</div>
                <h3 className="font-display text-xl font-bold text-[#EAF4FF]">{t('Gestión de pedidos')}</h3>
                <p className="mt-2 text-sm text-[#AAB8CC]">
                  {t('Seguimiento claro de solicitudes desde la creación por el cliente hasta la entrega final.')}
                </p>
              </div>
              <Truck className="w-5 h-5 text-[#176BFF]" />
            </div>
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2">
              {steps.map((step, i) => {
                const active = i <= orderStep;
                return (
                  <button
                    key={step}
                    type="button"
                    onClick={() => setOrderStep(i)}
                    className={`px-3 py-2.5 rounded-lg border text-left transition-colors ${
                      active
                        ? 'border-[#176BFF] bg-[#176BFF]/15 text-[#EAF4FF]'
                        : 'border-[rgba(170,184,204,0.14)] bg-[#080D1B] text-[#AAB8CC]'
                    }`}
                  >
                    <div className="text-[11px] font-mono-tabular text-[#00D9FF]">0{i + 1}</div>
                    <div className="text-xs font-semibold mt-0.5 flex items-center justify-between">
                      <span>{step}</span>
                      {active && <Check className="w-3.5 h-3.5 text-[#00D9FF]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* 07. Administración de usuarios (RBAC matrix, 5 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.4, delay: 0.22 }}
            className="md:col-span-5 rounded-2xl border border-[rgba(170,184,204,0.14)] bg-[#101B35]/80 p-6 flex flex-col justify-between"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-mono-tabular text-[#00D9FF] mb-2">07 · {t('Gobernanza RBAC')}</div>
                <h3 className="font-display text-xl font-bold text-[#EAF4FF]">{t('Administración de usuarios')}</h3>
                <p className="mt-2 text-sm text-[#AAB8CC]">
                  {t('Permisos validados en servidor y menú adaptado para cada perfil operativo.')}
                </p>
              </div>
              <ShieldCheck className="w-5 h-5 text-[#00D9FF] shrink-0" />
            </div>
            <div className="mt-5 divide-y divide-[rgba(170,184,204,0.1)] text-xs">
              {[
                { role: 'Administrador', scope: 'Acceso integral · Usuarios y Analítica' },
                { role: 'Empleado', scope: 'Productos · Ventas · Movimientos · Pedidos' },
                { role: 'Cliente', scope: 'Catálogo · Creación y consulta de pedidos' },
              ].map((r) => (
                <div key={r.role} className="py-2 first:pt-0 last:pb-0 flex items-center justify-between gap-2">
                  <span className="font-semibold text-[#EAF4FF]">{r.role}</span>
                  <span className="text-[#AAB8CC] text-right">{r.scope}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
