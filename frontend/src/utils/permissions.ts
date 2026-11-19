import type { OrderStatus, UserRole } from '../types/stocknova';

export type AppModule =
  | 'dashboard'
  | 'productos'
  | 'ventas'
  | 'movimientos'
  | 'pedidos'
  | 'estadisticas'
  | 'usuarios';

export type AppAction =
  | 'products:view'
  | 'products:create'
  | 'products:edit'
  | 'products:delete'
  | 'sales:view'
  | 'sales:create'
  | 'movements:view'
  | 'movements:create'
  | 'orders:view_all'
  | 'orders:view_own'
  | 'orders:create'
  | 'orders:update_status'
  | 'stats:view'
  | 'users:view'
  | 'users:manage_roles';

const ROLE_MODULES: Record<UserRole, AppModule[]> = {
  ADMINISTRADOR: [
    'dashboard',
    'productos',
    'ventas',
    'movimientos',
    'pedidos',
    'estadisticas',
    'usuarios',
  ],
  EMPLEADO: ['dashboard', 'productos', 'ventas', 'movimientos', 'pedidos'],
  CLIENTE: ['dashboard', 'productos', 'pedidos'],
};

const ROLE_ACTIONS: Record<UserRole, Set<AppAction>> = {
  ADMINISTRADOR: new Set<AppAction>([
    'products:view',
    'products:create',
    'products:edit',
    'products:delete',
    'sales:view',
    'sales:create',
    'movements:view',
    'movements:create',
    'orders:view_all',
    'orders:view_own',
    'orders:create',
    'orders:update_status',
    'stats:view',
    'users:view',
    'users:manage_roles',
  ]),
  EMPLEADO: new Set<AppAction>([
    'products:view',
    'products:create',
    'products:edit',
    'sales:view',
    'sales:create',
    'movements:view',
    'movements:create',
    'orders:view_all',
    'orders:view_own',
    'orders:update_status',
  ]),
  CLIENTE: new Set<AppAction>([
    'products:view',
    'orders:view_own',
    'orders:create',
  ]),
};

export function canAccessModule(role: UserRole | undefined | null, mod: AppModule): boolean {
  if (!role) return false;
  return ROLE_MODULES[role]?.includes(mod) ?? false;
}

export function canPerformAction(role: UserRole | undefined | null, action: AppAction): boolean {
  if (!role) return false;
  return ROLE_ACTIONS[role]?.has(action) ?? false;
}

export function getAllowedOrderTransitions(
  role: UserRole,
  currentStatus: OrderStatus
): OrderStatus[] {
  if (currentStatus !== 'PENDIENTE') return [];
  if (role === 'CLIENTE') return ['CANCELADO'];
  if (role === 'EMPLEADO' || role === 'ADMINISTRADOR') return ['CONFIRMADO', 'RECHAZADO'];
  return [];
}

export function getDefaultRouteForRole(role: UserRole): string {
  if (role === 'CLIENTE') return '/app/pedidos';
  return '/app';
}

export function getRoleDisplayLabel(role: UserRole): string {
  switch (role) {
    case 'ADMINISTRADOR':
      return 'Administrador';
    case 'EMPLEADO':
      return 'Empleado';
    case 'CLIENTE':
      return 'Cliente';
  }
}
