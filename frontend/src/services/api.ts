import axios from 'axios';
import type { InventoryMovement, MovementType, NotificationItem, Order, OrderStatus, Product, Sale, StatsSummary, User, UserRole } from '../types/stocknova';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
const TOKEN_STORAGE_KEY = 'stocknova_jwt_token';
export const apiClient = axios.create({ baseURL: API_BASE_URL, headers: { 'Content-Type': 'application/json' }, timeout: 15000 });
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
export function setStoredToken(token: string | null) { token ? localStorage.setItem(TOKEN_STORAGE_KEY, token) : localStorage.removeItem(TOKEN_STORAGE_KEY); }
export function getStoredToken() { return localStorage.getItem(TOKEN_STORAGE_KEY); }
export function extractApiError(err: unknown, fallback = 'Ocurrió un error inesperado.'): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { detail?: unknown; message?: string } | undefined;
    if (typeof data?.detail === 'string') return data.detail;
    if (Array.isArray(data?.detail)) {
      const messages = data.detail
        .map((item: unknown) => {
          if (typeof item !== 'object' || item === null || !('msg' in item)) return null;
          return typeof item.msg === 'string' ? item.msg : null;
        })
        .filter((message): message is string => Boolean(message));
      if (messages.length) return messages.join('. ');
    }
    if (data?.message) return data.message;
    if (err.code === 'ERR_NETWORK') return 'No se pudo conectar con FastAPI. Verifica que el backend esté ejecutándose.';
  }
  return err instanceof Error ? err.message : fallback;
}

interface UserDto { id: number; nombre: string; email: string; rol: string; activo: boolean }
interface ProductDto { id: number; codigo: string; nombre: string; categoria: string; precio: number; stock: number; marca: string; disponible: boolean }
interface SaleDto { id: number; producto_id: number; usuario_id: number; cantidad: number; precio_unitario: number; total: number; fecha: string }
interface MovementDto { id: number; producto_id: number; usuario_id: number; tipo: string; cantidad: number; stock_anterior: number; stock_nuevo: number; fecha: string }
interface OrderDetailDto { producto_id: number; nombre_producto: string; cantidad: number; precio_unitario: number }
interface OrderDto { id: number; usuario_id: number; fecha: string; estado: string; total: number; detalles: OrderDetailDto[] }
interface ProductPayload { sku: string; name: string; category: string; price: number; stock: number; supplier: string; available: boolean }

