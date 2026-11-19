import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Bell,
  Boxes,
  ClipboardList,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  ShoppingBag,
  Users,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { extractApiError, notificationsService } from '../services/api';
import { canAccessModule, getRoleDisplayLabel, type AppModule } from '../utils/permissions';
import type { NotificationItem } from '../types/stocknova';
import { StockNovaLogo } from '../components/StockNovaLogo';
import { StockNovaAssistant } from '../components/assistant/StockNovaAssistant';
import { MovingBackdrop } from '../components/landing/MovingBackdrop';
import type { AssistantSection } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSelector } from '../components/LanguageSelector';
import { ThemeToggle } from '../components/ThemeToggle';

interface NavItem {
  module: AppModule;
  label: string;
  to: string;
  icon: React.ReactNode;
}

const ALL_NAV_ITEMS: NavItem[] = [
  { module: 'dashboard',    label: 'Resumen',      to: '/app',               icon: <LayoutDashboard className="w-4 h-4" /> },
  { module: 'productos',    label: 'Productos',    to: '/app/productos',      icon: <Boxes           className="w-4 h-4" /> },
  { module: 'ventas',       label: 'Ventas',       to: '/app/ventas',         icon: <ShoppingBag     className="w-4 h-4" /> },
  { module: 'movimientos',  label: 'Movimientos',  to: '/app/movimientos',    icon: <History         className="w-4 h-4" /> },
  { module: 'pedidos',      label: 'Pedidos',      to: '/app/pedidos',        icon: <ClipboardList   className="w-4 h-4" /> },
  { module: 'estadisticas', label: 'Estadísticas', to: '/app/estadisticas',   icon: <BarChart3       className="w-4 h-4" /> },
  { module: 'usuarios',     label: 'Usuarios',     to: '/app/usuarios',       icon: <Users           className="w-4 h-4" /> },
];

const ASSISTANT_SECTION_BY_MODULE: Record<AppModule, AssistantSection> = {
  dashboard:    'dashboard',
  productos:    'products',
  ventas:       'sales',
  movimientos:  'movements',
  pedidos:      'orders',
  estadisticas: 'statistics',
  usuarios:     'users',
};

/* ─── nav item stagger variants ─── */
const navContainerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.055, delayChildren: 0.1 } },
};
const navItemVariants = {
  hidden: { opacity: 0, x: -14 },
  show:   { opacity: 1, x: 0, transition: { duration: 0.3, ease: 'easeOut' as const } },
};

/* ─── logo pulse keyframes injected once ─── */
const LOGO_PULSE_CSS = `
@keyframes sn-logo-glow {
  0%,100% { filter: drop-shadow(0 0 0px #00D9FF); }
  50%      { filter: drop-shadow(0 0 10px #00D9FF) drop-shadow(0 0 22px #176BFF55); }
}
.sn-logo-pulse { animation: sn-logo-glow 2.6s ease-in-out 0.4s 2; }
`;

