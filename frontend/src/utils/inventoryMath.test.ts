import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyMovementDelta,
  calculateSaleItemsTotal,
  computeInventoryValuation,
  formatCOP,
  getStockHealth,
  rankTopSellingProducts,
} from './inventoryMath';
import type { Product, Sale } from '../types/stocknova';

test('getStockHealth classifies OPTIMO, BAJO, and AGOTADO accurately', () => {
  assert.equal(getStockHealth(0, 5), 'AGOTADO');
  assert.equal(getStockHealth(5, 5), 'BAJO');
  assert.equal(getStockHealth(3, 5), 'BAJO');
  assert.equal(getStockHealth(12, 5), 'OPTIMO');
});

test('applyMovementDelta handles ENTRADA, SALIDA, and AJUSTE safely', () => {
  assert.deepEqual(applyMovementDelta(10, 'ENTRADA', 5), { newStock: 15, valid: true });
  assert.deepEqual(applyMovementDelta(10, 'SALIDA', 4), { newStock: 6, valid: true });
  assert.equal(applyMovementDelta(3, 'SALIDA', 5).valid, false);
  assert.deepEqual(applyMovementDelta(10, 'AJUSTE', 18), { newStock: 18, valid: true });
});

test('calculateSaleItemsTotal rounds cleanly to two decimals', () => {
  const total = calculateSaleItemsTotal([
    { quantity: 2, unitPrice: 19.99 },
    { quantity: 1, unitPrice: 5.5 },
  ]);
  assert.equal(total, 45.48);
});

test('computeInventoryValuation calculates totals and low/out counts', () => {
  const sample: Product[] = [
    {
      id: '1', sku: 'A1', name: 'A', category: 'Cat',
      price: 100, stock: 10, supplier: 'S', available: true,
    },
    {
      id: '2', sku: 'A2', name: 'B', category: 'Cat',
      price: 50, stock: 2, supplier: 'S', available: true,
    },
    {
      id: '3', sku: 'A3', name: 'C', category: 'Cat',
      price: 40, stock: 0, supplier: 'S', available: true,
    },
  ];
  const val = computeInventoryValuation(sample);
  assert.equal(val.retailValue, 1100);
  assert.equal(val.totalUnits, 12);
  assert.equal(val.lowStockCount, 1);
  assert.equal(val.outOfStockCount, 1);
});

test('rankTopSellingProducts aggregates across sales and sorts descending', () => {
  const sales: Sale[] = [
    {
      id: 's1', code: 'V-01', sellerId: 'u1',
      total: 300, createdAt: '2026-11-10T10:00:00Z',
      items: [
        { productId: 'p1', productName: 'Prod 1', sku: 'S1', quantity: 2, unitPrice: 100, subtotal: 200 },
        { productId: 'p2', productName: 'Prod 2', sku: 'S2', quantity: 2, unitPrice: 50, subtotal: 100 },
      ],
    },
    {
      id: 's2', code: 'V-02', sellerId: 'u1',
      total: 250, createdAt: '2026-11-11T10:00:00Z',
      items: [
        { productId: 'p2', productName: 'Prod 2', sku: 'S2', quantity: 5, unitPrice: 50, subtotal: 250 },
      ],
    },
  ];
  const ranked = rankTopSellingProducts(sales, 2);
  assert.equal(ranked[0].productId, 'p2');
  assert.equal(ranked[0].revenue, 350);
  assert.equal(ranked[0].unitsSold, 7);
});

test('formatCOP uses Colombian pesos without decimal cents', () => {
  const formatted = formatCOP(150000);
  assert.match(formatted, /150\.000/);
  assert.doesNotMatch(formatted, /USD/);
});