const roleFromApi = (role: string): UserRole => {
  const normalized = role.toUpperCase();
  if (normalized === 'ADMINISTRADOR' || normalized === 'EMPLEADO' || normalized === 'CLIENTE') return normalized;
  throw new Error(`El backend devolvió un rol no reconocido: ${role}`);
};
const roleToApi = (role: UserRole) => role.toLowerCase();
const mapUser = (u: UserDto): User => ({ id: String(u.id), name: u.nombre, email: u.email, role: roleFromApi(u.rol), active: u.activo });
const mapProduct = (p: ProductDto): Product => ({ id: String(p.id), sku: p.codigo, name: p.nombre, category: p.categoria, price: Number(p.precio), stock: p.stock, supplier: p.marca, available: p.disponible });
const mapSale = (s: SaleDto, product?: Product): Sale => ({
  id: String(s.id),
  code: `V-${String(s.id).padStart(5, '0')}`,
  sellerId: String(s.usuario_id),
  items: [{ productId: String(s.producto_id), productName: product?.name ?? `Producto #${s.producto_id}`, sku: product?.sku ?? '', quantity: s.cantidad, unitPrice: Number(s.precio_unitario), subtotal: Number(s.total) }],
  total: Number(s.total),
  createdAt: s.fecha,
});
const mapMovement = (m: MovementDto, product?: Product): InventoryMovement => ({
  id: String(m.id),
  productId: String(m.producto_id),
  productName: product?.name ?? `Producto #${m.producto_id}`,
  type: (() => {
    const type = m.tipo.toUpperCase();
    if (type !== 'ENTRADA' && type !== 'SALIDA' && type !== 'AJUSTE') {
      throw new Error(`El backend devolvió un movimiento no reconocido: ${m.tipo}`);
    }
    return type;
  })(),
  quantity: m.cantidad,
  previousStock: m.stock_anterior,
  newStock: m.stock_nuevo,
  userId: String(m.usuario_id),
  createdAt: m.fecha,
});
const mapOrder = (o: OrderDto): Order => {
  const status = o.estado.toLowerCase();
  if (status !== 'pendiente' && status !== 'confirmado' && status !== 'rechazado') {
    throw new Error(`El backend devolvió un estado de pedido no reconocido: ${o.estado}`);
  }
  return {
    id: String(o.id),
    code: `PED-${String(o.id).padStart(5, '0')}`,
    clientId: String(o.usuario_id),
    status: status === 'pendiente' ? 'PENDIENTE' : status === 'confirmado' ? 'CONFIRMADO' : 'RECHAZADO',
    items: o.detalles.map((d) => ({ productId: String(d.producto_id), productName: d.nombre_producto, quantity: d.cantidad, unitPrice: Number(d.precio_unitario) })),
    total: Number(o.total),
    createdAt: o.fecha,
  };
};
const toProductDto = (payload: ProductPayload) => ({
  codigo: payload.sku,
  nombre: payload.name,
  categoria: payload.category,
  precio: payload.price,
  stock: payload.stock,
  marca: payload.supplier,
  disponible: payload.available,
});

