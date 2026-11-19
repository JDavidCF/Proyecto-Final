import React, { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, Plus, Receipt, TrendingUp, X } from 'lucide-react';
import { extractApiError, productsService, salesService } from '../services/api';
import { calculateSaleItemsTotal, formatCOP } from '../utils/inventoryMath';
import type { Product, Sale } from '../types/stocknova';
import { AnimatedNumber } from '../components/planes/AnimatedNumber';
import { AnimatedSelect } from '../components/planes/AnimatedSelect';
import { useLanguage } from '../context/LanguageContext';

export default function VentasPage() {
  const { locale, t } = useLanguage();
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [s, p] = await Promise.all([salesService.list(), productsService.list()]);
      setSales(s);
      setProducts(p);
    } catch (err) {
      setError(extractApiError(err, t('No se pudo cargar el historial de ventas.')));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openNewSaleModal = () => {
    const firstAvailable = products.find((p) => p.available && p.stock > 0);
    setProductId(firstAvailable?.id ?? '');
    setQuantity('1');
    setFormError('');
    setModalOpen(true);
  };

  const selectedProduct = products.find((product) => product.id === productId);
  const parsedQuantity = Number(quantity);
  const draftTotal = calculateSaleItemsTotal([
    { quantity: parsedQuantity, unitPrice: selectedProduct?.price ?? 0 },
  ]);

  const handleSubmitSale = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!selectedProduct) {
      setFormError(t('Selecciona un producto disponible.'));
      return;
    }
    if (!Number.isInteger(parsedQuantity) || parsedQuantity < 1 || parsedQuantity > selectedProduct.stock) {
      setFormError(t('La cantidad debe ser un entero dentro del stock disponible.'));
      return;
    }

    setSubmitting(true);
    try {
      const created = await salesService.create({ productId, quantity: parsedQuantity });
      setSales((prev) => [created, ...prev]);
      const refreshedProducts = await productsService.list();
      setProducts(refreshedProducts);
      setModalOpen(false);
    } catch (err) {
      setFormError(extractApiError(err, t('No se pudo registrar la venta.')));
    } finally {
      setSubmitting(false);
    }
  };

  const totalRevenue = sales.reduce((acc, s) => acc + s.total, 0);
  const totalUnitsSold = sales.reduce(
    (acc, s) => acc + s.items.reduce((sum, i) => sum + i.quantity, 0),
    0
  );
  const avgTicket = sales.length > 0 ? totalRevenue / sales.length : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#EAF4FF]">
            {t('Registro y panel comercial')}
          </h1>
          <p className="text-sm text-[#AAB8CC] mt-1">
            {t('Facturación directa con descuento automático de existencias en almacén')}
          </p>
        </div>

        <button
          type="button"
          onClick={openNewSaleModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#176BFF] hover:bg-[#2A7BFF] text-xs font-semibold text-[#EAF4FF] transition-colors whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" /> {t('Registrar venta')}
        </button>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-[rgba(170,184,204,0.14)] bg-[#101B35]/85 p-5">
          <div className="flex items-center justify-between text-xs text-[#AAB8CC]">
            <span>{t('Ingresos totales')}</span>
            <TrendingUp className="w-4 h-4 text-[#00D9FF]" />
          </div>
          <div className="mt-2 text-2xl font-bold text-[#EAF4FF]">
            {formatCOP(totalRevenue)}
          </div>
        </div>

        <div className="rounded-2xl border border-[rgba(170,184,204,0.14)] bg-[#101B35]/85 p-5">
          <div className="flex items-center justify-between text-xs text-[#AAB8CC]">
            <span>{t('Transacciones realizadas')}</span>
            <Receipt className="w-4 h-4 text-[#176BFF]" />
          </div>
          <div className="mt-2 text-2xl font-bold text-[#EAF4FF]">
            <AnimatedNumber value={sales.length} />
          </div>
          <div className="mt-1 text-xs text-[#AAB8CC] font-mono-tabular">
            {totalUnitsSold} {t('unidades despachadas')}
          </div>
        </div>

        <div className="rounded-2xl border border-[rgba(170,184,204,0.14)] bg-[#101B35]/85 p-5">
          <div className="flex items-center justify-between text-xs text-[#AAB8CC]">
            <span>{t('Ticket promedio')}</span>
            <Receipt className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-[#EAF4FF]">
            {formatCOP(avgTicket)}
          </div>
        </div>
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-200">
          {error}
        </div>
      )}

      {/* Sales Table */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-14 rounded-xl bg-[#101B35] animate-pulse" />
          ))}
        </div>
      ) : sales.length === 0 ? (
        <div className="rounded-2xl border border-[rgba(170,184,204,0.14)] bg-[#101B35]/60 p-12 text-center">
          <p className="text-base font-medium text-[#EAF4FF]">{t('Aún no hay ventas registradas.')}</p>
          <button
            type="button"
            onClick={openNewSaleModal}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#176BFF] text-xs font-semibold text-[#EAF4FF]"
          >
            <Plus className="w-4 h-4" /> {t('Registrar primera venta')}
          </button>
        </div>
      ) : (
        <div className="rounded-2xl border border-[rgba(170,184,204,0.14)] bg-[#101B35]/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[rgba(170,184,204,0.12)] bg-[#080D1B]/60 text-xs text-[#AAB8CC]">
                  <th className="py-3.5 px-4 font-medium">{t('Comprobante')}</th>
                  <th className="py-3.5 px-4 font-medium">{t('Producto')}</th>
                  <th className="py-3.5 px-4 font-medium">{t('Responsable')}</th>
                  <th className="py-3.5 px-4 font-medium text-right">{t('Cantidad')}</th>
                  <th className="py-3.5 px-4 font-medium text-right">{t('Total')}</th>
                  <th className="py-3.5 px-4 font-medium text-right">{t('Detalle')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(170,184,204,0.08)]">
                {sales.map((s) => {
                  const qtySum = s.items.reduce((acc, i) => acc + i.quantity, 0);
                  return (
                    <tr key={s.id} className="hover:bg-[#EAF4FF]/[0.025] transition-colors">
                      <td className="py-3 px-4 font-mono-tabular text-xs text-[#00D9FF] whitespace-nowrap">
                        {s.code}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-[#EAF4FF]">{s.items[0]?.productName}</div>
                        <div className="text-xs font-mono-tabular text-[#AAB8CC]">{new Date(s.createdAt).toLocaleDateString(locale)}</div>
                      </td>
                      <td className="py-3 px-4 text-xs text-[#AAB8CC]">{t('Usuario')} #{s.sellerId}</td>
                      <td className="py-3 px-4 text-right font-mono-tabular text-xs text-[#EAF4FF]">
                        {qtySum} u.
                      </td>
                      <td className="py-3 px-4 text-right font-mono-tabular font-semibold text-[#EAF4FF]">
                        {formatCOP(s.total)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedSale(s)}
                          aria-label={`Ver detalle de venta ${s.code}`}
                          className="p-2 rounded-lg text-[#AAB8CC] hover:text-[#EAF4FF] hover:bg-[#080D1B]"
                        >
                          <Eye className="w-4 h-4" />
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

      {/* Sale Detail Modal */}
      <AnimatePresence>
        {selectedSale && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={`Detalle de ${selectedSale.code}`}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="w-full max-w-lg rounded-2xl border border-[rgba(170,184,204,0.2)] bg-[#101B35] p-6 shadow-2xl"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-mono-tabular text-[#00D9FF]">{selectedSale.code}</span>
                  <h2 className="mt-1 font-display text-lg font-bold text-[#EAF4FF]">
                    {selectedSale.items[0]?.productName}
                  </h2>
                  <p className="text-xs text-[#AAB8CC] mt-0.5">
                    {t('Usuario responsable')} #{selectedSale.sellerId} · {new Date(selectedSale.createdAt).toLocaleString(locale)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedSale(null)}
                  aria-label={t('Cerrar detalle')}
                  className="p-1.5 rounded-lg text-[#AAB8CC] hover:text-[#EAF4FF]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-5 rounded-xl border border-[rgba(170,184,204,0.12)] bg-[#080D1B] divide-y divide-[rgba(170,184,204,0.08)]">
                {selectedSale.items.map((item, idx) => (
                  <div key={idx} className="p-3.5 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="font-medium text-[#EAF4FF]">{item.productName}</div>
                      <div className="font-mono-tabular text-[#AAB8CC]">
                        {item.sku} · {item.quantity} × {formatCOP(item.unitPrice)}
                      </div>
                    </div>
                    <span className="font-mono-tabular font-semibold text-[#EAF4FF]">
                      {formatCOP(item.subtotal)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between pt-3 border-t border-[rgba(170,184,204,0.12)]">
                <span className="text-sm text-[#AAB8CC]">{t('Total facturado')}</span>
                <span className="font-display text-xl font-bold font-mono-tabular text-[#00D9FF]">
                  {formatCOP(selectedSale.total)}
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Register Sale Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={t('Registrar nueva venta')}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 14 }}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[rgba(170,184,204,0.2)] bg-[#101B35] p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-4 border-b border-[rgba(170,184,204,0.12)]">
                <h2 className="font-display text-lg font-bold text-[#EAF4FF]">
                  {t('Registrar nueva venta')}
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

              <form onSubmit={handleSubmitSale} className="mt-4 space-y-4">
                <div className="space-y-4">
                  <AnimatedSelect
                    id="sale-product"
                    label={`${t('Producto')} *`}
                    value={productId}
                    onChange={setProductId}
                    options={products.filter((product) => product.available && product.stock > 0).map((product) => ({
                      value: product.id,
                      label: `${product.name} (${product.stock} u.)`,
                      hint: `${product.sku} · ${formatCOP(product.price)}`,
                    }))}
                  />
                  <div>
                    <label htmlFor="sale-quantity" className="block text-xs font-medium text-[#AAB8CC] mb-1.5">
                      {t('Cantidad')}
                    </label>
                    <input
                      id="sale-quantity"
                      type="number"
                      min={1}
                      max={selectedProduct?.stock ?? 0}
                      value={quantity}
                      onChange={(event) => setQuantity(event.target.value)}
                      className="w-full h-10 px-3.5 rounded-lg border border-[rgba(170,184,204,0.2)] bg-[#080D1B] text-sm font-mono-tabular text-[#EAF4FF] focus:outline-none focus:border-[#176BFF]"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-[rgba(170,184,204,0.14)] flex items-center justify-between">
                  <div>
                    <div className="text-xs text-[#AAB8CC]">{t('Total calculado')}</div>
                    <div className="text-xl font-bold font-mono-tabular text-[#00D9FF]">
                      {formatCOP(draftTotal)}
                    </div>
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
                      {submitting ? t('Registrando...') : t('Confirmar venta')}
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
