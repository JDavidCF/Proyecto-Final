import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Github, Layers, Shield, Sliders, TrendingUp, Zap } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Marquee } from '../planes/Marquee';
import { SmoothStaggerText } from '../planes/SmoothStaggerText';
import { StockNovaLogo } from '../StockNovaLogo';
import warehouseImage from '../../assets/images/stocknova_warehouse_architecture_1794533550689.jpg';
import cubeImage from '../../assets/images/stocknova_cube_sculpture_1794533550779.jpg';
import { useLanguage } from '../../context/LanguageContext';

gsap.registerPlugin(ScrollTrigger);

export function ProductPresentationSection() {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.sn-presentation-reveal', {
        y: 22,
        opacity: 0,
        duration: 0.65,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 78%',
          once: true,
        },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="nosotros"
      className="py-20 sm:py-24 border-t border-[rgba(170,184,204,0.1)]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-between gap-8">
            <div className="sn-presentation-reveal">
              <p className="text-xs font-medium tracking-wider uppercase text-[#00D9FF] mb-3">
                {t('Plataforma unificada')}
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#EAF4FF] text-balance">
                {t('Todo tu inventario. Una sola plataforma.')}
              </h2>
              <p className="mt-4 text-base text-[#AAB8CC] leading-relaxed">
                {t('StockNova centraliza productos, ventas y pedidos. Las ventas, entradas y ajustes actualizan el inventario mediante FastAPI, con PostgreSQL como fuente de verdad.')}
              </p>
            </div>

            <div className="space-y-4">
              {[
                {
                  title: t('01. Sincronización atómica de existencias'),
                  desc: t('Cada transacción comercial y despacho actualiza el inventario y registra su movimiento auditable.'),
                },
                {
                  title: t('02. Visibilidad por rol operativo'),
                  desc: t('Administradores, empleados y clientes operan sobre la misma fuente de verdad con vistas dedicadas.'),
                },
                {
                  title: t('03. Decisiones respaldadas por métricas reales'),
                  desc: t('Detecta productos de baja rotación o quiebre inminente antes de afectar tus entregas.'),
                },
              ].map((pillar) => (
                <div
                  key={pillar.title}
                  className="sn-presentation-reveal rounded-xl border border-[rgba(170,184,204,0.12)] bg-[#101B35]/65 p-4"
                >
                  <h3 className="font-display text-sm font-semibold text-[#EAF4FF]">{pillar.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-[#AAB8CC]">{pillar.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-6 sn-presentation-reveal">
            <div className="relative h-full min-h-[360px] rounded-2xl overflow-hidden border border-[rgba(170,184,204,0.16)] bg-[#101B35]">
              <img
                src={warehouseImage}
                alt={t('Centro logístico automatizado con control de inventario StockNova')}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover lg:h-full"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-[#080D1B] via-[#080D1B]/35 to-transparent"
              />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="text-xs font-mono-tabular text-[#00D9FF]">
                  {t('Arquitectura FastAPI + PostgreSQL')}
                </div>
                <div className="mt-1 font-display text-xl font-bold text-[#EAF4FF]">
                  {t('Registro centralizado de existencias')}
                </div>
                <p className="mt-1 text-xs text-[#AAB8CC]">
                  {t('Registro de operaciones por producto, usuario y fecha.')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function BenefitsAndCtaSection() {
  const { t } = useLanguage();
  const marqueeItems = [
    t('Control de SKU en tiempo real'),
    t('Trazabilidad por usuario'),
    t('Alertas de stock mínimo'),
    t('Arquitectura FastAPI + PostgreSQL'),
    t('Roles granulares RBAC'),
    t('Analítica de rotación e ingresos'),
    t('Flujo de pedidos B2B'),
  ];

  const benefits = [
    {
      icon: <Layers className="w-5 h-5 text-[#00D9FF]" />,
      title: t('Organización'),
      desc: t('Estructura clara por categorías, productos y códigos SKU estandarizados.'),
    },
    {
      icon: <Shield className="w-5 h-5 text-[#176BFF]" />,
      title: t('Control'),
      desc: t('Permisos granulares para administradores, empleados y clientes validados en servidor.'),
    },
    {
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
      title: t('Información centralizada'),
      desc: t('Un solo punto de consulta para catálogo, ventas, movimientos y pedidos.'),
    },
    {
      icon: <Sliders className="w-5 h-5 text-[#00D9FF]" />,
      title: t('Seguimiento'),
      desc: t('Bitácora histórica de entradas, ajustes de inventario y salidas generadas por ventas.'),
    },
    {
      icon: <Zap className="w-5 h-5 text-[#176BFF]" />,
      title: t('Facilidad de uso'),
      desc: t('Flujos rápidos de búsqueda, filtrado y registro pensados para operación diaria.'),
    },
    {
      icon: <TrendingUp className="w-5 h-5 text-emerald-400" />,
      title: t('Toma de decisiones'),
      desc: t('Indicadores sobre ingresos por ventas, valor del inventario y productos con stock bajo.'),
    },
  ];

  return (
    <>
      {/* Marquee strip */}
      <section className="py-8 border-y border-[rgba(170,184,204,0.1)] bg-[#0D162C]/60">
        <Marquee
          duration={30}
          items={marqueeItems.map((label) => (
            <span
              key={label}
              className="inline-flex items-center gap-3 text-sm font-medium text-[#AAB8CC] px-4"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#176BFF]" aria-hidden="true" />
              {label}
            </span>
          ))}
        />
      </section>

      {/* G. Beneficios + Proof */}
      <section className="py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5 space-y-6">
              <div>
                <p className="text-xs font-medium tracking-wider uppercase text-[#00D9FF] mb-3">
                  {t('Beneficios tangibles')}
                </p>
                <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#EAF4FF] text-balance">
                  {t('Precisión operativa diseñada para escalar.')}
                </h2>
              </div>

              <div className="rounded-2xl overflow-hidden border border-[rgba(170,184,204,0.16)] bg-[#101B35]">
                <img
                  src={cubeImage}
                  alt={t('Cubo metálico StockNova con anillo orbital')}
                  referrerPolicy="no-referrer"
                  className="w-full aspect-square object-cover"
                />
              </div>

              <div className="rounded-xl border border-[rgba(170,184,204,0.14)] bg-[#101B35]/70 p-4 flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-[#176BFF]/15 flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5 text-[#00D9FF]" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#EAF4FF]">
                    {t('Integración con FastAPI y PostgreSQL')}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-[#AAB8CC]">
                    {t('El backend valida las operaciones y conserva la fuente de verdad del inventario.')}
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {benefits.map((b) => (
                <div
                  key={b.title}
                  className="rounded-2xl border border-[rgba(170,184,204,0.14)] bg-[#101B35]/75 p-5 hover:border-[rgba(23,107,255,0.4)] transition-colors"
                >
                  <div className="h-10 w-10 rounded-lg border border-[rgba(170,184,204,0.14)] bg-[#080D1B] flex items-center justify-center mb-4">
                    {b.icon}
                  </div>
                  <h3 className="font-display text-base font-semibold text-[#EAF4FF]">{b.title}</h3>
                  <p className="mt-1.5 text-sm text-[#AAB8CC] leading-relaxed">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* H. Llamado a la acción final */}
      <section className="py-20 sm:py-24 border-t border-[rgba(170,184,204,0.1)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-[rgba(23,107,255,0.35)] bg-[#101B35] px-6 py-14 sm:px-12 sm:py-16 text-center">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[560px] h-[280px] rounded-full opacity-30 blur-[90px]"
              style={{ background: 'radial-gradient(circle, #176BFF 0%, #00D9FF 50%, transparent 80%)' }}
            />
            <div className="relative z-10 max-w-2xl mx-auto">
              <SmoothStaggerText
                as="h2"
                inViewOnly
                text={t('Tu inventario merece una mejor forma de gestionarse.')}
                highlightWords={['mejor', 'gestionarse']}
                className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#EAF4FF] text-balance"
              />
              <p className="mt-4 text-base text-[#AAB8CC]">
                {t('Centraliza tus productos, automatiza la deducción de ventas y controla cada movimiento con seguridad empresarial.')}
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#176BFF] hover:bg-[#2A7BFF] text-sm font-semibold text-[#EAF4FF] transition-colors shadow-lg shadow-[#176BFF]/25 whitespace-nowrap shrink-0"
                >
                  {t('Comenzar ahora')} <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-[rgba(170,184,204,0.25)] bg-[#080D1B]/60 hover:bg-[#080D1B] text-sm font-semibold text-[#EAF4FF] transition-colors whitespace-nowrap shrink-0"
                >
                  {t('Acceder a mi cuenta')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* I. Footer */}
      <footer className="border-t border-[rgba(170,184,204,0.12)] bg-[#080D1B] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-[rgba(170,184,204,0.1)]">
            <div className="md:col-span-5">
              <StockNovaLogo size={36} showWordmark />
              <p className="mt-3 text-sm text-[#AAB8CC] max-w-sm leading-relaxed">
                {t('StockNova — Gestión y control de inventarios. Controla. Conecta. Evoluciona.')}
              </p>
            </div>
            <div className="md:col-span-3">
              <h4 className="font-display text-xs font-semibold uppercase tracking-wider text-[#EAF4FF] mb-3">
                {t('Navegación')}
              </h4>
              <ul className="space-y-2 text-sm text-[#AAB8CC]">
                <li><a href="#inicio" className="hover:text-[#EAF4FF] transition-colors">{t('Inicio')}</a></li>
                <li><a href="#funcionalidades" className="hover:text-[#EAF4FF] transition-colors">{t('Funcionalidades')}</a></li>
                <li><a href="#modulos" className="hover:text-[#EAF4FF] transition-colors">{t('Módulos')}</a></li>
                <li><a href="#nosotros" className="hover:text-[#EAF4FF] transition-colors">{t('Nosotros')}</a></li>
              </ul>
            </div>
            <div className="md:col-span-4">
              <h4 className="font-display text-xs font-semibold uppercase tracking-wider text-[#EAF4FF] mb-3">
                {t('Módulos del sistema')}
              </h4>
              <ul className="grid grid-cols-2 gap-2 text-sm text-[#AAB8CC]">
                <li><Link to="/login" className="hover:text-[#EAF4FF]">{t('Productos')}</Link></li>
                <li><Link to="/login" className="hover:text-[#EAF4FF]">{t('Ventas')}</Link></li>
                <li><Link to="/login" className="hover:text-[#EAF4FF]">{t('Movimientos')}</Link></li>
                <li><Link to="/login" className="hover:text-[#EAF4FF]">{t('Pedidos')}</Link></li>
                <li><Link to="/login" className="hover:text-[#EAF4FF]">{t('Estadísticas')}</Link></li>
                <li><Link to="/login" className="hover:text-[#EAF4FF]">{t('Usuarios')}</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#AAB8CC]">
            <span>{t('StockNova · Gestión de inventarios')}</span>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/JDavidCF/Proyecto-Final.git"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Repositorio de StockNova en GitHub"
                className="inline-flex items-center text-[#AAB8CC] hover:text-[#00D9FF] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D9FF] rounded"
              >
                <Github className="w-5 h-5" />
              </a>
              <span>© {new Date().getFullYear()} StockNova. {t('Todos los derechos reservados.')}</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
