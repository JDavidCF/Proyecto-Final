import test from 'node:test';
import assert from 'node:assert/strict';
import {
  canAccessModule,
  canPerformAction,
  getAllowedOrderTransitions,
} from './permissions';

test('ADMINISTRADOR has full access to all modules and actions', () => {
  assert.equal(canAccessModule('ADMINISTRADOR', 'estadisticas'), true);
  assert.equal(canAccessModule('ADMINISTRADOR', 'usuarios'), true);
  assert.equal(canPerformAction('ADMINISTRADOR', 'products:delete'), true);
  assert.equal(canPerformAction('ADMINISTRADOR', 'users:manage_roles'), true);
});

test('EMPLEADO cannot access estadisticas or usuarios modules', () => {
  assert.equal(canAccessModule('EMPLEADO', 'productos'), true);
  assert.equal(canAccessModule('EMPLEADO', 'ventas'), true);
  assert.equal(canAccessModule('EMPLEADO', 'movimientos'), true);
  assert.equal(canAccessModule('EMPLEADO', 'pedidos'), true);
  assert.equal(canAccessModule('EMPLEADO', 'estadisticas'), false);
  assert.equal(canAccessModule('EMPLEADO', 'usuarios'), false);
  assert.equal(canPerformAction('EMPLEADO', 'products:delete'), false);
});

test('CLIENTE can only view products and create/view own orders', () => {
  assert.equal(canAccessModule('CLIENTE', 'productos'), true);
  assert.equal(canAccessModule('CLIENTE', 'pedidos'), true);
  assert.equal(canAccessModule('CLIENTE', 'ventas'), false);
  assert.equal(canAccessModule('CLIENTE', 'movimientos'), false);
  assert.equal(canPerformAction('CLIENTE', 'orders:create'), true);
  assert.equal(canPerformAction('CLIENTE', 'products:create'), false);
});

test('Order status transitions enforce role limits', () => {
  assert.deepEqual(getAllowedOrderTransitions('CLIENTE', 'PENDIENTE'), ['CANCELADO']);
  assert.deepEqual(getAllowedOrderTransitions('CLIENTE', 'CONFIRMADO'), []);
  assert.deepEqual(getAllowedOrderTransitions('EMPLEADO', 'PENDIENTE'), ['CONFIRMADO']);
  assert.deepEqual(getAllowedOrderTransitions('ADMINISTRADOR', 'PENDIENTE'), ['CONFIRMADO', 'CANCELADO']);
});
