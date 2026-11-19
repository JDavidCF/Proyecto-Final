import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { AlertCircle, ArrowLeft, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { extractApiError } from '../services/api';
import { getDefaultRouteForRole } from '../utils/permissions';
import { StockNovaLogo } from '../components/StockNovaLogo';
import { SpaceWallpaper } from '../components/SpaceWallpaper';
import { SmoothStaggerText } from '../components/planes/SmoothStaggerText';
import { LanguageSelector } from '../components/LanguageSelector';
import cubeImage from '../assets/images/stocknova_cube_sculpture_1794533550779.jpg';
import { useLanguage } from '../context/LanguageContext';
import { ThemeToggle } from '../components/ThemeToggle';
import gsap from 'gsap';

/* ─── KPI Mini Card ─────────────────────────────────────────────────────────── */
interface KpiCardProps {
  emoji: string;
  label: string;
  animationDelay?: string;
}

function KpiCard({ emoji, label, animationDelay = '0s' }: KpiCardProps) {
  return (
    <div
      className="sn-glass-card flex min-w-0 items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-[#EAF4FF] select-none pointer-events-none"
      style={{
        animation: `sn-float-kpi 4s ease-in-out infinite alternate`,
        animationDelay,
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(23,107,255,0.25)',
        boxShadow: '0 4px 24px rgba(0,217,255,0.12), inset 0 0 12px rgba(23,107,255,0.08)',
      }}
      aria-hidden="true"
    >
      <span style={{ fontSize: '1rem' }}>{emoji}</span>
      <span>{label}</span>
    </div>
  );
}

/* ─── LoginPage ──────────────────────────────────────────────────────────────── */
export default function LoginPage() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const taglineRef = useRef<HTMLDivElement>(null);

  /* Tagline letter-by-letter reveal (GSAP) */
  useEffect(() => {
    if (!taglineRef.current) return;
    const letters = taglineRef.current.querySelectorAll<HTMLSpanElement>('.sn-letter');
    if (!letters.length) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        letters,
        { opacity: 0, y: 8 },
        {
          opacity: 1,
          y: 0,
          duration: 0.04,
          stagger: 0.025,
          ease: 'power2.out',
          delay: 0.3,
        }
      );
    }, taglineRef);
    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError(t('Ingresa un correo electrónico válido.'));
      return;
    }
    if (!password || password.length < 4) {
      setError(t('Ingresa tu contraseña para continuar.'));
      return;
    }

    setSubmitting(true);
    try {
      const user = await login(cleanEmail, password);
      navigate(getDefaultRouteForRole(user.role), { replace: true });
    } catch (err) {
      setError(extractApiError(err, t('No fue posible iniciar sesión.')));
    } finally {
      setSubmitting(false);
    }
  };

  /* Split tagline text for letter-by-letter animation */
  const taglineText = t('Accede al núcleo operativo de tu inventario.');
  const taglineLetters = taglineText.split('').map((char, i) => (
    <span key={i} className="sn-letter inline-block" style={{ opacity: 0 }}>
      {char === ' ' ? '\u00A0' : char}
    </span>
  ));

  return (
    <>
      {/* Global CSS for KPI float animation and input glow */}
      <style>{`
        @keyframes sn-float-kpi {
          0%   { transform: translateY(0px) rotate(-0.5deg); }
          100% { transform: translateY(-8px) rotate(0.5deg); }
        }
        @keyframes sn-btn-shimmer {
          0%   { transform: translateX(-100%) skewX(-12deg); }
          100% { transform: translateX(200%) skewX(-12deg); }
        }
        .sn-login-input {
          transition: box-shadow 0.2s ease, border-color 0.2s ease;
        }
        .sn-login-input:focus {
          box-shadow: 0 0 0 3px rgba(23, 107, 255, 0.25), 0 0 16px rgba(23, 107, 255, 0.15);
          outline: none;
        }
        .sn-submit-btn {
          position: relative;
          overflow: hidden;
        }
        .sn-submit-btn::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 60%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent);
          transform: skewX(-12deg);
          transition: none;
        }
        .sn-submit-btn:not(:disabled):hover::after {
          animation: sn-btn-shimmer 0.6s ease forwards;
        }
        @keyframes sn-cube-frame-shift {
          from { background-position: 0% 50%; }
          to   { background-position: 100% 50%; }
        }
        .sn-cube-frame {
          padding: 3px;
          background: linear-gradient(135deg, #176BFF 0%, #00D9FF 40%, #A259FF 70%, #176BFF 100%);
          background-size: 300% 300%;
          animation: sn-cube-frame-shift 6s ease-in-out infinite;
          border-radius: 1.25rem;
        }
        .sn-cube-inner {
          border-radius: 1rem;
          overflow: hidden;
          background: #080D1B;
        }
      `}</style>

      <div className="relative isolate min-h-screen bg-[#080D1B] text-[#EAF4FF] grid grid-cols-1 lg:grid-cols-12">
        <SpaceWallpaper />

        {/* ── Left Brand Showcase ── */}
        <div className="sn-login-brand relative z-10 hidden lg:flex lg:col-span-6 overflow-hidden border-r border-[rgba(170,184,204,0.12)] p-12 flex-col justify-between">

          {/* Top bar */}
          <div className="relative z-10 flex items-center justify-end">
            <span className="text-xs font-mono-tabular text-[#00D9FF]">
              {t('Controla. Conecta. Evoluciona.')}
            </span>
          </div>

          {/* KPI Mini Cards */}
          <div className="relative z-10 mx-auto grid w-full max-w-2xl grid-cols-3 gap-2 sm:gap-3">
            <KpiCard emoji="📦" label="2.847 SKUs activos" animationDelay="0s" />
            <KpiCard emoji="✓" label="100% operativo" animationDelay="1.2s" />
            <KpiCard emoji="🔒" label="JWT Protegido" animationDelay="2.4s" />
          </div>

          {/* Center content */}
          <div className="relative z-10 my-auto max-w-md">
            {/* Cube image with gradient frame */}
            <div className="sn-cube-frame mb-8 shadow-[0_0_40px_rgba(23,107,255,0.3)]">
              <div className="sn-cube-inner">
                <img
                  src={cubeImage}
                  alt="Identidad geométrica StockNova"
                  referrerPolicy="no-referrer"
                  className="w-full h-64 object-cover"
                />
              </div>
            </div>

            {/* Letter-by-letter tagline */}
            <div ref={taglineRef}>
              <h2 className="font-display text-3xl font-bold tracking-tight text-[#EAF4FF] text-balance leading-snug">
                {taglineLetters}
              </h2>
            </div>

            <p className="mt-3 text-sm text-[#AAB8CC] leading-relaxed">
              {t('Supervisa existencias, registra ventas, audita movimientos y gestiona pedidos según tu rol asignado.')}
            </p>
          </div>

          {/* Footer */}
          <div className="relative z-10 text-xs text-[#AAB8CC]">
            {t('StockNova · Sesión protegida con JWT')}
          </div>
        </div>

        {/* ── Right Auth Form ── */}
        <div className="relative z-10 lg:col-span-6 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16">
          <div className="w-full max-w-md mx-auto">
            <div className="mb-8 flex items-center justify-between gap-3">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-xs font-medium text-[#AAB8CC] hover:text-[#EAF4FF] transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> {t('Volver a inicio')}
              </Link>
              <div className="flex items-center gap-2">
                <LanguageSelector className="shrink-0" />
                <ThemeToggle />
              </div>
            </div>

            <Link
              to="/"
              aria-label={t('StockNova Inicio')}
              className="mb-6 inline-flex rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00D9FF]"
            >
              <StockNovaLogo size={38} showWordmark />
            </Link>

            <motion.div
              initial={{ opacity: 0, x: 32, y: 8 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--text-primary,#EAF4FF)]">
                {t('Iniciar sesión')}
              </h1>
              <p className="mt-2 text-sm text-[var(--text-secondary,#AAB8CC)]">
                {t('Ingresa con las credenciales de tu cuenta.')}
              </p>

              {/* Error alert — polished */}
              {error && (
                <motion.div
                  role="alert"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="mt-5 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-xs text-rose-300 flex items-start gap-2.5"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                  <span>{error}</span>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">

                {/* Email */}
                <div>
                  <label
                    htmlFor="login-email"
                    className="block text-xs font-medium text-[var(--text-secondary,#AAB8CC)] mb-1.5"
                  >
                    {t('Correo electrónico')}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#AAB8CC] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="login-email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nombre@empresa.com"
                      className="sn-login-input w-full pl-10 pr-4 py-2.5 rounded-xl border border-[rgba(170,184,204,0.2)] bg-[var(--bg-surface-alt,#101B35)] text-sm text-[var(--text-primary,#EAF4FF)] placeholder:text-[#AAB8CC]/50 focus:border-[#176BFF]"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="login-password"
                    className="block text-xs font-medium text-[var(--text-secondary,#AAB8CC)] mb-1.5"
                  >
                    {t('Contraseña')}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#AAB8CC] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="sn-login-input w-full pl-10 pr-11 py-2.5 rounded-xl border border-[rgba(170,184,204,0.2)] bg-[var(--bg-surface-alt,#101B35)] text-sm text-[var(--text-primary,#EAF4FF)] placeholder:text-[#AAB8CC]/50 focus:border-[#176BFF]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? t('Ocultar contraseña') : t('Mostrar contraseña')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#AAB8CC] hover:text-[#EAF4FF] transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="sn-submit-btn sn-magnetic-btn w-full py-2.5 px-4 rounded-xl bg-[#176BFF] hover:bg-[#2A7BFF] disabled:opacity-60 text-sm font-semibold text-white transition-colors shadow-lg shadow-[#176BFF]/25"
                >
                  {submitting ? t('Verificando acceso...') : t('Entrar a StockNova')}
                </button>
              </form>

              <p className="mt-6 text-center text-xs text-[var(--text-secondary,#AAB8CC)]">
                {t('¿Aún no tienes cuenta?')}{' '}
                <Link to="/register" className="font-semibold text-[#00D9FF] hover:underline">
                  {t('Crear cuenta de cliente')}
                </Link>
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}
