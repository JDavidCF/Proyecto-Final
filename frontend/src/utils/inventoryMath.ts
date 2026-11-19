import type { MovementType, Product, Sale, SaleItem } from '../types/stocknova';

export type StockHealth = 'OPTIMO' | 'BAJO' | 'AGOTADO';
export const LOW_STOCK_THRESHOLD = 5;

export function getStockHealth(stock: number, threshold = LOW_STOCK_THRESHOLD): StockHealth {
  if (stock <= 0) return 'AGOTADO';
  if (stock <= threshold) return 'BAJO';
  return 'OPTIMO';
}

export function applyMovementDelta(
  currentStock: number,
  type: MovementType,
  quantity: number
): { newStock: number; valid: boolean; error?: string } {
  if (!Number.isFinite(quantity) || quantity < 0) {
    return { newStock: currentStock, valid: false, error: 'La cantidad debe ser un número positivo.' };
  }

  if (type === 'ENTRADA') {
    if (quantity === 0) {
      return { newStock: currentStock, valid: false, error: 'La entrada debe ser mayor a cero.' };
    }
    return { newStock: currentStock + quantity, valid: true };
  }

  if (type === 'SALIDA') {
    if (quantity === 0) {
      return { newStock: currentStock, valid: false, error: 'La salida debe ser mayor a cero.' };
    }
    if (currentStock - quantity < 0) {
      return { newStock: currentStock, valid: false, error: 'Stock insuficiente para registrar la salida.' };
    }
    return { newStock: currentStock - quantity, valid: true };
  }

  // AJUSTE sets exact counted stock quantity
  return { newStock: quantity, valid: true };
}

export function calculateSaleItemsTotal(items: Array<Pick<SaleItem, 'quantity' | 'unitPrice'>>): number {
  const sum = items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
  return Math.round(sum * 100) / 100;
}

export function computeInventoryValuation(products: Product[]): {
  retailValue: number;
  totalUnits: number;
  lowStockCount: number;
  outOfStockCount: number;
} {
  let retailValue = 0;
  let totalUnits = 0;
  let lowStockCount = 0;
  let outOfStockCount = 0;

  for (const p of products) {
    const qty = Math.max(0, p.stock);
    retailValue += qty * p.price;
    totalUnits += qty;
    const health = getStockHealth(p.stock);
    if (health === 'AGOTADO') outOfStockCount += 1;
    else if (health === 'BAJO') lowStockCount += 1;
  }

  return {
    retailValue: Math.round(retailValue * 100) / 100,
    totalUnits,
    lowStockCount,
    outOfStockCount,
  };
}

export function rankTopSellingProducts(
  sales: Sale[],
  limit = 5
): Array<{ productId: string; name: string; sku: string; unitsSold: number; revenue: number }> {
  const map = new Map<
    string,
    { productId: string; name: string; sku: string; unitsSold: number; revenue: number }
  >();

  for (const sale of sales) {
    for (const item of sale.items) {
      const existing = map.get(item.productId);
      if (existing) {
        existing.unitsSold += item.quantity;
        existing.revenue = Math.round((existing.revenue + item.subtotal) * 100) / 100;
      } else {
        map.set(item.productId, {
          productId: item.productId,
          name: item.productName,
          sku: item.sku,
          unitsSold: item.quantity,
          revenue: Math.round(item.subtotal * 100) / 100,
        });
      }
    }
  }

  return Array.from(map.values())
    .sort((a, b) => b.revenue - a.revenue || b.unitsSold - a.unitsSold)
    .slice(0, limit);
}

export function formatCOP(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

