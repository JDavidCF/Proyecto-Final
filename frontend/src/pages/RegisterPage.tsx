import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { extractApiError } from '../services/api';
import { getDefaultRouteForRole } from '../utils/permissions';
import { StockNovaLogo } from '../components/StockNovaLogo';
import { SpaceWallpaper } from '../components/SpaceWallpaper';
import { SmoothStaggerText } from '../components/planes/SmoothStaggerText';
import { LanguageSelector } from '../components/LanguageSelector';
import warehouseImage from '../assets/images/stocknova_warehouse_architecture_1794533550689.jpg';
import { useLanguage } from '../context/LanguageContext';
import { ThemeToggle } from '../components/ThemeToggle';

export default function RegisterPage() {
  const { register } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (name.trim().length < 2) {
      setError(t('Ingresa tu nombre completo o razón social.'));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError(t('Ingresa un correo electrónico válido.'));
      return;
    }
    if (password.length < 8) {
      setError(t('La contraseña debe tener al menos 8 caracteres.'));
      return;
    }
    if (password !== confirmPassword) {
      setError(t('Las contraseñas no coinciden.'));
      return;
    }

    setSubmitting(true);
    try {
      const user = await register(name.trim(), email.trim(), password);
      navigate(getDefaultRouteForRole(user.role), { replace: true });
    } catch (err) {
      setError(extractApiError(err, t('No fue posible completar el registro.')));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative isolate min-h-screen bg-[#080D1B] text-[#EAF4FF] grid grid-cols-1 lg:grid-cols-12">
      <SpaceWallpaper />
      <div className="sn-register-brand relative z-10 hidden lg:flex lg:col-span-6 overflow-hidden border-r border-[rgba(170,184,204,0.12)] p-12 flex-col justify-between">
        <div className="flex items-center justify-between">
          <Link to="/" aria-label={t('Volver a inicio')}>
            <StockNovaLogo size={32} showWordmark />
          </Link>
          <span className="text-xs font-mono-tabular text-[#00D9FF]">
            {t('Portal de Clientes B2B')}
          </span>
        </div>

        <div className="my-auto max-w-md">
          <div className="rounded-2xl overflow-hidden border border-[rgba(170,184,204,0.16)] bg-[#080D1B] mb-8">
            <img
              src={warehouseImage}
              alt={t('Centro de distribución StockNova')}
              referrerPolicy="no-referrer"
              className="w-full h-64 object-cover"
            />
          </div>
          <SmoothStaggerText
            as="h2"
            text={t('Consulta catálogo y realiza pedidos con trazabilidad total.')}
            highlightWords={['catálogo', 'pedidos']}
            className="font-display text-3xl font-bold tracking-tight text-[#EAF4FF] text-balance"
          />
          <p className="mt-3 text-sm text-[#AAB8CC] leading-relaxed">
            {t('Las cuentas nuevas se registran con perfil Cliente para consultar existencias reales y gestionar solicitudes de despacho.')}
          </p>
        </div>

        <div className="text-xs text-[#AAB8CC]">
          {t('StockNova · Registro seguro')}
        </div>
      </div>

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

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#EAF4FF]">
              {t('Crear cuenta')}
            </h1>
            <p className="mt-2 text-sm text-[#AAB8CC]">
              {t('Completa tus datos para acceder al catálogo y gestionar tus pedidos.')}
            </p>

            {error && (
              <div
                role="alert"
                className="mt-5 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-xs text-rose-200"
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
              <div>
                <label htmlFor="reg-name" className="block text-xs font-medium text-[#AAB8CC] mb-1.5">
                  {t('Nombre completo o empresa')}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#AAB8CC] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="reg-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Andes Tech Ingeniería"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[rgba(170,184,204,0.2)] bg-[#101B35]/70 text-sm text-[#EAF4FF] placeholder:text-[#AAB8CC]/50 focus:outline-none focus:border-[#176BFF] focus:ring-1 focus:ring-[#176BFF]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="reg-email" className="block text-xs font-medium text-[#AAB8CC] mb-1.5">
                  {t('Correo electrónico')}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#AAB8CC] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="reg-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="compras@empresa.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[rgba(170,184,204,0.2)] bg-[#101B35]/70 text-sm text-[#EAF4FF] placeholder:text-[#AAB8CC]/50 focus:outline-none focus:border-[#176BFF] focus:ring-1 focus:ring-[#176BFF]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="reg-password" className="block text-xs font-medium text-[#AAB8CC] mb-1.5">
                  {t('Contraseña (mín. 8 caracteres)')}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#AAB8CC] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-[rgba(170,184,204,0.2)] bg-[#101B35]/70 text-sm text-[#EAF4FF] placeholder:text-[#AAB8CC]/50 focus:outline-none focus:border-[#176BFF] focus:ring-1 focus:ring-[#176BFF]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? t('Ocultar contraseña') : t('Mostrar contraseña')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#AAB8CC] hover:text-[#EAF4FF]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="reg-confirm" className="block text-xs font-medium text-[#AAB8CC] mb-1.5">
                  {t('Confirmar contraseña')}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#AAB8CC] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="reg-confirm"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[rgba(170,184,204,0.2)] bg-[#101B35]/70 text-sm text-[#EAF4FF] placeholder:text-[#AAB8CC]/50 focus:outline-none focus:border-[#176BFF] focus:ring-1 focus:ring-[#176BFF]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 px-4 rounded-xl bg-[#176BFF] hover:bg-[#2A7BFF] disabled:opacity-60 text-sm font-semibold text-[#EAF4FF] transition-colors shadow-lg shadow-[#176BFF]/20"
              >
                {submitting ? t('Registrando cuenta...') : t('Crear cuenta y entrar')}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-[#AAB8CC]">
              {t('¿Ya tienes cuenta?')}{' '}
              <Link to="/login" className="font-semibold text-[#00D9FF] hover:underline">
                {t('Iniciar sesión')}
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
