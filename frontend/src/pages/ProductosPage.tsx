import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Eye,
  LayoutGrid,
  List,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { extractApiError, productsService } from '../services/api';
import { formatCOP, getStockHealth } from '../utils/inventoryMath';
import { canPerformAction } from '../utils/permissions';
import type { Product } from '../types/stocknova';
import { AnimatedSelect } from '../components/planes/AnimatedSelect';
import { useLanguage } from '../context/LanguageContext';
import { VoiceInputButton } from '../components/accessibility/VoiceInputButton';

const EMPTY_FORM = {
  sku: '',
  name: '',
  category: '',
  price: '',
  stock: '',
  supplier: '',
  available: true,
};

export default function ProductosPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const canCreate = canPerformAction(user?.role, 'products:create');
  const canEdit = canPerformAction(user?.role, 'products:edit');
  const canDelete = canPerformAction(user?.role, 'products:delete');

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('TODAS');
  const [healthFilter, setHealthFilter] = useState<'TODOS' | 'OPTIMO' | 'BAJO' | 'AGOTADO'>('TODOS');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);
  const visibleProducts = useMemo(
    () => user?.role === 'CLIENTE'
      ? products.filter((product) => product.available && product.stock > 0)
      : products,
    [products, user?.role]
  );

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const list = await productsService.list();
      setProducts(list);
    } catch (err) {
      setError(extractApiError(err, t('No se pudo cargar el catálogo de productos.')));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const categories = useMemo(() => {
    const set = new Set(visibleProducts.map((p) => p.category));
    return ['TODAS', ...Array.from(set)];
  }, [visibleProducts]);

  const filtered = useMemo(() => {
    return visibleProducts.filter((p) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.supplier.toLowerCase().includes(q);
      const matchesCat = categoryFilter === 'TODAS' || p.category === categoryFilter;
      const health = getStockHealth(p.stock);
      const matchesHealth = healthFilter === 'TODOS' || health === healthFilter;
      return matchesSearch && matchesCat && matchesHealth;
    });
  }, [visibleProducts, search, categoryFilter, healthFilter]);

  const openCreateModal = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setFormOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingId(p.id);
    setForm({
      sku: p.sku,
      name: p.name,
      category: p.category,
      price: String(p.price),
      stock: String(p.stock),
      supplier: p.supplier,
      available: p.available,
    });
    setFormError('');
    setFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!form.sku.trim() || !form.name.trim()) {
      setFormError(t('El código SKU y el nombre del producto son obligatorios.'));
      return;
    }
    const priceNum = Number(form.price);
    const stockNum = Number(form.stock || 0);

    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      setFormError(t('El precio de venta debe ser mayor a cero.'));
      return;
    }
    if (!Number.isInteger(stockNum) || stockNum < 0) {
      setFormError(t('El stock debe ser un número entero igual o mayor que cero.'));
      return;
    }
    if (!form.category.trim() || !form.supplier.trim()) {
      setFormError(t('La categoría y la marca son obligatorias.'));
      return;
    }

    setSaving(true);
    try {
      const payload = {
        sku: form.sku.trim().toUpperCase(),
        name: form.name.trim(),
        category: form.category.trim(),
        price: priceNum,
        stock: stockNum,
        supplier: form.supplier.trim(),
        available: form.available,
      };

      if (editingId) {
        const updated = await productsService.update(editingId, payload);
        setProducts((prev) => prev.map((item) => (item.id === editingId ? updated : item)));
      } else {
        const created = await productsService.create(payload);
        setProducts((prev) => [created, ...prev]);
      }
      setFormOpen(false);
    } catch (err) {
      setFormError(extractApiError(err, t('No se pudo guardar el producto.')));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await productsService.remove(deleteTarget.id);
      setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      setError(extractApiError(err, t('No se pudo eliminar el producto.')));
    } finally {
      setDeleting(false);
    }
  };

  const renderStockIndicator = (p: Product) => {
    if (!p.available) {
      return <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#AAB8CC]/10 text-[#AAB8CC]">{t('No disponible')}</span>;
    }
    const health = getStockHealth(p.stock);
    if (health === 'AGOTADO') {
      return <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400">{t('Agotado')}</span>;
    }
    if (health === 'BAJO') {
      return <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400">{t('Stock bajo')}</span>;
    }
    return <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">{t('Óptimo')}</span>;
  };

  const getHealthFilterGradient = (status: string) => {
    if (status === 'OPTIMO') return 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white';
    if (status === 'BAJO') return 'bg-gradient-to-r from-amber-600 to-amber-500 text-white';
    if (status === 'AGOTADO') return 'bg-gradient-to-r from-rose-600 to-rose-500 text-white';
    return 'bg-gradient-to-r from-[#176BFF] to-[#2A7BFF] text-[#EAF4FF]';
  };

  return (
    <div className="space-y-6">
      {/* Header — animated entrance */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="flex flex-wrap items-center justify-between gap-4"
      >
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#EAF4FF]">
            {t('Catálogo de productos')}
          </h1>
          <p className="text-sm text-[#AAB8CC] mt-1">
            {visibleProducts.length} {t('referencias registradas · Control de SKU, precios y existencias')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#101B35] border border-[rgba(170,184,204,0.14)]">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              aria-label={t('Vista de tabla')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'table'
                  ? 'bg-gradient-to-r from-[#176BFF] to-[#2A7BFF] text-[#EAF4FF]'
                  : 'text-[#AAB8CC] hover:text-[#EAF4FF]'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              aria-label={t('Vista de tarjetas')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'cards'
                  ? 'bg-gradient-to-r from-[#176BFF] to-[#2A7BFF] text-[#EAF4FF]'
                  : 'text-[#AAB8CC] hover:text-[#EAF4FF]'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          {canCreate && (
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#176BFF] to-[#2A7BFF] hover:from-[#2A7BFF] hover:to-[#176BFF] text-xs font-semibold text-[#EAF4FF] transition-all whitespace-nowrap shrink-0 shadow-lg shadow-[#176BFF]/20"
            >
              <Plus className="w-4 h-4" /> {t('Nuevo producto')}
            </button>
          )}
        </div>
      </motion.div>

      {/* Filters Toolbar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1, ease: 'easeOut' }}
        className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center"
      >
        <div className="md:col-span-5 relative">
          <Search className="w-4 h-4 text-[#AAB8CC] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('Buscar por nombre, SKU o marca...')}
            aria-label={t('Buscar productos')}
            className="w-full h-10 pl-10 pr-12 rounded-lg border border-[rgba(170,184,204,0.2)] bg-[#101B35]/70 text-sm text-[#EAF4FF] placeholder:text-[#AAB8CC]/60 focus:outline-none focus:border-[#176BFF] focus:ring-2 focus:ring-[#176BFF]/20 focus:shadow-[0_0_0_3px_rgba(23,107,255,0.1)] transition-all"
          />
          <VoiceInputButton
            value={search}
            onChange={setSearch}
            compact
            className="absolute right-2 top-1/2 -translate-y-1/2"
          />
        </div>

        <div className="md:col-span-3">
          <AnimatedSelect
            ariaLabel={t('Filtrar por categoría')}
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={categories.map((c) => ({
              value: c,
              label: c === 'TODAS' ? t('Todas las categorías') : c,
            }))}
          />
        </div>

        <div className="md:col-span-4 flex items-center gap-1 p-1 rounded-lg bg-[#101B35] border border-[rgba(170,184,204,0.14)] overflow-x-auto">
          {(['TODOS', 'OPTIMO', 'BAJO', 'AGOTADO'] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setHealthFilter(status)}
              className={`flex-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap shrink-0 ${
                healthFilter === status
                  ? getHealthFilterGradient(status)
                  : 'text-[#AAB8CC] hover:text-[#EAF4FF]'
              }`}
            >
              {status === 'TODOS'
                ? t('Todos')
                : status === 'OPTIMO'
                ? t('Óptimo')
                : status === 'BAJO'
                ? t('Bajo')
                : t('Agotado')}
            </button>
          ))}
        </div>
      </motion.div>

      {error && (
        <div role="alert" className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-200">
          {error}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="h-14 rounded-xl bg-[#101B35] sn-shimmer" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-[rgba(170,184,204,0.14)] bg-[#101B35]/60 p-12 text-center">
          <p className="text-base font-medium text-[#EAF4FF]">
            {t('No se encontraron productos con los filtros actuales.')}
          </p>
          <p className="text-sm text-[#AAB8CC] mt-1">
            {t('Prueba limpiando los criterios de búsqueda o registra una nueva referencia.')}
          </p>
          {canCreate && (
            <button
              type="button"
              onClick={openCreateModal}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#176BFF] text-xs font-semibold text-[#EAF4FF]"
            >
              <Plus className="w-4 h-4" /> {t('Registrar producto')}
            </button>
          )}
        </div>
      ) : viewMode === 'table' ? (
        <div className="rounded-2xl border border-[rgba(170,184,204,0.14)] bg-[#101B35]/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[rgba(170,184,204,0.12)] bg-[#080D1B]/60 text-xs text-[#AAB8CC]">
                  <th className="py-3.5 px-4 font-medium">SKU</th>
                  <th className="py-3.5 px-4 font-medium">{t('Producto')}</th>
                  <th className="py-3.5 px-4 font-medium">{t('Categoría')}</th>
                  <th className="py-3.5 px-4 font-medium text-right">{t('Precio')}</th>
                  <th className="py-3.5 px-4 font-medium text-right">{t('Stock')}</th>
                  <th className="py-3.5 px-4 font-medium">{t('Estado')}</th>
                  <th className="py-3.5 px-4 font-medium text-right">{t('Acciones')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(170,184,204,0.08)]">
                {filtered.map((p, idx) => (
                  <motion.tr
                    key={p.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25, delay: idx * 0.03 }}
                    className="hover:bg-[#176BFF]/5 transition-colors group relative"
                    style={{ borderLeft: '3px solid transparent' }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.borderLeftColor = '#176BFF';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.borderLeftColor = 'transparent';
                    }}
                  >
                    <td className="py-3 px-4 font-mono-tabular text-xs text-[#00D9FF] whitespace-nowrap">
                      {p.sku}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-[#EAF4FF]">{p.name}</div>
                    </td>
                    <td className="py-3 px-4 text-xs text-[#AAB8CC] whitespace-nowrap">{p.category}</td>
                    <td className="py-3 px-4 text-right font-mono-tabular text-[#EAF4FF] whitespace-nowrap">
                      {formatCOP(p.price)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono-tabular font-semibold text-[#EAF4FF] whitespace-nowrap">
                      {p.stock} u.
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">{renderStockIndicator(p)}</td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setDetailProduct(p)}
                          aria-label={`Ver detalles de ${p.name}`}
                          className="p-2 rounded-lg text-[#AAB8CC] hover:text-[#EAF4FF] hover:bg-[#080D1B] transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {canEdit && (
                          <button
                            type="button"
                            onClick={() => openEditModal(p)}
                            aria-label={`Editar ${p.name}`}
                            className="p-2 rounded-lg text-[#AAB8CC] hover:text-[#00D9FF] hover:bg-[#080D1B] transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(p)}
                            aria-label={`Eliminar ${p.name}`}
                            className="p-2 rounded-lg text-[#AAB8CC] hover:text-rose-400 hover:bg-[#080D1B] transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p, idx) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05, ease: 'easeOut' }}
              className="rounded-2xl border border-[rgba(170,184,204,0.14)] bg-[#101B35]/85 p-5 flex flex-col justify-between gap-4 hover:border-[#176BFF]/45 hover:shadow-lg hover:shadow-[#176BFF]/10 transition-all"
            >
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono-tabular text-[#00D9FF]">{p.sku}</span>
                  {renderStockIndicator(p)}
                </div>
                <h3 className="mt-2 font-display text-base font-bold text-[#EAF4FF]">{p.name}</h3>
                <p className="mt-1 text-xs text-[#AAB8CC]">
                  {p.category} · {p.supplier}
                </p>
              </div>

              <div className="pt-3 border-t border-[rgba(170,184,204,0.1)] flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold font-mono-tabular text-[#EAF4FF]">
                    {formatCOP(p.price)}
                  </div>
                  <div className="text-xs font-mono-tabular text-[#AAB8CC]">
                    {p.stock} unidades
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setDetailProduct(p)}
                    aria-label={`Ver detalles de ${p.name}`}
                    className="p-2 rounded-lg border border-[rgba(170,184,204,0.14)] text-[#AAB8CC] hover:text-[#EAF4FF] hover:border-[#176BFF]/40 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => openEditModal(p)}
                      aria-label={`Editar ${p.name}`}
                      className="p-2 rounded-lg border border-[rgba(170,184,204,0.14)] text-[#AAB8CC] hover:text-[#00D9FF] hover:border-[#00D9FF]/40 transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  )}
                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(p)}
                      aria-label={`Eliminar ${p.name}`}
                      className="p-2 rounded-lg border border-[rgba(170,184,204,0.14)] text-[#AAB8CC] hover:text-rose-400 hover:border-rose-500/40 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {detailProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={`Detalles de ${detailProduct.name}`}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="w-full max-w-lg rounded-2xl border border-[rgba(170,184,204,0.2)] bg-[#101B35] p-6 shadow-2xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-xs font-mono-tabular text-[#00D9FF]">{detailProduct.sku}</span>
                  <h2 className="mt-1 font-display text-xl font-bold text-[#EAF4FF]">
                    {detailProduct.name}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setDetailProduct(null)}
                  aria-label={t('Cerrar detalles')}
                  className="p-1.5 rounded-lg text-[#AAB8CC] hover:text-[#EAF4FF] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl bg-[#080D1B] p-3 border border-[rgba(170,184,204,0.12)]">
                  <div className="text-[#AAB8CC]">{t('Categoría')}</div>
                  <div className="mt-1 font-semibold text-[#EAF4FF]">{detailProduct.category}</div>
                </div>
                <div className="rounded-xl bg-[#080D1B] p-3 border border-[rgba(170,184,204,0.12)]">
                  <div className="text-[#AAB8CC]">{t('Precio unitario')}</div>
                  <div className="mt-1 font-mono-tabular font-semibold text-[#00D9FF]">
                    {formatCOP(detailProduct.price)}
                  </div>
                </div>
                <div className="rounded-xl bg-[#080D1B] p-3 border border-[rgba(170,184,204,0.12)]">
                  <div className="text-[#AAB8CC]">{t('Stock actual')}</div>
                  <div className="mt-1 font-mono-tabular font-semibold text-[#EAF4FF]">
                    {detailProduct.stock} unidades
                  </div>
                </div>
                <div className="rounded-xl bg-[#080D1B] p-3 border border-[rgba(170,184,204,0.12)]">
                  <div className="text-[#AAB8CC]">{t('Marca')}</div>
                  <div className="mt-1 font-semibold text-[#EAF4FF]">{detailProduct.supplier}</div>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div>{renderStockIndicator(detailProduct)}</div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {formOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={editingId ? t('Editar producto') : t('Nuevo producto')}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 14 }}
              className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[rgba(170,184,204,0.2)] bg-[#101B35] p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-4 border-b border-[rgba(170,184,204,0.12)]">
                <h2 className="font-display text-lg font-bold text-[#EAF4FF]">
                  {editingId ? t('Editar producto') : t('Registrar nuevo producto')}
                </h2>
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  aria-label={t('Cerrar formulario')}
                  className="p-1.5 rounded-lg text-[#AAB8CC] hover:text-[#EAF4FF] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {formError && (
                <div role="alert" className="mt-4 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-200">
                  {formError}
                </div>
              )}

              <form onSubmit={handleSave} className="mt-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="prd-sku" className="block text-xs font-medium text-[#AAB8CC] mb-1">
                      {t('Código SKU')} *
                    </label>
                    <input
                      id="prd-sku"
                      type="text"
                      value={form.sku}
                      onChange={(e) => setForm({ ...form, sku: e.target.value })}
                      placeholder="SN-OPT-400"
                      className="w-full px-3.5 py-2 rounded-lg border border-[rgba(170,184,204,0.2)] bg-[#080D1B] text-sm text-[#EAF4FF] focus:outline-none focus:border-[#176BFF] focus:ring-2 focus:ring-[#176BFF]/20 focus:shadow-[0_0_12px_rgba(23,107,255,0.15)] transition-all"
                    />
                  </div>
                  <div>
                    <label htmlFor="prd-category" className="block text-xs font-medium text-[#AAB8CC] mb-1">
                      Categoría *
                    </label>
                    <input
                      id="prd-category"
                      type="text"
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      placeholder={t('Categoría del producto')}
                      className="w-full px-3.5 py-2 rounded-lg border border-[rgba(170,184,204,0.2)] bg-[#080D1B] text-sm text-[#EAF4FF] focus:outline-none focus:border-[#176BFF] focus:ring-2 focus:ring-[#176BFF]/20 focus:shadow-[0_0_12px_rgba(23,107,255,0.15)] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="prd-name" className="block text-xs font-medium text-[#AAB8CC] mb-1">
                    {t('Nombre del producto')} *
                  </label>
                  <input
                    id="prd-name"
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder={t('Sensor Óptico SN-400')}
                    className="w-full px-3.5 py-2 rounded-lg border border-[rgba(170,184,204,0.2)] bg-[#080D1B] text-sm text-[#EAF4FF] focus:outline-none focus:border-[#176BFF] focus:ring-2 focus:ring-[#176BFF]/20 focus:shadow-[0_0_12px_rgba(23,107,255,0.15)] transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="prd-price" className="block text-xs font-medium text-[#AAB8CC] mb-1">
                      {t('Precio (COP)')} *
                    </label>
                    <input
                      id="prd-price"
                      type="number"
                      min="1"
                      step="1"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      placeholder="145000"
                      className="w-full px-3 py-2 rounded-lg border border-[rgba(170,184,204,0.2)] bg-[#080D1B] text-sm text-[#EAF4FF] font-mono-tabular focus:outline-none focus:border-[#176BFF] focus:ring-2 focus:ring-[#176BFF]/20 focus:shadow-[0_0_12px_rgba(23,107,255,0.15)] transition-all"
                    />
                  </div>
                  <div>
                    <label htmlFor="prd-stock" className="block text-xs font-medium text-[#AAB8CC] mb-1">
                      {t('Stock inicial')}
                    </label>
                    <input
                      id="prd-stock"
                      type="number"
                      value={form.stock}
                      onChange={(e) => setForm({ ...form, stock: e.target.value })}
                      placeholder="25"
                      className="w-full px-3 py-2 rounded-lg border border-[rgba(170,184,204,0.2)] bg-[#080D1B] text-sm text-[#EAF4FF] font-mono-tabular focus:outline-none focus:border-[#176BFF] focus:ring-2 focus:ring-[#176BFF]/20 focus:shadow-[0_0_12px_rgba(23,107,255,0.15)] transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="prd-supplier" className="block text-xs font-medium text-[#AAB8CC] mb-1">
                      {t('Marca')} *
                    </label>
                    <input
                      id="prd-supplier"
                      type="text"
                      value={form.supplier}
                      onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                      placeholder={t('Marca del producto')}
                      className="w-full px-3.5 py-2 rounded-lg border border-[rgba(170,184,204,0.2)] bg-[#080D1B] text-sm text-[#EAF4FF] focus:outline-none focus:border-[#176BFF] focus:ring-2 focus:ring-[#176BFF]/20 focus:shadow-[0_0_12px_rgba(23,107,255,0.15)] transition-all"
                    />
                  </div>
                  <div>
                    <AnimatedSelect
                      id="prd-availability"
                      label={t('Disponibilidad')}
                      value={form.available ? 'true' : 'false'}
                      onChange={(value) => setForm({ ...form, available: value === 'true' })}
                      options={[
                        { value: 'true', label: t('Disponible') },
                        { value: 'false', label: t('No disponible') },
                      ]}
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setFormOpen(false)}
                    className="px-4 py-2 rounded-xl border border-[rgba(170,184,204,0.2)] text-xs font-semibold text-[#AAB8CC] hover:text-[#EAF4FF] transition-colors"
                  >
                    {t('Cancelar')}
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#176BFF] to-[#2A7BFF] hover:from-[#2A7BFF] hover:to-[#176BFF] disabled:opacity-60 text-xs font-semibold text-[#EAF4FF] transition-all shadow-lg shadow-[#176BFF]/20"
                  >
                    {saving ? t('Guardando...') : editingId ? t('Actualizar producto') : t('Guardar producto')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={t('Confirmar eliminación')}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="w-full max-w-md rounded-2xl border border-rose-500/40 bg-gradient-to-b from-rose-950/80 to-[#101B35] p-6 shadow-2xl shadow-rose-900/30"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400">
                  <Trash2 className="w-5 h-5" />
                </span>
                <h2 className="font-display text-lg font-bold text-[#EAF4FF]">
                  {t('Eliminar producto')}
                </h2>
              </div>
              <p className="mt-2 text-sm text-[#AAB8CC]">
                {t('¿Confirmas que deseas eliminar')} <strong className="text-[#EAF4FF]">{deleteTarget.name}</strong> ({deleteTarget.sku}) {t('del catálogo?')}
              </p>
              <p className="mt-1 text-xs text-rose-400/80">
                {t('Esta acción no se puede deshacer.')}
              </p>
              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="px-4 py-2 rounded-xl border border-[rgba(170,184,204,0.2)] text-xs font-semibold text-[#AAB8CC] hover:text-[#EAF4FF] transition-colors"
                >
                  {t('Cancelar')}
                </button>
                <button
                  type="button"
                  disabled={deleting}
                  onClick={handleDelete}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 disabled:opacity-60 text-xs font-semibold text-white shadow-lg shadow-rose-900/30 transition-all"
                >
                  {deleting ? t('Eliminando...') : t('Eliminar definitivamente')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
