import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowDownLeft, ArrowUpRight, Plus, RefreshCw, X } from 'lucide-react';
import { extractApiError, movementsService, productsService } from '../services/api';
import { applyMovementDelta } from '../utils/inventoryMath';
import type { InventoryMovement, MovementType, Product } from '../types/stocknova';
import { AnimatedSelect } from '../components/planes/AnimatedSelect';
import { ActivityFeed } from '../components/planes/ActivityFeed';
import { useLanguage } from '../context/LanguageContext';

export default function MovimientosPage() {
  const { t } = useLanguage();
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [productFilter, setProductFilter] = useState('TODOS');
  const [userFilter, setUserFilter] = useState('TODOS');
  const [typeFilter, setTypeFilter] = useState<'TODOS' | MovementType>('TODOS');

  const [modalOpen, setModalOpen] = useState(false);
  const [formProductId, setFormProductId] = useState('');
  const [formType, setFormType] = useState<MovementType>('ENTRADA');
  const [formQuantity, setFormQuantity] = useState('1');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [m, p] = await Promise.all([movementsService.list(), productsService.list()]);
      setMovements(m);
      setProducts(p);
      const firstAvailable = p.find((product) => product.available);
      if (firstAvailable && !formProductId) {
        setFormProductId(firstAvailable.id);
      }
    } catch (err) {
      setError(extractApiError(err, t('No se pudo cargar el historial de movimientos.')));
    } finally {
      setLoading(false);
    }
  }, [formProductId, t]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const distinctUsers = useMemo(() => {
    const map = new Map<string, string>();
    for (const m of movements) {
      map.set(m.userId, `${t('Usuario')} #${m.userId}`);
    }
    return Array.from(map.entries());
  }, [movements, t]);

  const filtered = useMemo(() => {
    return movements.filter((m) => {
      const matchProd = productFilter === 'TODOS' || m.productId === productFilter;
      const matchUser = userFilter === 'TODOS' || m.userId === userFilter;
      const matchType = typeFilter === 'TODOS' || m.type === typeFilter;
      return matchProd && matchUser && matchType;
    });
  }, [movements, productFilter, userFilter, typeFilter]);

  const entriesCount = movements.filter((m) => m.type === 'ENTRADA').length;
  const exitsCount = movements.filter((m) => m.type === 'SALIDA').length;
  const adjustmentsCount = movements.filter((m) => m.type === 'AJUSTE').length;

  const selectedProduct = products.find((p) => p.id === formProductId);
  const projectedDelta = selectedProduct
    ? applyMovementDelta(selectedProduct.stock, formType, Number(formQuantity))
    : null;

  const openModal = () => {
    const firstAvailable = products.find((product) => product.available);
    if (firstAvailable) setFormProductId(firstAvailable.id);
    setFormType('ENTRADA');
    setFormQuantity('5');
    setFormError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formProductId) {
      setFormError(t('Selecciona un producto.'));
      return;
    }
    if (!projectedDelta || !projectedDelta.valid) {
      setFormError(projectedDelta?.error || t('Cantidad inválida.'));
      return;
    }
    setSubmitting(true);
    try {
      const created = await movementsService.create({
        productId: formProductId,
        type: formType,
        quantity: Number(formQuantity),
      });
      setMovements((prev) => [created, ...prev]);
      const refreshedProducts = await productsService.list();
      setProducts(refreshedProducts);
      setModalOpen(false);
    } catch (err) {
      setFormError(extractApiError(err, t('No se pudo registrar el movimiento.')));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#EAF4FF]">
            {t('Movimientos de inventario')}
          </h1>
          <p className="text-sm text-[#AAB8CC] mt-1">
            {t('Trazabilidad de entradas, salidas y ajustes físicos por producto y responsable')}
          </p>
        </div>

        <button
          type="button"
          onClick={openModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#176BFF] hover:bg-[#2A7BFF] text-xs font-semibold text-[#EAF4FF] transition-colors whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" /> {t('Registrar entrada o ajuste')}
        </button>
      </div>

      {/* Type Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-[rgba(170,184,204,0.14)] bg-[#101B35]/85 p-5 flex items-center justify-between">
          <div>
            <div className="text-xs text-[#AAB8CC]">{t('Entradas registradas')}</div>
            <div className="mt-1 text-2xl font-bold font-mono-tabular text-[#EAF4FF]">
              {entriesCount}
            </div>
          </div>
          <span className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ArrowDownLeft className="w-5 h-5" />
          </span>
        </div>

        <div className="rounded-2xl border border-[rgba(170,184,204,0.14)] bg-[#101B35]/85 p-5 flex items-center justify-between">
          <div>
            <div className="text-xs text-[#AAB8CC]">{t('Salidas registradas')}</div>
            <div className="mt-1 text-2xl font-bold font-mono-tabular text-[#EAF4FF]">
              {exitsCount}
            </div>
          </div>
          <span className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <ArrowUpRight className="w-5 h-5" />
          </span>
        </div>

        <div className="rounded-2xl border border-[rgba(170,184,204,0.14)] bg-[#101B35]/85 p-5 flex items-center justify-between">
          <div>
            <div className="text-xs text-[#AAB8CC]">{t('Ajustes de conteo')}</div>
            <div className="mt-1 text-2xl font-bold font-mono-tabular text-[#EAF4FF]">
              {adjustmentsCount}
            </div>
          </div>
          <span className="h-10 w-10 rounded-xl bg-[#00D9FF]/10 border border-[#00D9FF]/30 flex items-center justify-center text-[#00D9FF]">
            <RefreshCw className="w-5 h-5" />
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        <div className="md:col-span-4">
          <AnimatedSelect
            ariaLabel={t('Filtrar movimientos por producto')}
            value={productFilter}
            onChange={setProductFilter}
            options={[
              { value: 'TODOS', label: t('Todos los productos') },
              ...products.map((p) => ({ value: p.id, label: `${p.sku} · ${p.name}` })),
            ]}
          />
        </div>

        <div className="md:col-span-4">
          <AnimatedSelect
            ariaLabel={t('Filtrar movimientos por usuario')}
            value={userFilter}
            onChange={setUserFilter}
            options={[
              { value: 'TODOS', label: t('Todos los responsables') },
              ...distinctUsers.map(([id, name]) => ({ value: id, label: name })),
            ]}
          />
        </div>

        <div className="md:col-span-4 flex items-center gap-1 p-1 rounded-lg bg-[#101B35] border border-[rgba(170,184,204,0.14)]">
          {(['TODOS', 'ENTRADA', 'SALIDA', 'AJUSTE'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setTypeFilter(type)}
              className={`flex-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                typeFilter === type
                  ? 'bg-[#176BFF] text-[#EAF4FF]'
                  : 'text-[#AAB8CC] hover:text-[#EAF4FF]'
              }`}
            >
              {type === 'TODOS' ? t('Todos') : type === 'ENTRADA' ? t('Entradas') : type === 'SALIDA' ? t('Salidas') : t('Ajustes')}
            </button>
          ))}
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
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-[rgba(170,184,204,0.14)] bg-[#101B35]/60 p-12 text-center">
          <p className="text-base font-medium text-[#EAF4FF]">
            {t('No hay movimientos registrados para los filtros seleccionados.')}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-[rgba(170,184,204,0.14)] bg-[#101B35]/80 p-5 sm:p-6">
          <ActivityFeed movements={filtered} maxItems={50} />
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={t('Registrar movimiento de inventario')}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 14 }}
              className="w-full max-w-lg rounded-2xl border border-[rgba(170,184,204,0.2)] bg-[#101B35] p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-4 border-b border-[rgba(170,184,204,0.12)]">
                <h2 className="font-display text-lg font-bold text-[#EAF4FF]">
                  {t('Registrar movimiento')}
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

              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <AnimatedSelect
                  id="mov-product"
                  label={`${t('Producto')} *`}
                  value={formProductId}
                  onChange={setFormProductId}
                  options={products.filter((p) => p.available).map((p) => ({
                    value: p.id,
                    label: `${p.sku} · ${p.name}`,
                    hint: `${t('Stock actual')}: ${p.stock} u.`,
                  }))}
                />

                <div className="grid grid-cols-2 gap-4">
                  <AnimatedSelect
                    id="mov-type"
                    label={t('Tipo de operación')}
                    value={formType}
                    onChange={(val) => setFormType(val as MovementType)}
                    options={[
                      { value: 'ENTRADA', label: t('Entrada (sumar)') },
                      { value: 'AJUSTE', label: t('Ajuste (fijar conteo)') },
                    ]}
                  />
                  <div>
                    <label htmlFor="mov-qty" className="block text-xs font-medium text-[#AAB8CC] mb-1.5">
                      {formType === 'AJUSTE' ? t('Nuevo stock exacto') : t('Cantidad')}
                    </label>
                    <input
                      id="mov-qty"
                      type="number"
                      min={0}
                      value={formQuantity}
                      onChange={(e) => setFormQuantity(e.target.value)}
                      className="w-full h-10 px-3.5 rounded-lg border border-[rgba(170,184,204,0.2)] bg-[#080D1B] text-sm font-mono-tabular text-[#EAF4FF] focus:outline-none focus:border-[#176BFF]"
                    />
                  </div>
                </div>

                {selectedProduct && projectedDelta && (
                  <div className="rounded-xl bg-[#080D1B] border border-[rgba(170,184,204,0.12)] p-3 flex items-center justify-between text-xs">
                    <span className="text-[#AAB8CC]">{t('Proyección de stock')}</span>
                    <span className="font-mono-tabular font-semibold text-[#00D9FF]">
                      {selectedProduct.stock} u. →{' '}
                      {projectedDelta.valid ? `${projectedDelta.newStock} u.` : t('Inválido')}
                    </span>
                  </div>
                )}

                <div className="pt-2 flex items-center justify-end gap-3">
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
                    className="px-5 py-2 rounded-xl bg-[#176BFF] hover:bg-[#2A7BFF] disabled:opacity-60 text-xs font-semibold text-[#EAF4FF]"
                  >
                    {submitting ? t('Registrando...') : t('Guardar movimiento')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
