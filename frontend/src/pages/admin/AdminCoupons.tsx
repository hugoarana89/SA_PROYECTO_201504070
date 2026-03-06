import React, { useState, useEffect } from 'react';
import {
  TagIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  XMarkIcon,
  ExclamationCircleIcon,
  PercentBadgeIcon,
  CurrencyDollarIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { couponService } from '../../services/payment.service';
import type { Coupon, DiscountType, CreateCouponInput, UpdateCouponInput } from '../../types/payment.types';
import Spinner from '../../components/Spinner';

// ── helpers ──────────────────────────────────────────────────
const fmtDate = (s: string) => {
  if (!s) return '—';
  return new Date(s).toLocaleDateString('es-GT', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
};

const fmt = (n: number) =>
  new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(n);

// ── Modal de Crear / Editar ───────────────────────────────────
interface CouponModalProps {
  open:      boolean;
  editing:   Coupon | null;
  onClose:   () => void;
  onSaved:   () => void;
}

const defaultForm: CreateCouponInput = {
  code:              '',
  discount_type:     'PORCENTAJE',
  discount_value:    0,
  min_order_amount:  0,
  max_uses:          null,
  expires_at:        '',
};

const CouponModal: React.FC<CouponModalProps> = ({ open, editing, onClose, onSaved }) => {
  const [form, setForm]       = useState<CreateCouponInput>(defaultForm);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setForm({
        code:             editing.code,
        discount_type:    editing.discount_type,
        discount_value:   editing.discount_value,
        min_order_amount: editing.min_order_amount,
        max_uses:         editing.max_uses,
        expires_at:       editing.expires_at
          ? editing.expires_at.slice(0, 16)   // datetime-local format
          : '',
      });
    } else {
      setForm(defaultForm);
    }
    setError(null);
  }, [open, editing]);

  const set = (key: keyof CreateCouponInput, val: any) =>
    setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = async () => {
    if (!form.code.trim())      { setError('El código es obligatorio.');            return; }
    if (form.discount_value <= 0) { setError('El valor del descuento debe ser > 0.'); return; }
    if (form.discount_type === 'PORCENTAJE' && form.discount_value > 100) {
      setError('El porcentaje no puede superar 100.'); return;
    }

    try {
      setLoading(true);
      setError(null);
      if (editing) {
        const upd: UpdateCouponInput = {
          discount_value:   form.discount_value,
          min_order_amount: form.min_order_amount,
          max_uses:         form.max_uses,
          expires_at:       form.expires_at || undefined,
        };
        await couponService.update(editing.id, upd);
      } else {
        await couponService.create({
          ...form,
          expires_at: form.expires_at || undefined,
          max_uses:   form.max_uses || undefined,
        });
      }
      onSaved();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">

        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 rounded-xl p-2">
              <TagIcon className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-lg font-bold text-white">
              {editing ? 'Editar cupón' : 'Nuevo cupón'}
            </h2>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Código */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Código</label>
            <input
              type="text"
              value={form.code}
              onChange={e => set('code', e.target.value.toUpperCase())}
              disabled={!!editing}
              maxLength={50}
              placeholder="Ej: VERANO20"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl font-mono uppercase focus:border-violet-500 focus:ring-0 outline-none transition-colors disabled:bg-gray-100 disabled:text-gray-500"
            />
          </div>

          {/* Tipo de descuento */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tipo de descuento</label>
            <div className="flex gap-2">
              {(['PORCENTAJE', 'MONTO_FIJO'] as DiscountType[]).map(t => (
                <button
                  key={t}
                  onClick={() => set('discount_type', t)}
                  disabled={!!editing}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all flex items-center justify-center gap-2 ${
                    form.discount_type === t
                      ? 'border-violet-600 bg-violet-600 text-white'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300 disabled:opacity-50'
                  }`}
                >
                  {t === 'PORCENTAJE' ? <PercentBadgeIcon className="h-4 w-4" /> : <CurrencyDollarIcon className="h-4 w-4" />}
                  {t === 'PORCENTAJE' ? 'Porcentaje' : 'Monto fijo'}
                </button>
              ))}
            </div>
          </div>

          {/* Valor */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                {form.discount_type === 'PORCENTAJE' ? 'Porcentaje (%)' : 'Monto fijo (Q)'}
              </label>
              <input
                type="number"
                min="0.01"
                max={form.discount_type === 'PORCENTAJE' ? 100 : undefined}
                step="0.01"
                value={form.discount_value || ''}
                onChange={e => set('discount_value', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-violet-500 focus:ring-0 outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mínimo de orden (Q)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.min_order_amount || ''}
                onChange={e => set('min_order_amount', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-violet-500 focus:ring-0 outline-none transition-colors"
              />
            </div>
          </div>

          {/* Usos máximos y expiración */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Usos máximos <span className="text-gray-400 font-normal">(vacío = ilimitado)</span>
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={form.max_uses ?? ''}
                onChange={e => set('max_uses', e.target.value ? parseInt(e.target.value) : null)}
                placeholder="Ilimitado"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-violet-500 focus:ring-0 outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Expira el</label>
              <input
                type="datetime-local"
                value={form.expires_at ?? ''}
                onChange={e => set('expires_at', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-violet-500 focus:ring-0 outline-none transition-colors"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-rose-600 bg-rose-50 px-4 py-3 rounded-xl text-sm">
              <ExclamationCircleIcon className="h-5 w-5 flex-shrink-0" />{error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-bold hover:from-violet-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-violet-200"
          >
            {loading ? <Spinner size="sm" /> : (editing ? 'Guardar cambios' : 'Crear cupón')}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Página principal ─────────────────────────────────────────
const AdminCoupons: React.FC = () => {
  const [coupons, setCoupons]     = useState<Coupon[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]     = useState<Coupon | null>(null);
  const [deleting, setDeleting]   = useState<string | null>(null);
  const [page, setPage]           = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const LIMIT = 12;

  const load = async (p: number) => {
    try {
      setLoading(true);
      const res = await couponService.listAll(p, LIMIT);
      setCoupons(res.coupons);
      setTotalPages(Math.ceil(res.total / LIMIT) || 1);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar cupones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(page); }, [page]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Eliminar este cupón? Esta acción no se puede deshacer.')) return;
    try {
      setDeleting(id);
      await couponService.delete(id);
      await load(page);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al eliminar');
    } finally {
      setDeleting(null);
    }
  };

  const openCreate = () => { setEditing(null); setShowModal(true); };
  const openEdit   = (c: Coupon) => { setEditing(c); setShowModal(true); };

  return (
    <>
      <CouponModal
        open={showModal}
        editing={editing}
        onClose={() => setShowModal(false)}
        onSaved={() => load(page)}
      />

      <div className="min-h-screen bg-gray-50">
        {/* Banner */}
        <div className="bg-gradient-to-br from-violet-700 via-violet-600 to-indigo-600 pb-28">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white">Gestión de Cupones</h1>
                <p className="text-violet-200 mt-1 text-sm">Crea y administra descuentos para tus clientes</p>
              </div>
              <button
                onClick={openCreate}
                className="flex items-center gap-2 bg-white text-violet-700 px-5 py-3 rounded-2xl font-bold text-sm shadow-lg hover:bg-violet-50 active:scale-95 transition-all"
              >
                <PlusIcon className="h-5 w-5" />
                Nuevo cupón
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 pb-16 space-y-5">

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-20"><Spinner size="lg" /></div>
          ) : coupons.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-16 text-center">
              <TagIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No hay cupones registrados</p>
              <button onClick={openCreate}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700">
                <PlusIcon className="h-4 w-4" />Crear el primero
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {coupons.map(c => {
                const isExpired  = c.expires_at && new Date(c.expires_at) < new Date();
                const isFull     = c.max_uses !== null && c.max_uses > 0 && c.current_uses >= c.max_uses;
                const statusBad  = !c.is_active || isExpired || isFull;

                return (
                  <div key={c.id}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">

                    {/* Status bar */}
                    <div className={`h-1.5 w-full ${statusBad ? 'bg-rose-400' : 'bg-emerald-400'}`} />

                    <div className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-lg text-gray-900 tracking-wider">
                              {c.code}
                            </span>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                              statusBad ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                            }`}>
                              {statusBad
                                ? <><XCircleIcon className="h-3 w-3" />{isExpired ? 'Expirado' : isFull ? 'Agotado' : 'Inactivo'}</>
                                : <><CheckCircleIcon className="h-3 w-3" />Activo</>
                              }
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-1">
                            {c.discount_type === 'PORCENTAJE'
                              ? <PercentBadgeIcon className="h-4 w-4 text-violet-500" />
                              : <CurrencyDollarIcon className="h-4 w-4 text-violet-500" />
                            }
                            <span className="text-violet-700 font-bold text-sm">
                              {c.discount_type === 'PORCENTAJE'
                                ? `${c.discount_value}% de descuento`
                                : `${fmt(c.discount_value)} de descuento`
                              }
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Detalles */}
                      <div className="space-y-1.5 text-xs text-gray-500">
                        <div className="flex items-center justify-between">
                          <span>Mínimo de orden</span>
                          <span className="font-semibold text-gray-700">
                            {c.min_order_amount > 0 ? fmt(c.min_order_amount) : '—'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Usos</span>
                          <span className="font-semibold text-gray-700">
                            {c.current_uses} / {c.max_uses ?? '∞'}
                          </span>
                        </div>
                        {c.expires_at && (
                          <div className="flex items-center gap-1">
                            <ClockIcon className="h-3.5 w-3.5" />
                            <span className={isExpired ? 'text-rose-600 font-medium' : ''}>
                              Expira: {fmtDate(c.expires_at)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Acciones */}
                      <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                        <button
                          onClick={() => openEdit(c)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                        >
                          <PencilSquareIcon className="h-4 w-4" />Editar
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          disabled={deleting === c.id}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-rose-600 bg-rose-50 rounded-xl hover:bg-rose-100 transition-colors disabled:opacity-50"
                        >
                          {deleting === c.id
                            ? <Spinner size="sm" />
                            : <><TrashIcon className="h-4 w-4" />Eliminar</>
                          }
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Página <span className="font-semibold">{page}</span> de{' '}
                <span className="font-semibold">{totalPages}</span>
              </p>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-3 py-1.5 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
                  Anterior
                </button>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="px-3 py-1.5 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminCoupons;
