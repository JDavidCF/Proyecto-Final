export type UserRole = 'ADMINISTRADOR' | 'EMPLEADO' | 'CLIENTE';

export type OrderStatus =
  | 'PENDIENTE'
  | 'CONFIRMADO'
  | 'RECHAZADO'
  | 'CANCELADO';

export type MovementType = 'ENTRADA' | 'SALIDA' | 'AJUSTE';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  supplier: string;
  available: boolean;
}

export interface SaleItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Sale {
  id: string;
  code: string;
  sellerId: string;
  items: SaleItem[];
  total: number;
  createdAt: string;
}

export interface InventoryMovement {
  id: string;
  productId: string;
  productName: string;
  type: MovementType;
  quantity: number;
  previousStock: number;
  newStock: number;
  userId: string;
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  code: string;
  clientId: string;
  status: OrderStatus;
  items: OrderItem[];
  total: number;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
}

export interface StatsSummary {
  totalRetailValue: number;
  totalUnits: number;
  totalProducts: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalRevenue: number;
  salesCount: number;
  pendingOrdersCount: number;
  revenueByDate: Array<{ date: string; revenue: number; orders: number }>;
  topProducts: Array<{ productId: string; name: string; sku: string; unitsSold: number; revenue: number }>;
  categoryDistribution: Array<{ category: string; value: number; count: number }>;
  lowStockProducts: Product[];
}
