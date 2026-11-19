import React, { useCallback, useEffect, useState } from 'react';
import { Shield, UserCheck, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { extractApiError, usersService } from '../services/api';
import type { User, UserRole } from '../types/stocknova';
import { AnimatedSelect } from '../components/planes/AnimatedSelect';
import { useLanguage } from '../context/LanguageContext';

export default function UsuariosPage() {
  const { user: currentUser } = useAuth();
  const { t } = useLanguage();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const list = await usersService.list();
      setUsers(list);
    } catch (err) {
      setError(extractApiError(err, t('No se pudo cargar el directorio de usuarios.')));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleRoleChange = async (userId: string, role: UserRole) => {
    setBusyId(userId);
    setError('');
    try {
      const updated = await usersService.updateRole(userId, role);
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
    } catch (err) {
      setError(extractApiError(err, t('No se pudo actualizar el rol del usuario.')));
    } finally {
      setBusyId(null);
    }
  };

  const handleToggleActive = async (target: User) => {
    setBusyId(target.id);
    setError('');
    try {
      const updated = await usersService.updateStatus(target.id, !target.active);
      setUsers((prev) => prev.map((u) => (u.id === target.id ? updated : u)));
    } catch (err) {
      setError(extractApiError(err, t('No se pudo actualizar el estado de la cuenta.')));
    } finally {
      setBusyId(null);
    }
  };

  const adminsCount = users.filter((u) => u.role === 'ADMINISTRADOR').length;
  const staffCount = users.filter((u) => u.role === 'EMPLEADO').length;
  const clientsCount = users.filter((u) => u.role === 'CLIENTE').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#EAF4FF]">
          {t('Administración de usuarios y roles')}
        </h1>
        <p className="text-sm text-[#AAB8CC] mt-1">
          {t('Control de acceso RBAC validado en servidor para administradores, empleados y clientes')}
        </p>
      </div>

      {/* Role KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-[rgba(170,184,204,0.14)] bg-[#101B35]/85 p-5 flex items-center justify-between">
          <div>
            <div className="text-xs text-[#AAB8CC]">{t('Administradores')}</div>
            <div className="mt-1 text-2xl font-bold font-mono-tabular text-[#EAF4FF]">{adminsCount}</div>
          </div>
          <Shield className="w-5 h-5 text-[#00D9FF]" />
        </div>

        <div className="rounded-2xl border border-[rgba(170,184,204,0.14)] bg-[#101B35]/85 p-5 flex items-center justify-between">
          <div>
            <div className="text-xs text-[#AAB8CC]">{t('Empleados operativos')}</div>
            <div className="mt-1 text-2xl font-bold font-mono-tabular text-[#EAF4FF]">{staffCount}</div>
          </div>
          <UserCheck className="w-5 h-5 text-[#176BFF]" />
        </div>

        <div className="rounded-2xl border border-[rgba(170,184,204,0.14)] bg-[#101B35]/85 p-5 flex items-center justify-between">
          <div>
            <div className="text-xs text-[#AAB8CC]">{t('Clientes registrados')}</div>
            <div className="mt-1 text-2xl font-bold font-mono-tabular text-[#EAF4FF]">{clientsCount}</div>
          </div>
          <Users className="w-5 h-5 text-emerald-400" />
        </div>
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-16 rounded-xl bg-[#101B35] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-[rgba(170,184,204,0.14)] bg-[#101B35]/80 overflow-visible">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[rgba(170,184,204,0.12)] bg-[#080D1B]/60 text-xs text-[#AAB8CC]">
                  <th className="py-3.5 px-4 font-medium">{t('Usuario')}</th>
                  <th className="py-3.5 px-4 font-medium">{t('Rol asignado')}</th>
                  <th className="py-3.5 px-4 font-medium">{t('Estado')}</th>
                  <th className="py-3.5 px-4 font-medium text-right">{t('Acción')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(170,184,204,0.08)]">
                {users.map((u) => {
                  const isSelf = u.id === currentUser?.id;
                  return (
                    <tr key={u.id} className="hover:bg-[#EAF4FF]/[0.025]">
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-[#EAF4FF]">
                          {u.name} {isSelf && <span className="text-xs text-[#00D9FF]">({t('Tú')})</span>}
                        </div>
                        <div className="text-xs text-[#AAB8CC] font-mono-tabular">{u.email}</div>
                      </td>
                      <td className="py-3.5 px-4 min-w-[200px]">
                        <AnimatedSelect
                          ariaLabel={`Rol de ${u.name}`}
                          value={u.role}
                          disabled={isSelf || busyId === u.id}
                          onChange={(val) => handleRoleChange(u.id, val as UserRole)}
                          options={[
                            { value: 'ADMINISTRADOR', label: t('Administrador') },
                            { value: 'EMPLEADO', label: t('Empleado') },
                            { value: 'CLIENTE', label: t('Cliente') },
                          ]}
                        />
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`text-xs font-semibold ${
                            u.active ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {u.active ? t('Activo') : t('Suspendido')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          disabled={isSelf || busyId === u.id}
                          onClick={() => handleToggleActive(u)}
                          className="px-3 py-1.5 rounded-lg border border-[rgba(170,184,204,0.2)] text-xs font-medium text-[#EAF4FF] hover:border-[#176BFF] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          {u.active ? t('Desactivar') : t('Reactivar')}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
