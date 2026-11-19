import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  Boxes,
  ClipboardList,
  History,
  ShoppingBag,
  Users,
} from 'lucide-react';
import { HoverTabs, type HoverTabItem } from '../planes/HoverTabs';
import { useLanguage } from '../../context/LanguageContext';

export function ModulesSection() {
  const { locale, t } = useLanguage();
  const modules: HoverTabItem[] = [
    {
      id: 'productos',
      label: t('Productos'),
      subtitle: t('Catálogo maestro con búsqueda por código, categoría y disponibilidad.'),
      icon: <Boxes className="w-4 h-4" />,
      content: (
        <div className="flex flex-col justify-between h-full gap-5">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono-tabular text-[#00D9FF]">{t('Módulo')} · /app/productos</span>
              <span className="text-xs text-[#AAB8CC]">{t('Vista tabla y tarjetas')}</span>
            </div>
            <h3 className="mt-2 font-display text-2xl font-bold text-[#EAF4FF]">
              {t('Control claro por SKU y disponibilidad')}
            </h3>
            <p className="mt-2 text-sm text-[#AAB8CC] leading-relaxed">
              {t('Filtra por categoría y disponibilidad, edita precios y existencias, y detecta en segundos las referencias que necesitan reposición.')}
            </p>
          </div>
          <div className="rounded-xl border border-[rgba(170,184,204,0.14)] bg-[#080D1B] overflow-hidden">
            <div className="grid grid-cols-4 px-4 py-2.5 text-[11px] font-medium text-[#AAB8CC] border-b border-[rgba(170,184,204,0.1)]">
              <span>SKU</span>
              <span className="col-span-2">{t('Producto')}</span>
              <span className="text-right">{t('Existencia')}</span>
            </div>
            {[
              { sku: 'SN-SRV-402', name: 'Servomotor Brushless 750W', qty: '34 u.' },
              { sku: 'SN-CTL-510', name: 'Controlador PLC Ethernet', qty: '14 u.' },
              { sku: 'SN-PWR-740', name: 'Módulo UPS Litio 48V', qty: '11 u.' },
            ].map((row) => (
              <div
                key={row.sku}
                className="grid grid-cols-4 px-4 py-2.5 text-xs border-b border-[rgba(170,184,204,0.06)] last:border-0"
              >
                <span className="font-mono-tabular text-[#00D9FF]">{row.sku}</span>
                <span className="col-span-2 text-[#EAF4FF] truncate">{row.name}</span>
                <span className="text-right font-mono-tabular text-[#EAF4FF]">{row.qty}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-end">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#00D9FF] hover:text-[#EAF4FF]"
            >
              {t('Explorar módulo de Productos')} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      ),
    },
    {
      id: 'ventas',
      label: t('Ventas'),
      subtitle: t('Registro ágil de transacciones comerciales con deducción automática de inventario.'),
      icon: <ShoppingBag className="w-4 h-4" />,
      content: (
        <div className="flex flex-col justify-between h-full gap-5">
          <div>
            <span className="text-xs font-mono-tabular text-[#00D9FF]">{t('Módulo')} · /app/ventas</span>
            <h3 className="mt-2 font-display text-2xl font-bold text-[#EAF4FF]">
              {t('Facturación conectada al stock real')}
            </h3>
            <p className="mt-2 text-sm text-[#AAB8CC] leading-relaxed">
              {t('Cada venta valida disponibilidad en tiempo real, calcula totales exactos y genera los movimientos de salida correspondientes sin intervención manual.')}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-[rgba(170,184,204,0.14)] bg-[#080D1B] p-4">
              <div className="text-xs text-[#AAB8CC]">{t('Ticket promedio')}</div>
              <div className="mt-1 text-xl font-bold font-mono-tabular text-[#EAF4FF]">$ 2.240.710</div>
            </div>
            <div className="rounded-xl border border-[rgba(170,184,204,0.14)] bg-[#080D1B] p-4">
              <div className="text-xs text-[#AAB8CC]">{t('Ventas acumuladas')}</div>
              <div className="mt-1 text-xl font-bold font-mono-tabular text-[#00D9FF]">$ 15.685.000</div>
            </div>
          </div>
          <div className="flex justify-end">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#00D9FF] hover:text-[#EAF4FF]"
            >
              {t('Explorar módulo de Ventas')} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      ),
    },
    {
      id: 'movimientos',
      label: t('Movimientos'),
      subtitle: t('Auditoría cronológica de entradas, salidas y ajustes por producto y usuario.'),
      icon: <History className="w-4 h-4" />,
      content: (
        <div className="flex flex-col justify-between h-full gap-5">
          <div>
            <span className="text-xs font-mono-tabular text-[#00D9FF]">{t('Módulo')} · /app/movimientos</span>
            <h3 className="mt-2 font-display text-2xl font-bold text-[#EAF4FF]">
              {t('Historial trazable de cada unidad')}
            </h3>
            <p className="mt-2 text-sm text-[#AAB8CC] leading-relaxed">
              {t('Registra entradas de inventario o ajustes de conteo y filtra la bitácora por producto, tipo de operación o colaborador responsable.')}
            </p>
          </div>
          <div className="rounded-xl border border-[rgba(170,184,204,0.14)] bg-[#080D1B] p-4 space-y-2.5 text-xs">
            <div className="flex justify-between">
              <span className="text-emerald-400 font-medium">{t('Entrada').toLocaleUpperCase(locale)} · SN-NET-215</span>
              <span className="font-mono-tabular text-[#EAF4FF]">34 → 64 u.</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#00D9FF] font-medium">{t('Ajuste').toLocaleUpperCase(locale)} · SN-IOT-118</span>
              <span className="font-mono-tabular text-[#EAF4FF]">7 → 6 u.</span>
            </div>
            <div className="flex justify-between">
              <span className="text-amber-400 font-medium">{t('Salida').toLocaleUpperCase(locale)} · SN-ROB-332</span>
              <span className="font-mono-tabular text-[#EAF4FF]">10 → 7 u.</span>
            </div>
          </div>
          <div className="flex justify-end">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#00D9FF] hover:text-[#EAF4FF]"
            >
              {t('Explorar Movimientos')} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      ),
    },
    {
      id: 'pedidos',
      label: t('Pedidos'),
      subtitle: t('Creación y despacho de pedidos con transiciones validadas por rol.'),
      icon: <ClipboardList className="w-4 h-4" />,
      content: (
        <div className="flex flex-col justify-between h-full gap-5">
          <div>
            <span className="text-xs font-mono-tabular text-[#00D9FF]">{t('Módulo')} · /app/pedidos</span>
            <h3 className="mt-2 font-display text-2xl font-bold text-[#EAF4FF]">
              {t('Flujo completo de solicitudes B2B')}
            </h3>
            <p className="mt-2 text-sm text-[#AAB8CC] leading-relaxed">
              {t('Los clientes crean pedidos y consultan su progreso; empleados y administradores confirman, preparan y despachan reservando el inventario automáticamente.')}
            </p>
          </div>
          <div className="rounded-xl border border-[rgba(170,184,204,0.14)] bg-[#080D1B] p-4 space-y-2.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="font-mono-tabular text-[#EAF4FF]">PED-2026-301 · Andes Tech</span>
              <span className="text-amber-400 font-medium">{t('Pendiente').toLocaleUpperCase(locale)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-mono-tabular text-[#EAF4FF]">PED-2026-302 · InnovaGrid</span>
              <span className="text-[#00D9FF] font-medium">{t('Preparando').toLocaleUpperCase(locale)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-mono-tabular text-[#EAF4FF]">PED-2026-303 · Andes Tech</span>
              <span className="text-emerald-400 font-medium">{t('Enviado').toLocaleUpperCase(locale)}</span>
            </div>
          </div>
          <div className="flex justify-end">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#00D9FF] hover:text-[#EAF4FF]"
            >
              {t('Explorar Pedidos')} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      ),
    },
    {
      id: 'estadisticas',
      label: t('Estadísticas'),
      subtitle: t('Dashboard analítico exclusivo para administradores con métricas de ingresos y rotación.'),
      icon: <BarChart3 className="w-4 h-4" />,
      content: (
        <div className="flex flex-col justify-between h-full gap-5">
          <div>
            <span className="text-xs font-mono-tabular text-[#00D9FF]">{t('Módulo')} · /app/estadisticas</span>
            <h3 className="mt-2 font-display text-2xl font-bold text-[#EAF4FF]">
              {t('Inteligencia comercial y reposición')}
            </h3>
            <p className="mt-2 text-sm text-[#AAB8CC] leading-relaxed">
              {t('Visualiza curvas de ingresos por fecha, los productos de mayor rotación y el valor total inmovilizado por categoría en gráficas interactivas.')}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl border border-[rgba(170,184,204,0.14)] bg-[#080D1B] p-3">
              <div className="text-[11px] text-[#AAB8CC]">{t('Precio')}</div>
              <div className="mt-1 font-mono-tabular text-sm font-bold text-[#EAF4FF]">$ 41.900</div>
            </div>
            <div className="rounded-xl border border-[rgba(170,184,204,0.14)] bg-[#080D1B] p-3">
              <div className="text-[11px] text-[#AAB8CC]">{t('Valor venta')}</div>
              <div className="mt-1 font-mono-tabular text-sm font-bold text-[#00D9FF]">$ 64.800</div>
            </div>
            <div className="rounded-xl border border-[rgba(170,184,204,0.14)] bg-[#080D1B] p-3">
              <div className="text-[11px] text-[#AAB8CC]">{t('Stock crítico')}</div>
              <div className="mt-1 font-mono-tabular text-sm font-bold text-amber-400">4 SKUs</div>
            </div>
          </div>
          <div className="flex justify-end">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#00D9FF] hover:text-[#EAF4FF]"
            >
              {t('Explorar Estadísticas')} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      ),
    },
    {
      id: 'usuarios',
      label: t('Usuarios'),
      subtitle: t('Directorio de cuentas, asignación de roles RBAC y control de estado activo.'),
      icon: <Users className="w-4 h-4" />,
      content: (
        <div className="flex flex-col justify-between h-full gap-5">
          <div>
            <span className="text-xs font-mono-tabular text-[#00D9FF]">{t('Módulo')} · /app/usuarios</span>
            <h3 className="mt-2 font-display text-2xl font-bold text-[#EAF4FF]">
              {t('Seguridad y control de accesos')}
            </h3>
            <p className="mt-2 text-sm text-[#AAB8CC] leading-relaxed">
              {t('Administra los perfiles de Administrador, Empleado y Cliente con verificación estricta tanto en la interfaz como en los endpoints del backend.')}
            </p>
          </div>
          <div className="rounded-xl border border-[rgba(170,184,204,0.14)] bg-[#080D1B] p-4 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-[#EAF4FF]">Camila Mendoza</span>
              <span className="font-mono-tabular text-[#00D9FF]">{t('Administrador').toLocaleUpperCase(locale)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#EAF4FF]">Mateo Villalobos</span>
              <span className="font-mono-tabular text-[#176BFF]">{t('Empleado').toLocaleUpperCase(locale)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#EAF4FF]">Alejandro Pardo</span>
              <span className="font-mono-tabular text-[#AAB8CC]">{t('Cliente').toLocaleUpperCase(locale)}</span>
            </div>
          </div>
          <div className="flex justify-end">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#00D9FF] hover:text-[#EAF4FF]"
            >
              {t('Explorar Usuarios')} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section id="modulos" className="py-20 sm:py-24 border-t border-[rgba(170,184,204,0.1)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-12">
          <p className="text-xs font-medium tracking-wider uppercase text-[#00D9FF] mb-3">
            {t('Arquitectura modular')}
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#EAF4FF] text-balance">
            {t('Explora cada módulo antes de iniciar sesión.')}
          </h2>
          <p className="mt-3 text-[#AAB8CC] text-base leading-relaxed">
            {t('Pasa el cursor o selecciona cualquier módulo para inspeccionar su interfaz y flujo operativo.')}
          </p>
        </div>

        <HoverTabs items={modules} />
      </div>
    </section>
  );
}
