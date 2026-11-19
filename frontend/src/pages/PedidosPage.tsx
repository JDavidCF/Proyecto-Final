import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, Plus, Trash2, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { extractApiError, ordersService, productsService } from '../services/api';
import { calculateSaleItemsTotal, formatCOP } from '../utils/inventoryMath';
import { canPerformAction, getAllowedOrderTransitions } from '../utils/permissions';
import type { Order, OrderStatus, Product } from '../types/stocknova';
import { AnimatedSelect } from '../components/planes/AnimatedSelect';
import { useLanguage } from '../context/LanguageContext';

const STATUS_META: Record<OrderStatus, { label: string; colorClass: string }> = {
  PENDIENTE: { label: 'Pendiente', colorClass: 'text-amber-400' },
  CONFIRMADO: { label: 'Confirmado', colorClass: 'text-[#00D9FF]' },
  RECHAZADO: { label: 'Rechazado', colorClass: 'text-rose-400' },
  CANCELADO: { label: 'Cancelado', colorClass: 'text-rose-400' },
};

export default function PedidosPage() {
  const { user } = useAuth();
  const { locale, t } = useLanguage();
  const canCreate = canPerformAction(user?.role, 'orders:create');

  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<'TODOS' | OrderStatus>('TODOS');

  const [detailOrder, setDetailOrder] = useState<Order | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [draftLines, setDraftLines] = useState<Array<{ productId: string; quantity: number }>>([]);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      if (!user) return;
      const [o, p] = await Promise.all([ordersService.list(user.role), productsService.list()]);
      setOrders(o);
      setProducts(p);
    } catch (err) {
      setError(extractApiError(err, t('No se pudieron cargar los pedidos.')));
    } finally {
      setLoading(false);
    }
  }, [user, t]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = useMemo(() => {
    if (statusFilter === 'TODOS') return orders;
    return orders.filter((o) => o.status === statusFilter);
  }, [orders, statusFilter]);

  const openCreateModal = () => {
    const firstAvail = products.find((p) => p.available && p.stock > 0);
    setDraftLines(firstAvail ? [{ productId: firstAvail.id, quantity: 1 }] : []);
    setFormError('');
    setModalOpen(true);
  };

  const handleStatusChange = async (orderId: string, nextStatus: OrderStatus) => {
    setUpdatingId(orderId);
    setError('');
    try {
      if (!user) return;
      const updated = await ordersService.updateStatus(orderId, nextStatus, user.role);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      if (detailOrder?.id === orderId) setDetailOrder(updated);
    } catch (err) {
      setError(extractApiError(err, t('No se pudo actualizar el estado del pedido.')));
    } finally {
      setUpdatingId(null);
    }
  };

  const calculationLines = useMemo(
    () => draftLines.map((line) => {
      const product = products.find((item) => item.id === line.productId);
      const unitPrice = product?.price ?? 0;
      return {
        productId: line.productId,
        productName: product?.name ?? 'Producto no disponible',
        quantity: line.quantity,
        unitPrice,
        subtotal: line.quantity * unitPrice,
      };
    }),
    [draftLines, products]
  );
  const draftTotal = calculateSaleItemsTotal(calculationLines);

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (draftLines.length === 0) {
      setFormError(t('Agrega al menos un producto al pedido.'));
      return;
    }
    if (draftLines.some((line) => {
      const product = products.find((item) => item.id === line.productId);
      return !product || !product.available || !Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > product.stock;
    })) {
      setFormError(t('Verifica que los productos estén disponibles y las cantidades no superen el stock actual.'));
      return;
    }

    setSubmitting(true);
    try {
      const created = await ordersService.create({
        items: draftLines,
      });
      setOrders((prev) => [created, ...prev]);
      setModalOpen(false);
    } catch (err) {
      setFormError(extractApiError(err, t('No se pudo crear el pedido.')));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#EAF4FF]">
            {t('Gestión de pedidos')}
          </h1>
          <p className="text-sm text-[#AAB8CC] mt-1">
            {user?.role === 'CLIENTE'
              ? t('Crea solicitudes nuevas y realiza seguimiento al estado de despacho')
              : t('Control de cola operativa, confirmación y despacho de solicitudes')}
          </p>
        </div>

        {canCreate && (
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#176BFF] hover:bg-[#2A7BFF] text-xs font-semibold text-[#EAF4FF] transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" /> {t('Crear pedido')}
          </button>
        )}
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-[#101B35] border border-[rgba(170,184,204,0.14)] overflow-x-auto">
        {(['TODOS', 'PENDIENTE', 'CONFIRMADO', 'RECHAZADO'] as const).map(
          (st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                statusFilter === st
                  ? 'bg-[#176BFF] text-[#EAF4FF]'
                  : 'text-[#AAB8CC] hover:text-[#EAF4FF]'
              }`}
            >
              {st === 'TODOS' ? t('Todos') : t(STATUS_META[st].label)}
            </button>
          )
        )}
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-44 rounded-2xl bg-[#101B35] animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-[rgba(170,184,204,0.14)] bg-[#101B35]/60 p-12 text-center">
          <p className="text-base font-medium text-[#EAF4FF]">
            {t('No hay pedidos en esta categoría.')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((order) => {
            const transitions = user ? getAllowedOrderTransitions(user.role, order.status) : [];
            const meta = STATUS_META[order.status];
            return (
              <div
                key={order.id}
                className="rounded-2xl border border-[rgba(170,184,204,0.14)] bg-[#101B35]/85 p-5 flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono-tabular text-xs font-semibold text-[#00D9FF]">
                      {order.code}
                    </span>
                    <span className={`text-xs font-semibold ${meta.colorClass}`}>
                      {t(meta.label)}
                    </span>
                  </div>

                  <h3 className="mt-2 font-display text-base font-bold text-[#EAF4FF]">
                    Pedido de cliente #{order.clientId}
                  </h3>

                  <div className="mt-3 pt-3 border-t border-[rgba(170,184,204,0.1)] flex items-center justify-between text-xs">
                    <span className="text-[#AAB8CC]">
                      {order.items.length} referencia(s) ·{' '}
                      {new Date(order.createdAt).toLocaleDateString(locale)}
                    </span>
                    <span className="font-mono-tabular text-sm font-bold text-[#EAF4FF]">
                      {formatCOP(order.total)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[rgba(170,184,204,0.1)]">
                  <button
                    type="button"
                    onClick={() => setDetailOrder(order)}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-[#AAB8CC] hover:text-[#EAF4FF]"
                  >
                    <Eye className="w-3.5 h-3.5" /> {t('Ver detalles')}
                  </button>

                  <div className="flex flex-wrap items-center gap-2">
                    {transitions.map((next) => (
                      <button
                        key={next}
                        type="button"
                        disabled={updatingId === order.id}
                        onClick={() => handleStatusChange(order.id, next)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                          next === 'CANCELADO' || next === 'RECHAZADO'
                            ? 'border border-rose-500/40 text-rose-300 hover:bg-rose-500/15'
                            : 'bg-[#176BFF] hover:bg-[#2A7BFF] text-[#EAF4FF]'
                        }`}
                      >
                        {next === 'CANCELADO'
                          ? t('Cancelar')
                          : next === 'RECHAZADO'
                          ? t('Rechazar')
                          : `Marcar ${STATUS_META[next].label}`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {detailOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={`Detalles del pedido ${detailOrder.code}`}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="w-full max-w-lg rounded-2xl border border-[rgba(170,184,204,0.2)] bg-[#101B35] p-6 shadow-2xl"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-mono-tabular text-[#00D9FF]">{detailOrder.code}</span>
                  <h2 className="mt-1 font-display text-lg font-bold text-[#EAF4FF]">
                    Pedido de cliente #{detailOrder.clientId}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setDetailOrder(null)}
                  aria-label={t('Cerrar detalles')}
                  className="p-1.5 rounded-lg text-[#AAB8CC] hover:text-[#EAF4FF]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 rounded-xl border border-[rgba(170,184,204,0.12)] bg-[#080D1B] divide-y divide-[rgba(170,184,204,0.08)]">
                {detailOrder.items.map((item, idx) => (
                  <div key={idx} className="p-3.5 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-medium text-[#EAF4FF]">{item.productName}</div>
                      <div className="font-mono-tabular text-[#AAB8CC]">
                        {item.quantity} × {formatCOP(item.unitPrice)}
                      </div>
                    </div>
                    <span className="font-mono-tabular font-semibold text-[#EAF4FF]">
                      {formatCOP(item.quantity * item.unitPrice)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-[rgba(170,184,204,0.12)] flex items-center justify-between">
                <span className={`text-xs font-semibold ${STATUS_META[detailOrder.status].colorClass}`}>
                  Estado: {STATUS_META[detailOrder.status].label}
                </span>
                <span className="font-display text-lg font-bold font-mono-tabular text-[#00D9FF]">
                  {formatCOP(detailOrder.total)}
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Order Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={t('Crear nuevo pedido')}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 14 }}
              className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[rgba(170,184,204,0.2)] bg-[#101B35] p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-4 border-b border-[rgba(170,184,204,0.12)]">
                <h2 className="font-display text-lg font-bold text-[#EAF4FF]">
                  {t('Crear nuevo pedido')}
                </h2>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  aria-label={t('Cerrar modal')}
                  className="p-1.5 rounded-lg text-[#AAB8CC] hover:text-[#EAF4FF]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {formError && (
                <div role="alert" className="mt-4 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-200">
                  {formError}
                </div>
              )}

              <form onSubmit={handleCreateOrder} className="mt-4 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#EAF4FF]">{t('Productos solicitados')}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const first = products.find((p) => p.available && p.stock > 0);
                        if (first) setDraftLines((prev) => [...prev, { productId: first.id, quantity: 1 }]);
                      }}
                      className="text-xs font-semibold text-[#00D9FF] hover:underline"
                    >
                      + {t('Agregar producto')}
                    </button>
                  </div>

                  {draftLines.map((line, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-12 gap-2 items-end rounded-xl border border-[rgba(170,184,204,0.12)] bg-[#080D1B]/70 p-3"
                    >
                      <div className="col-span-7">
                        <AnimatedSelect
                          ariaLabel={`Producto pedido ${idx + 1}`}
                          value={line.productId}
                          onChange={(val) =>
                            setDraftLines((prev) =>
                              prev.map((item, i) => (i === idx ? { ...item, productId: val } : item))
                            )
                          }
                          options={products
                            .filter((p) => p.available && p.stock > 0)
                            .map((p) => ({
                              value: p.id,
                              label: `${p.name} (${p.stock} u.)`,
                              hint: formatCOP(p.price),
                            }))}
                        />
                      </div>
                      <div className="col-span-3">
                        <label className="block text-[11px] text-[#AAB8CC] mb-1">{t('Cantidad')}</label>
                        <input
                          type="number"
                          min={1}
                          value={line.quantity}
                          onChange={(e) =>
                            setDraftLines((prev) =>
                              prev.map((item, i) =>
                                i === idx ? { ...item, quantity: Math.max(1, Number(e.target.value)) } : item
                              )
                            )
                          }
                          aria-label={`Cantidad pedido ${idx + 1}`}
                          className="w-full h-10 px-3 rounded-lg border border-[rgba(170,184,204,0.2)] bg-[#080D1B] text-sm font-mono-tabular text-[#EAF4FF]"
                        />
                      </div>
                      <div className="col-span-2 flex justify-end">
                        <button
                          type="button"
                          onClick={() =>
                            setDraftLines((prev) => prev.filter((_, i) => i !== idx))
                          }
                          aria-label={`Quitar producto ${idx + 1}`}
                          className="h-10 w-10 rounded-lg border border-[rgba(170,184,204,0.16)] flex items-center justify-center text-[#AAB8CC] hover:text-rose-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <section
                  aria-label={t('Calculadora del pedido')}
                  aria-live="polite"
                  className="rounded-xl border border-[rgba(170,184,204,0.16)] bg-[#080D1B]/70 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-[#EAF4FF]">{t('Calculadora del pedido')}</h3>
                      <p className="mt-1 text-[11px] text-[#AAB8CC]">
                        {t('Estimación según los precios actuales del catálogo')}
                      </p>
                    </div>
                    <span className="text-[11px] font-mono-tabular text-[#00D9FF]">COP</span>
                  </div>
                  <div className="mt-3 space-y-2">
                    {calculationLines.map((line, idx) => (
                      <div
                        key={`${line.productId}-${idx}`}
                        className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 text-xs"
                      >
                        <span className="truncate font-medium text-[#EAF4FF]">
                          {line.productName}
                        </span>
                        <span className="text-right font-mono-tabular text-[#AAB8CC]">
                          {formatCOP(line.subtotal)}
                        </span>
                        <span className="text-[11px] text-[#AAB8CC]">
                          {line.quantity} × {formatCOP(line.unitPrice)}
                        </span>
                      </div>
                    ))}
                    {calculationLines.length === 0 && (
                      <p className="text-xs text-[#AAB8CC]">
                        {t('Agrega productos para calcular el pedido.')}
                      </p>
                    )}
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-[rgba(170,184,204,0.14)] pt-3">
                    <span className="text-xs font-semibold text-[#EAF4FF]">{t('Total estimado')}</span>
                    <span className="font-mono-tabular text-base font-bold text-[#00D9FF]">
                      {formatCOP(draftTotal)}
                    </span>
                  </div>
                </section>

                <div className="pt-3 border-t border-[rgba(170,184,204,0.14)] flex items-center justify-between">
                  <div>
                    <p className="max-w-48 text-[11px] text-[#AAB8CC]">
                      {t('El total final lo confirma el servidor al guardar.')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setModalOpen(false)}
                      className="px-4 py-2 rounded-xl border border-[rgba(170,184,204,0.2)] text-xs font-semibold text-[#AAB8CC]"
                    >
                      {t('Cancelar')}
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-5 py-2.5 rounded-xl bg-[#176BFF] hover:bg-[#2A7BFF] disabled:opacity-60 text-xs font-semibold text-[#EAF4FF]"
                    >
                      {submitting ? 'Enviando...' : 'Enviar pedido'}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