export default function DashboardLayout() {
  const { user, logout }         = useAuth();
  const { t }                    = useLanguage();
  const navigate                 = useNavigate();
  const location                 = useLocation();
  const [sidebarOpen,     setSidebarOpen]     = useState(false);
  const [notifOpen,       setNotifOpen]       = useState(false);
  const [notifications,   setNotifications]   = useState<NotificationItem[]>([]);
  const [notificationError, setNotificationError] = useState('');
  const logoRef = useRef<HTMLDivElement>(null);

  /* inject logo-pulse CSS once */
  useEffect(() => {
    if (document.getElementById('sn-logo-pulse-style')) return;
    const tag = document.createElement('style');
    tag.id = 'sn-logo-pulse-style';
    tag.textContent = LOGO_PULSE_CSS;
    document.head.appendChild(tag);
  }, []);

  /* add pulse class on mount */
  useEffect(() => {
    if (!logoRef.current) return;
    logoRef.current.classList.add('sn-logo-pulse');
    const id = setTimeout(() => logoRef.current?.classList.remove('sn-logo-pulse'), 7000);
    return () => clearTimeout(id);
  }, []);

  const visibleNav = ALL_NAV_ITEMS.filter((item) =>
    canAccessModule(user?.role, item.module)
  ).map((item) => {
    const localized = { ...item, label: t(item.label) };
    return user?.role === 'CLIENTE' && item.module === 'productos'
      ? { ...localized, label: t('Catálogo'), to: '/app/catalogo' }
      : localized;
  });

  const currentNav =
    visibleNav.find((item) =>
      item.to === '/app'
        ? location.pathname === '/app'
        : location.pathname.startsWith(item.to)
    ) ?? visibleNav[0];
  const assistantSection = currentNav
    ? ASSISTANT_SECTION_BY_MODULE[currentNav.module]
    : 'general';

  useEffect(() => {
    let active = true;
    setNotificationError('');
    notificationsService
      .list()
      .then((list) => { if (active) setNotifications(list); })
      .catch((error: unknown) => {
        if (active) setNotificationError(extractApiError(error, t('No se pudieron cargar las alertas.')));
      });
    return () => { active = false; };
  }, [location.pathname, t]);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  /* ─────────────────────── Sidebar content ─────────────────────── */
  const SidebarContent = (
    <div className="h-full flex flex-col justify-between sn-sidebar-gradient border-r border-[rgba(170,184,204,0.1)] px-4 py-5">
      {/* Logo */}
      <div>
        <div className="px-2 pb-6 border-b border-[rgba(170,184,204,0.08)]">
          <Link to="/" aria-label={`StockNova ${t('Inicio')}`}>
            <div ref={logoRef} className="inline-flex">
              <StockNovaLogo size={34} showWordmark />
            </div>
          </Link>
        </div>

        {/* Nav items */}
        <motion.nav
          aria-label={t('Módulos del sistema')}
          className="mt-5 space-y-1"
          variants={navContainerVariants}
          initial="hidden"
          animate="show"
        >
          {visibleNav.map((item) => (
            <motion.div key={item.to} variants={navItemVariants}>
              <NavLink
                to={item.to}
                end={item.to === '/app'}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-[#176BFF]/20 text-[#EAF4FF] border-l-2 border-[#176BFF] shadow-[inset_2px_0_0_#176BFF] pl-[10px]'
                      : 'text-[#AAB8CC] hover:text-[#EAF4FF] hover:bg-[#101B35]/70 border-l-2 border-transparent pl-[10px]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {/* Colored indicator dot on hover / active */}
                    <span
                      className={`absolute left-[2px] top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full transition-all duration-200 ${
                        isActive
                          ? 'bg-[#176BFF] shadow-[0_0_6px_#176BFF]'
                          : 'bg-transparent group-hover:bg-[#176BFF]/60'
                      }`}
                    />
                    <span className="shrink-0">{item.icon}</span>
                    <span className="truncate sn-neon-category">{item.label}</span>
                  </>
                )}
              </NavLink>
            </motion.div>
          ))}
        </motion.nav>
      </div>

      {/* Bottom: profile + logout */}
      <div className="pt-4 border-t border-[rgba(170,184,204,0.1)] space-y-3">
        {/* Glass morphism user card */}
        <div
          className="sn-dashboard-user-card px-3 py-3 rounded-xl backdrop-blur-md"
        >
          <div className="text-sm font-semibold text-[#EAF4FF] truncate">{user?.name}</div>
          <div className="text-xs text-[#00D9FF] mt-0.5">
            {user ? t(getRoleDisplayLabel(user.role)) : ''}
          </div>
          <div className="text-[11px] text-[#AAB8CC] truncate mt-0.5">{user?.email}</div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-[rgba(170,184,204,0.18)] text-xs font-semibold text-[#AAB8CC] hover:text-[#EAF4FF] hover:bg-[#101B35] transition-colors"
        >
          <LogOut className="w-4 h-4" />
          {t('Cerrar sesión')}
        </button>
      </div>
    </div>
  );

  /* ─────────────────────── Render ─────────────────────── */
  return (
    <div className="sn-dashboard-shell relative isolate min-h-screen bg-[#080D1B] text-[#EAF4FF] flex">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <MovingBackdrop scene="dashboard" />
      </div>

      {/* Desktop Sidebar */}
      <aside className="relative z-10 hidden lg:block w-64 shrink-0 sticky top-0 h-screen">
        {SidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 360, damping: 34 }}
              className="relative z-10 w-64 max-w-[80vw] h-full"
            >
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                aria-label={t('Cerrar menú lateral')}
                className="absolute top-4 right-3 p-1.5 rounded-lg text-[#AAB8CC] hover:text-[#EAF4FF]"
              >
                <X className="w-5 h-5" />
              </button>
              {SidebarContent}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content Shell */}
      <div className="relative z-10 flex-1 min-w-0 flex flex-col">

        {/* ── Enhanced Header ── */}
        <header className="sn-dashboard-header sticky top-0 z-30 h-16 px-4 sm:px-6 border-b border-[rgba(170,184,204,0.1)] backdrop-blur-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label={t('Abrir menú lateral')}
              className="lg:hidden h-10 w-10 rounded-lg border border-[rgba(170,184,204,0.2)] flex items-center justify-center text-[#EAF4FF]"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb with colored slash */}
            <div className="flex items-center gap-2 text-sm min-w-0">
              <span className="text-[#AAB8CC] hidden sm:inline">StockNova</span>
              <span
                className="hidden sm:inline text-[#176BFF] font-bold select-none"
                aria-hidden="true"
                style={{ textShadow: '0 0 8px #176BFF88' }}
              >
                /
              </span>
              <span className="font-display font-semibold text-[#EAF4FF] truncate sn-neon-page-title">
                {currentNav?.label ?? t('Panel')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 relative">
            <LanguageSelector />
            <ThemeToggle />

            {/* Notification button */}
            <button
              type="button"
              onClick={() => setNotifOpen((prev) => !prev)}
              aria-label={`${t('Notificaciones')} (${notifications.length})`}
              aria-expanded={notifOpen}
              className="relative h-10 px-3 rounded-xl border border-[rgba(170,184,204,0.18)] bg-[#101B35]/70 hover:border-[#176BFF]/50 flex items-center gap-2 text-xs font-medium text-[#EAF4FF] transition-colors"
            >
              <Bell className="w-4 h-4 text-[#00D9FF]" />
              <span className="hidden sm:inline">{t('Alertas')}</span>
              {notifications.length > 0 && (
                <span className="relative inline-flex">
                  {/* Pulse ring animation for badge */}
                  <span className="sn-pulse-ring absolute inset-0 rounded-full" />
                  <span className="font-mono-tabular text-xs font-semibold text-amber-400">
                    {notifications.length}
                  </span>
                </span>
              )}
            </button>

            {/* Notification panel */}
            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-12 w-80 max-w-[90vw] rounded-2xl border border-[rgba(170,184,204,0.2)] bg-[#101B35] p-4 shadow-2xl z-50"
                >
                  <div className="flex items-center justify-between pb-2.5 border-b border-[rgba(170,184,204,0.12)]">
                    <span className="font-display text-xs font-semibold text-[#EAF4FF]">
                      {t('Notificaciones del sistema')}
                    </span>
                    <button
                      type="button"
                      onClick={() => setNotifOpen(false)}
                      className="text-xs text-[#AAB8CC] hover:text-[#EAF4FF]"
                    >
                      {t('Cerrar')}
                    </button>
                  </div>
                  <div className="mt-3 space-y-2.5 max-h-72 overflow-auto">
                    {notificationError ? (
                      <p role="alert" className="text-xs text-rose-300 py-4 text-center">
                        {notificationError}
                      </p>
                    ) : notifications.length === 0 ? (
                      <p className="text-xs text-[#AAB8CC] py-4 text-center">
                        {t('Sin alertas pendientes en este momento.')}
                      </p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className="rounded-xl bg-[#080D1B]/80 border border-[rgba(170,184,204,0.12)] p-3"
                        >
                          <div
                            className={`text-xs font-semibold ${
                              n.severity === 'critical'
                                ? 'text-rose-400'
                                : n.severity === 'warning'
                                ? 'text-amber-400'
                                : 'text-[#00D9FF]'
                            }`}
                          >
                            {n.title}
                          </div>
                          <p className="mt-1 text-xs text-[#AAB8CC] leading-relaxed">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto">
          <Outlet />
        </main>
      </div>

      <StockNovaAssistant section={assistantSection} />
    </div>
  );
}
