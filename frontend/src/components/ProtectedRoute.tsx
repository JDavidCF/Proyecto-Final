import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { canAccessModule, getDefaultRouteForRole, type AppModule } from '../utils/permissions';
import { useLanguage } from '../context/LanguageContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredModule?: AppModule;
}

export function ProtectedRoute({ children, requiredModule }: ProtectedRouteProps) {
  const { user, loading, isAuthenticated, authError, refreshUser } = useAuth();
  const { t } = useLanguage();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080D1B] flex items-center justify-center text-sm text-[#AAB8CC]">
        {t('Verificando sesión...')}
      </div>
    );
  }

  if (authError) {
    return (
      <div className="min-h-screen bg-[#080D1B] flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p role="alert" className="max-w-md text-sm text-rose-300">{authError}</p>
        <button
          type="button"
          onClick={() => void refreshUser()}
          className="rounded-xl bg-[#176BFF] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2A7BFF]"
        >
          {t('Reintentar')}
        </button>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredModule && !canAccessModule(user.role, requiredModule)) {
    return <Navigate to={getDefaultRouteForRole(user.role)} replace />;
  }

  return <>{children}</>;
}