export const authService = {
  async login(email: string, password: string) {
    const { data } = await apiClient.post('/usuarios/login', { email, password });
    setStoredToken(data.access_token);
    try {
      const profile = await apiClient.get('/usuarios/me');
      return { access_token: data.access_token, token_type: data.token_type, user: mapUser(profile.data) };
    } catch (error) {
      setStoredToken(null);
      throw error;
    }
  },
  async register(name: string, email: string, password: string) {
    await apiClient.post('/usuarios/registro', { nombre: name, email, password });
    return this.login(email, password);
  },
  async me(): Promise<User> { const { data } = await apiClient.get('/usuarios/me'); return mapUser(data); },
};
export const notificationsService = {
  async list(): Promise<NotificationItem[]> {
    const products = await productsService.list();
    return products
      .filter(product => product.stock <= 5)
      .map(product => ({
        id: `stock-${product.id}`,
        title: product.stock === 0 ? 'Producto agotado' : 'Stock bajo',
        message: `${product.name}: quedan ${product.stock} unidades en inventario.`,
        severity: product.stock === 0 ? 'critical' : 'warning',
      }));
  },
};
export const productsService = {
  async list(): Promise<Product[]> { const { data } = await apiClient.get<ProductDto[]>('/productos/'); return data.map(mapProduct); },
  async search(filters: { nombre?: string; categoria?: string; disponible?: boolean } = {}): Promise<Product[]> {
    const { data } = await apiClient.get<ProductDto[]>('/productos/buscar', { params: filters });
    return data.map(mapProduct);
  },
  async get(id: string): Promise<Product> { const { data } = await apiClient.get<ProductDto>(`/productos/${id}`); return mapProduct(data); },
  async create(payload: ProductPayload): Promise<Product> { const { data } = await apiClient.post<ProductDto>('/productos/', toProductDto(payload)); return mapProduct(data); },
  async update(id: string, payload: ProductPayload): Promise<Product> { const { data } = await apiClient.put<ProductDto>(`/productos/${id}`, toProductDto(payload)); return mapProduct(data); },
  async remove(id: string) { await apiClient.delete(`/productos/${id}`); },
};
export const salesService = {
  async list(): Promise<Sale[]> { const [{ data }, products] = await Promise.all([apiClient.get<SaleDto[]>('/ventas/'), productsService.list()]); return data.map((s) => mapSale(s, products.find(p => p.id === String(s.producto_id)))); },
  async get(id: string): Promise<Sale> {
    const [{ data }, products] = await Promise.all([apiClient.get<SaleDto>(`/ventas/${id}`), productsService.list()]);
    return mapSale(data, products.find(p => p.id === String(data.producto_id)));
  },
  async create(payload: { productId: string; quantity: number }): Promise<Sale> {
    const [{ data }, product] = await Promise.all([
      apiClient.post<SaleDto>('/ventas/', { producto_id: Number(payload.productId), cantidad: payload.quantity }),
      productsService.get(payload.productId),
    ]);
    return mapSale(data, product);
  },
};
export const movementsService = {
  async list(): Promise<InventoryMovement[]> { const [{ data }, products] = await Promise.all([apiClient.get<MovementDto[]>('/movimientos/'), productsService.list()]); return data.map((m) => mapMovement(m, products.find(p => p.id === String(m.producto_id)))); },
  async byProduct(productId: string): Promise<InventoryMovement[]> {
    const [{ data }, product] = await Promise.all([apiClient.get<MovementDto[]>(`/movimientos/producto/${productId}`), productsService.get(productId)]);
    return data.map((m) => mapMovement(m, product));
  },
  async byUser(userId: string): Promise<InventoryMovement[]> {
    const [{ data }, products] = await Promise.all([apiClient.get<MovementDto[]>(`/movimientos/usuario/${userId}`), productsService.list()]);
    return data.map((m) => mapMovement(m, products.find(p => p.id === String(m.producto_id))));
  },
  async create(payload: { productId: string; type: MovementType; quantity: number }): Promise<InventoryMovement> {
    const product = await productsService.get(payload.productId);
    let data;
    if (payload.type === 'ENTRADA') ({ data } = await apiClient.post('/movimientos/entrada', { producto_id: Number(payload.productId), cantidad: payload.quantity }));
    else if (payload.type === 'AJUSTE') ({ data } = await apiClient.post('/movimientos/ajuste', { producto_id: Number(payload.productId), stock_nuevo: payload.quantity }));
    else throw new Error('Las salidas de inventario se registran automáticamente al realizar una venta.');
    return mapMovement(data as MovementDto, product);
  },
};
export const ordersService = {
  async list(role: UserRole): Promise<Order[]> { const { data } = await apiClient.get<OrderDto[]>(role === 'CLIENTE' ? '/pedidos/mis-pedidos' : '/pedidos/'); return data.map(mapOrder); },
  async get(id: string): Promise<Order> { const { data } = await apiClient.get<OrderDto>(`/pedidos/${id}`); return mapOrder(data); },
  async create(payload: { items: Array<{ productId: string; quantity: number }> }): Promise<Order> { const { data } = await apiClient.post<OrderDto>('/pedidos/', { detalles: payload.items.map(i => ({ producto_id: Number(i.productId), cantidad: i.quantity })) }); return mapOrder(data); },
  async updateStatus(id: string, status: OrderStatus, role: UserRole): Promise<Order> {
    const action = status === 'CONFIRMADO' ? 'confirmar' : status === 'RECHAZADO' ? 'rechazar' : status === 'CANCELADO' && role === 'CLIENTE' ? 'cancelar' : null;
    if (!action) throw new Error('El backend permite confirmar o rechazar pedidos pendientes.');
    const { data } = await apiClient.patch(`/pedidos/${id}/${action}`); return mapOrder(data.pedido || data); },
};
export const statsService = {
  async summary(): Promise<StatsSummary> {
    const [summary, top, dates, low, products] = await Promise.all([
      apiClient.get('/estadisticas/resumen'),
      apiClient.get('/estadisticas/productos-mas-vendidos'),
      apiClient.get('/estadisticas/ingresos-por-fecha'),
      apiClient.get<Array<{ producto_id: number; stock: number }>>('/estadisticas/productos-stock-bajo'),
      productsService.list(),
    ]);
    const p = summary.data;
    const lowStockIds = new Set(low.data.filter(item => item.stock <= 5).map(item => String(item.producto_id)));
    const lowProducts = products.filter(product => product.stock === 0 || lowStockIds.has(product.id));
    const pendingOrders = await apiClient.get<OrderDto[]>('/pedidos/');
    const categoryTotals = products.reduce((acc: Record<string, { value: number; count: number }>, product) => {
      const current = acc[product.category] || { value: 0, count: 0 };
      current.value += product.stock * product.price;
      current.count += 1;
      acc[product.category] = current;
      return acc;
    }, {});
    return {
      totalRetailValue: products.reduce((sum, product) => sum + product.stock * product.price, 0),
      totalUnits: products.reduce((sum, product) => sum + product.stock, 0),
      totalProducts: p.total_productos,
      lowStockCount: p.productos_stock_bajo,
      outOfStockCount: p.productos_agotados,
      totalRevenue: Number(p.ingresos_totales),
      salesCount: p.total_ventas,
      pendingOrdersCount: pendingOrders.data.filter(order => order.estado.toLowerCase() === 'pendiente').length,
      revenueByDate: dates.data.map((item: { fecha: string; ingresos: number }) => ({ date: item.fecha, revenue: Number(item.ingresos), orders: 0 })).reverse(),
      topProducts: top.data.map((item: { producto_id: number; nombre: string; unidades_vendidas: number; ingresos_generados: number }) => ({
        productId: String(item.producto_id),
        name: item.nombre,
        sku: products.find(product => product.id === String(item.producto_id))?.sku ?? '',
        unitsSold: item.unidades_vendidas,
        revenue: Number(item.ingresos_generados),
      })),
      categoryDistribution: Object.entries(categoryTotals).map(([category, totals]) => ({ category, value: totals.value, count: totals.count })),
      lowStockProducts: lowProducts,
    };
  },
};
export const usersService = {
  async list(): Promise<User[]> { const { data } = await apiClient.get('/usuarios/'); return data.map(mapUser); },
  async updateRole(id: string, role: UserRole): Promise<User> { const current = (await this.list()).find(u => u.id === id); const { data } = await apiClient.patch(`/usuarios/${id}/rol`, { rol: roleToApi(role), activo: current?.active ?? true }); return mapUser(data); },
  async updateStatus(id: string, active: boolean): Promise<User> { const current = (await this.list()).find(u => u.id === id); if (!current) throw new Error('Usuario no encontrado'); const { data } = await apiClient.patch(`/usuarios/${id}/rol`, { rol: roleToApi(current.role), activo: active }); return mapUser(data); },
};

export type AssistantLanguage =
  | 'es-CO'
  | 'en'
  | 'ru'
  | 'it'
  | 'fr'
  | 'pt-BR'
  | 'zh-CN'
  | 'ja'
  | 'la'
  | 'de'
  | 'ar'
  | 'ko'
  | 'hi';

export type AssistantSection =
  | 'general'
  | 'dashboard'
  | 'products'
  | 'sales'
  | 'movements'
  | 'orders'
  | 'statistics'
  | 'users';

export const assistantService = {
  async ask(payload: {
    message: string;
    language: AssistantLanguage;
    section: AssistantSection;
  }): Promise<{ answer: string }> {
    const { data } = await apiClient.post<{ answer: string }>('/asistente/consulta', payload);
    return data;
  },
  async askPublic(payload: {
    message: string;
    language: AssistantLanguage;
    section: AssistantSection;
  }): Promise<{ answer: string }> {
    const { data } = await apiClient.post<{ answer: string }>(
      '/asistente/consulta-publica',
      payload
    );
    return data;
  },
};
