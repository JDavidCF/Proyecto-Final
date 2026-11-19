import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  ClipboardList,
  History,
  ShoppingBag,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { motion } from 'motion/react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import gsap from 'gsap';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  extractApiError,
  movementsService,
  ordersService,
  productsService,
  salesService,
} from '../services/api';
import { computeInventoryValuation, formatCOP, LOW_STOCK_THRESHOLD } from '../utils/inventoryMath';
import { canAccessModule } from '../utils/permissions';
import type { InventoryMovement, Order, Product, Sale } from '../types/stocknova';
import { AnimatedNumber } from '../components/planes/AnimatedNumber';
import { ActivityFeed } from '../components/planes/ActivityFeed';
import { useLanguage } from '../context/LanguageContext';
import cubeImage from '../assets/images/stocknova_cube_sculpture_1794533550779.jpg';

/* ─────────────────────────── DashboardHero ─────────────────────────── */

function DashboardHero({ children }: { children: React.ReactNode }) {
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!heroRef.current) return;
    const children = heroRef.current.querySelectorAll('.hero-child');
    gsap.from(children, {
      y: 30,
      opacity: 0,
      duration: 0.65,
      stagger: 0.1,
      ease: 'power3.out',
    });
  }, []);

  return (
    <motion.section
      ref={heroRef}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className="sn-dashboard-hero relative isolate overflow-hidden rounded-3xl border border-[rgba(170,184,204,0.2)] shadow-2xl shadow-blue-950/20 p-5 sm:p-7"
      style={{
        background: 'linear-gradient(135deg, #101B35 0%, #172543 35%, #1A2D50 65%, #30204A 100%)',
        animation: 'sn-hero-gradient-shift 8s ease-in-out infinite alternate',
      }}
    >
      <style>{`
        @keyframes sn-hero-gradient-shift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      {/* Grid background */}
      <div aria-hidden="true" className="sn-grid-bg absolute inset-0 opacity-30" />

      {/* Purple orb (bigger) */}
      <div
        aria-hidden="true"
        className="absolute -right-10 -top-20 h-96 w-96 rounded-full bg-[#8B5CF6]/30 blur-3xl"
        style={{ animation: 'sn-orb-pulse 6s ease-in-out infinite' }}
      />
      {/* Cyan orb (new) */}
      <div
        aria-hidden="true"
        className="absolute right-1/3 -top-10 h-72 w-72 rounded-full bg-[#00D9FF]/20 blur-3xl"
        style={{ animation: 'sn-orb-pulse 8s ease-in-out infinite reverse' }}
      />
      {/* Bottom accent orb */}
      <div aria-hidden="true" className="absolute -bottom-28 right-1/4 h-64 w-64 rounded-full bg-[#00D9FF]/15 blur-3xl" />

      {/* Cube image */}
      <div aria-hidden="true" className="absolute inset-y-0 right-0 hidden w-[42%] md:block">
        <img
          src={cubeImage}
          alt=""
          className="h-full w-full object-cover opacity-30 mix-blend-screen"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#101B35] via-[#101B35]/65 to-transparent" />
      </div>

      {/* StockNova label */}
      <div className="hero-child relative z-10 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#A5E8FF]">
        <Sparkles className="h-4 w-4 text-amber-300" aria-hidden="true" />
        <span>StockNova</span>
      </div>

      {/* Main content */}
      <div className="hero-child relative z-10 mt-4">{children}</div>

      {/* Data ticker — bottom-right, decorative */}
      <div
        aria-hidden="true"
        className="hero-child absolute bottom-4 right-5 hidden sm:flex items-center gap-4 text-[10px] font-mono-tabular text-[#AAB8CC]/70 select-none"
      >
        <span className="flex flex-col items-end leading-tight">
          <span className="text-[#00D9FF] text-xs font-semibold">
            <AnimatedNumber value={2847} />
          </span>
          <span>SKUs indexados</span>
        </span>
        <span className="w-px h-6 bg-[rgba(170,184,204,0.2)]" />
        <span className="flex flex-col items-end leading-tight">
          <span className="text-emerald-400 text-xs font-semibold">
            <AnimatedNumber value={98} suffix="%" />
          </span>
          <span>Uptime sistema</span>
        </span>
        <span className="w-px h-6 bg-[rgba(170,184,204,0.2)]" />
        <span className="flex flex-col items-end leading-tight">
          <span className="text-amber-300 text-xs font-semibold">
            <AnimatedNumber value={14} suffix="ms" />
          </span>
          <span>Latencia API</span>
        </span>
      </div>
    </motion.section>
  );
}

/* ─────────────────────── KPI card accent configs ───────────────────── */

const kpiAccents = [
  {
    border: 'border-t-cyan-400/70',
    hoverShadow: 'hover:shadow-cyan-500/20',
    hoverBorder: 'hover:border-cyan-400/50',
    iconBg: 'bg-cyan-400/10',
    iconColor: 'text-[#00D9FF]',
  },
  {
    border: 'border-t-emerald-400/70',
    hoverShadow: 'hover:shadow-emerald-500/20',
    hoverBorder: 'hover:border-emerald-400/50',
    iconBg: 'bg-emerald-400/10',
    iconColor: 'text-emerald-400',
  },
  {
    border: 'border-t-amber-400/70',
    hoverShadow: 'hover:shadow-amber-500/20',
    hoverBorder: 'hover:border-amber-400/50',
    iconBg: 'bg-amber-400/10',
    iconColor: 'text-amber-400',
  },
  {
    border: 'border-t-blue-400/70',
    hoverShadow: 'hover:shadow-blue-500/20',
    hoverBorder: 'hover:border-blue-400/50',
    iconBg: 'bg-blue-400/10',
    iconColor: 'text-[#176BFF]',
  },
];

/* ───────────────────────── Main component ───────────────────────────── */

export default function DashboardOverviewPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { theme } = useTheme();
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        if (!user) return;
        const [p, o] = await Promise.all([
          productsService.list(),
          ordersService.list(user.role),
        ]);
        if (!active) return;
        setProducts(p);
        setOrders(o);

        if (user?.role === 'ADMINISTRADOR' || user?.role === 'EMPLEADO') {
          const [s, m] = await Promise.all([
            salesService.list(),
            movementsService.list(),
          ]);
          if (!active) return;
          setSales(s);
          setMovements(m);
        }
      } catch (error) {
        if (active) setLoadError(extractApiError(error, t('No se pudo cargar el resumen.')));
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [user, t]);

  /* ── Loading skeletons ── */
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 rounded-lg bg-[#101B35] sn-shimmer" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-28 rounded-2xl bg-[#101B35] sn-shimmer" />
          ))}
        </div>
        <div className="h-72 rounded-2xl bg-[#101B35] sn-shimmer" />
      </div>
    );
  }

  /* ── Error state ── */
  if (loadError) {
    return (
      <div role="alert" className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-5 text-sm text-rose-200">
        {loadError}
      </div>
    );
  }

  const valuation = computeInventoryValuation(products);
  const lowStockList = products.filter((p) => p.stock <= LOW_STOCK_THRESHOLD);
  const totalSalesRevenue = sales.reduce((acc, s) => acc + s.total, 0);

  const revenueChartData = [...sales]
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .map((s) => ({
      day: s.createdAt.slice(5, 10),
      total: s.total,
    }));

  /* ════════════════════════════════════════════════════
     CLIENT-FOCUSED OVERVIEW (CLIENTE role)
  ════════════════════════════════════════════════════ */
  if (user?.role === 'CLIENTE') {
    const activeOrders = orders.filter(
      (o) => o.status === 'PENDIENTE' || o.status === 'CONFIRMADO'
    );

    const clientKpis = [
      {
        label: t('Productos disponibles'),
        value: products.filter((p) => p.stock > 0).length,
        icon: <Boxes className="w-4 h-4" />,
        accent: kpiAccents[0],
        suffix: undefined,
        prefix: undefined,
      },
      {
        label: t('Pedidos activos'),
        value: activeOrders.length,
        icon: <ClipboardList className="w-4 h-4" />,
        accent: kpiAccents[3],
        suffix: undefined,
        prefix: undefined,
      },
      {
        label: t('Total histórico pedidos'),
        value: orders.reduce((acc, o) => acc + o.total, 0),
        icon: <TrendingUp className="w-4 h-4" />,
        accent: kpiAccents[1],
        prefix: '$',
        suffix: undefined,
      },
    ];

    return (
      <div className="space-y-6">
        <DashboardHero>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#EAF4FF]">
            Bienvenido, {user.name}
          </h1>
          <p className="text-sm text-[#AAB8CC] mt-1">
            {t('Consulta la disponibilidad en tiempo real de nuestro catálogo y el estado de tus pedidos.')}
          </p>
        </DashboardHero>

        {/* Client KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {clientKpis.map((kpi, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className={`
                group rounded-2xl border-t-2 border border-[rgba(170,184,204,0.14)]
                bg-[#101B35]/85 p-5 shadow-lg shadow-blue-950/10
                transition-all duration-300
                hover:-translate-y-2 hover:shadow-xl
                ${kpi.accent.border} ${kpi.accent.hoverShadow} ${kpi.accent.hoverBorder}
              `}
            >
              <div className="flex items-center justify-between text-xs text-[#AAB8CC]">
                <span>{kpi.label}</span>
                <div className={`flex items-center justify-center w-7 h-7 rounded-full ${kpi.accent.iconBg} ${kpi.accent.iconColor}`}>
                  {kpi.icon}
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-1 text-2xl font-bold text-[#EAF4FF]">
                <AnimatedNumber value={kpi.value} prefix={kpi.prefix} suffix={kpi.suffix} />
                <span className="text-sm text-emerald-400 ml-1">↑</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Client bottom panels — glass treatment */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="sn-glass-card rounded-2xl border border-[rgba(170,184,204,0.18)] bg-[#101B35]/85 p-6 shadow-lg shadow-blue-950/10 ring-1 ring-inset ring-white/5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-base font-semibold text-[#EAF4FF]">
                {t('Tus pedidos recientes')}
              </h2>
              <Link
                to="/app/pedidos"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#00D9FF] hover:underline"
              >
                {t('Gestionar pedidos')} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            {orders.length === 0 ? (
              <p className="text-sm text-[#AAB8CC] py-6">{t('Aún no has realizado pedidos.')}</p>
            ) : (
              <div className="divide-y divide-[rgba(170,184,204,0.1)]">
                {orders.slice(0, 4).map((o) => (
                  <div key={o.id} className="py-3 flex items-center justify-between gap-3 text-sm">
                    <div>
                      <div className="font-mono-tabular font-semibold text-[#EAF4FF]">{o.code}</div>
                      <div className="text-xs text-[#AAB8CC]">{o.items.length} {t('referencia(s)')}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono-tabular font-semibold text-[#EAF4FF]">
                        {formatCOP(o.total)}
                      </div>
                      <div className="text-xs text-[#00D9FF]">
                        {t(o.status === 'PENDIENTE' ? 'Pendiente' : o.status === 'CONFIRMADO' ? 'Confirmado' : o.status === 'RECHAZADO' ? 'Rechazado' : 'Cancelado')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="sn-glass-card rounded-2xl border border-[rgba(170,184,204,0.18)] bg-[#101B35]/85 p-6 shadow-lg shadow-blue-950/10 ring-1 ring-inset ring-white/5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-base font-semibold text-[#EAF4FF]">
                {t('Catálogo destacado')}
              </h2>
              <Link
                to="/app/catalogo"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#00D9FF] hover:underline"
              >
                {t('Ver catálogo')} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="divide-y divide-[rgba(170,184,204,0.1)]">
              {products.filter((product) => product.available).slice(0, 4).map((p) => (
                <div key={p.id} className="py-3 flex items-center justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <div className="font-medium text-[#EAF4FF] truncate">{p.name}</div>
                    <div className="text-xs font-mono-tabular text-[#AAB8CC]">
                      {p.sku} · {p.category}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-mono-tabular font-semibold text-[#EAF4FF]">
                      {formatCOP(p.price)}
                    </div>
                    <div className="text-xs text-emerald-400 font-mono-tabular">
                      {p.stock} {t('disp.')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ════════════════════════════════════════════════════
     OPERATIONAL OVERVIEW (ADMINISTRADOR & EMPLEADO)
  ════════════════════════════════════════════════════ */

  const kpiCards = [
    {
      label: t('Valor comercial inventario'),
      value: valuation.retailValue,
      prefix: '$',
      suffix: undefined as string | undefined,
      icon: <Boxes className="w-4 h-4" />,
      sub: `${valuation.totalUnits} ${t('unidades')} · ${products.length} SKUs`,
      subColor: 'text-[#AAB8CC]',
      accent: kpiAccents[0],
    },
    {
      label: t('Ventas acumuladas'),
      value: totalSalesRevenue,
      prefix: '$',
      suffix: undefined as string | undefined,
      icon: <TrendingUp className="w-4 h-4" />,
      sub: `${sales.length} ${t('operaciones registradas')}`,
      subColor: 'text-emerald-400',
      accent: kpiAccents[1],
    },
    {
      label: t('Alertas de stock'),
      value: lowStockList.length,
      prefix: undefined as string | undefined,
      suffix: ' SKUs',
      icon: <AlertTriangle className="w-4 h-4" />,
      sub: `${valuation.outOfStockCount} ${t('agotado(s)')} · ${valuation.lowStockCount} ${t('bajo mínimo')}`,
      subColor: 'text-amber-400',
      accent: kpiAccents[2],
    },
    {
      label: t('Pedidos por despachar'),
      value: orders.filter((o) => o.status === 'PENDIENTE').length,
      prefix: undefined as string | undefined,
      suffix: undefined as string | undefined,
      icon: <ClipboardList className="w-4 h-4" />,
      sub: `${orders.length} ${t('pedidos totales')}`,
      subColor: 'text-[#AAB8CC]',
      accent: kpiAccents[3],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Hero */}
      <DashboardHero>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#EAF4FF]">
              {t('Resumen operativo')}
            </h1>
            <p className="text-sm text-[#AAB8CC] mt-1">
              {t('Estado consolidado de inventario, transacciones y flujo de bodega.')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {canAccessModule(user?.role, 'ventas') && (
              <Link
                to="/app/ventas"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#176BFF] hover:bg-[#2A7BFF] text-xs font-semibold text-[#EAF4FF] transition-colors whitespace-nowrap shrink-0"
              >
                <ShoppingBag className="w-4 h-4" /> {t('Registrar venta')}
              </Link>
            )}
            {canAccessModule(user?.role, 'movimientos') && (
              <Link
                to="/app/movimientos"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[rgba(170,184,204,0.22)] bg-[#101B35] hover:border-[#176BFF] text-xs font-semibold text-[#EAF4FF] transition-colors whitespace-nowrap shrink-0"
              >
                <History className="w-4 h-4" /> {t('Nuevo movimiento')}
              </Link>
            )}
          </div>
        </div>
      </DashboardHero>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.09, ease: [0.16, 1, 0.3, 1] }}
            className={`
              group rounded-2xl border-t-2 border border-[rgba(170,184,204,0.14)]
              bg-[#101B35]/85 p-5 shadow-lg shadow-blue-950/10
              transition-all duration-300
              hover:-translate-y-2 hover:shadow-xl
              ${kpi.accent.border} ${kpi.accent.hoverShadow} ${kpi.accent.hoverBorder}
            `}
          >
            <div className="flex items-center justify-between text-xs text-[#AAB8CC]">
              <span>{kpi.label}</span>
              <div className={`flex items-center justify-center w-7 h-7 rounded-full ${kpi.accent.iconBg} ${kpi.accent.iconColor}`}>
                {kpi.icon}
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-1 text-2xl font-bold text-[#EAF4FF]">
              <AnimatedNumber value={kpi.value} prefix={kpi.prefix} suffix={kpi.suffix} />
              <span className="text-sm text-emerald-400 ml-1">↑</span>
            </div>
            <div className={`mt-1 text-xs font-mono-tabular ${kpi.subColor}`}>
              {kpi.sub}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Split: Revenue Chart + Recent Movements */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Revenue Chart */}
        <div className="lg:col-span-7 rounded-2xl border border-[rgba(170,184,204,0.22)] bg-[#101B35]/85 p-5 sm:p-6 shadow-lg shadow-blue-950/10 ring-1 ring-inset ring-[#176BFF]/10" style={{ boxShadow: '0 4px 32px 0 rgba(23,107,255,0.08), 0 1.5px 8px 0 rgba(0,217,255,0.04), inset 0 1px 0 rgba(255,255,255,0.04)' }}>
          <div className="flex items-center justify-between mb-1">
            <div>
              <h2 className="font-display text-base font-semibold text-[#EAF4FF]">
                {t('Flujo reciente de ventas')}
              </h2>
              <p className="text-xs text-[#AAB8CC]">{t('Monto facturado por operación reciente (COP)')}</p>
            </div>
            {canAccessModule(user?.role, 'estadisticas') && (
              <Link
                to="/app/estadisticas"
                className="text-xs font-semibold text-[#00D9FF] hover:underline"
              >
                {t('Ver analítica completa')}
              </Link>
            )}
          </div>
          {/* Gradient divider */}
          <div className="mb-4 h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(23,107,255,0.4) 40%, rgba(0,217,255,0.3) 60%, transparent)' }} />
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChartData} margin={{ top: 8, right: 10, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id="sn-dash-rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#176BFF" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#00D9FF" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="day"
                  stroke={theme === 'dark' ? '#AAB8CC' : '#426B7B'}
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke={theme === 'dark' ? '#AAB8CC' : '#426B7B'}
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? '#080D1B' : '#FFFFFF',
                    borderColor: theme === 'dark' ? 'rgba(170,184,204,0.2)' : 'rgba(24,49,83,0.16)',
                    borderRadius: '10px',
                    color: theme === 'dark' ? '#EAF4FF' : '#153F51',
                    fontSize: '12px',
                  }}
                  formatter={(value) => formatCOP(Number(value))}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#00D9FF"
                  strokeWidth={2.2}
                  fill="url(#sn-dash-rev)"
                  animationDuration={350}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Movements */}
        <div className="lg:col-span-5 rounded-2xl border border-[rgba(170,184,204,0.14)] bg-[#101B35]/85 p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-base font-semibold text-[#EAF4FF]">
              {t('Últimos movimientos')}
            </h2>
            <Link
              to="/app/movimientos"
              className="text-xs font-semibold text-[#00D9FF] hover:underline"
            >
              {t('Ver historial')}
            </Link>
          </div>
          {/* Staggered movement rows via ActivityFeed (the component handles its own rows) */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.07 } },
            }}
          >
            <ActivityFeed movements={movements} maxItems={5} />
          </motion.div>
        </div>
      </div>

      {/* Low Stock Watchlist */}
      <div className="rounded-2xl border border-[rgba(170,184,204,0.14)] bg-[#101B35]/85 p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display text-base font-semibold text-[#EAF4FF]">
              {t('Productos que requieren reposición')}
            </h2>
            <p className="text-xs text-[#AAB8CC]">
              {t('Referencias con stock igual o inferior al umbral mínimo definido')}
            </p>
          </div>
          <Link
            to="/app/productos"
            className="text-xs font-semibold text-[#00D9FF] hover:underline"
          >
            {t('Ir a Productos')}
          </Link>
        </div>

        {lowStockList.length === 0 ? (
          <p className="text-sm text-[#AAB8CC] py-4">
            {t('Todos los productos superan su umbral mínimo de inventario.')}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr
                  className="text-xs text-[#AAB8CC]"
                  style={{
                    background: 'linear-gradient(90deg, rgba(23,107,255,0.10) 0%, rgba(0,217,255,0.06) 50%, rgba(48,32,74,0.10) 100%)',
                  }}
                >
                  <th className="py-2.5 pr-4 pl-3 font-medium rounded-tl-lg">SKU</th>
                  <th className="py-2.5 pr-4 font-medium">{t('Producto')}</th>
                  <th className="py-2.5 pr-4 font-medium">{t('Marca')}</th>
                  <th className="py-2.5 pr-4 font-medium text-right">{t('Stock actual')}</th>
                  <th className="py-2.5 pr-3 font-medium text-right rounded-tr-lg">{t('Estado')}</th>
                </tr>
              </thead>
              <motion.tbody
                className="divide-y divide-[rgba(170,184,204,0.08)]"
                initial="hidden"
                animate="visible"
                variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }}
              >
                {lowStockList.map((p) => (
                  <motion.tr
                    key={p.id}
                    variants={{
                      hidden: { opacity: 0, x: -12 },
                      visible: { opacity: 1, x: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
                    }}
                    className="hover:bg-[#EAF4FF]/[0.02]"
                  >
                    <td className="py-3 pr-4 pl-3 font-mono-tabular text-xs text-[#00D9FF]">{p.sku}</td>
                    <td className="py-3 pr-4 font-medium text-[#EAF4FF]">{p.name}</td>
                    <td className="py-3 pr-4 text-xs text-[#AAB8CC]">{p.supplier}</td>
                    <td className="py-3 pr-4 text-right">
                      <span
                        className={`inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-semibold font-mono-tabular ${
                          p.stock === 0
                            ? 'bg-rose-500/15 text-rose-400 ring-1 ring-rose-500/30'
                            : 'bg-amber-400/15 text-amber-400 ring-1 ring-amber-400/30'
                        }`}
                      >
                        {p.stock} u.
                      </span>
                    </td>
                    <td className="py-3 pr-3 text-right">
                      <span
                        className={`inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          p.stock === 0
                            ? 'bg-rose-500/10 text-rose-400'
                            : 'bg-amber-400/10 text-amber-400'
                        }`}
                      >
                        {p.stock === 0 ? t('Agotado') : t('Stock bajo')}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </motion.tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
