import React, { useState, useEffect } from 'react';
import {
  BanknotesIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  CreditCardIcon,
  WalletIcon,
  TagIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import { paymentService } from '../../services/payment.service';
import type { Payment, PaymentStatus } from '../../types/payment.types';
import Spinner from '../../components/Spinner';

// ── config ───────────────────────────────────────────────────
const STATUS_CFG: Record<PaymentStatus, { icon: any; bg: string; text: string; label: string }> = {
  PENDIENTE:   { icon: ClockIcon,        bg: 'bg-amber-100',   text: 'text-amber-800',  label: 'Pendiente'   },
  PAGADO:      { icon: CheckCircleIcon,  bg: 'bg-emerald-100', text: 'text-emerald-800',label: 'Pagado'      },
  FALLIDO:     { icon: XCircleIcon,      bg: 'bg-rose-100',    text: 'text-rose-800',   label: 'Fallido'     },
  REEMBOLSADO: { icon: ArrowPathIcon,    bg: 'bg-sky-100',     text: 'text-sky-800',    label: 'Reembolsado' },
};

const METHOD_LABEL: Record<string, { icon: any; label: string }> = {
  TARJETA_CREDITO: { icon: CreditCardIcon, label: 'Tarjeta crédito' },
  TARJETA_DEBITO:  { icon: CreditCardIcon, label: 'Tarjeta débito'  },
  CARTERA_DIGITAL: { icon: WalletIcon,     label: 'Cartera digital' },
};

const fmt = (n: number) =>
  new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(n);

const fmtDate = (s: string) =>
  new Date(s).toLocaleDateString('es-GT', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

// ── componente ───────────────────────────────────────────────
const MyPayments: React.FC = () => {
  const [payments, setPayments]     = useState<Payment[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [statusFilter, setStatus]   = useState<PaymentStatus | ''>('');
  const [page, setPage]             = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const LIMIT = 8;

  const load = async (p: number, st: string) => {
    try {
      setLoading(true);
      const res = await paymentService.listMine({ status: st || undefined, page: p, limit: LIMIT });
      setPayments(res.payments);
      setTotalPages(Math.ceil(res.total / LIMIT) || 1);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar pagos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(page, statusFilter); }, [page, statusFilter]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-700 pb-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
          <h1 className="text-3xl font-bold text-white">Mis Pagos</h1>
          <p className="text-slate-400 mt-1 text-sm">Historial de transacciones de tus órdenes</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 pb-16 space-y-5">

        {/* Filtros */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 flex-wrap">
          <FunnelIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
          <div>
            <p className="text-xs text-gray-500 font-medium mb-1.5">Estado</p>
            <div className="flex gap-2 flex-wrap">
              {(['', 'PENDIENTE', 'PAGADO', 'FALLIDO', 'REEMBOLSADO'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => { setStatus(s); setPage(1); }}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    statusFilter === s
                      ? 'bg-slate-800 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {s === '' ? 'Todos' : STATUS_CFG[s as PaymentStatus].label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Lista */}
        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : error ? (
          <div className="bg-rose-50 text-rose-700 px-4 py-3 rounded-xl text-sm">{error}</div>
        ) : payments.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-16 text-center">
            <BanknotesIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Sin pagos registrados</p>
          </div>
        ) : (
          <div className="space-y-3">
            {payments.map(p => {
              const sCfg   = STATUS_CFG[p.status];
              const mCfg   = METHOD_LABEL[p.method] ?? { icon: CreditCardIcon, label: p.method };
              const SIcon  = sCfg.icon;
              const MIcon  = mCfg.icon;

              return (
                <div key={p.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 flex items-start gap-4">
                    {/* Estado */}
                    <div className={`p-2.5 rounded-xl ${sCfg.bg} flex-shrink-0`}>
                      <SIcon className={`h-5 w-5 ${sCfg.text}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${sCfg.bg} ${sCfg.text}`}>
                          {sCfg.label}
                        </span>
                        <span className="text-gray-400 text-xs">#{p.id.slice(0,8)}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Orden: <span className="font-mono">{p.order_id.slice(0,8)}</span>
                      </p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <MIcon className="h-3.5 w-3.5 text-gray-400" />
                        <span className="text-xs text-gray-500">{mCfg.label}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{fmtDate(p.created_at)}</p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      {p.discount_applied > 0 && (
                        <div className="flex items-center gap-1 justify-end mb-0.5">
                          <TagIcon className="h-3.5 w-3.5 text-emerald-500" />
                          <span className="text-xs text-emerald-600 font-medium">−{fmt(p.discount_applied)}</span>
                        </div>
                      )}
                      <p className="text-lg font-black text-gray-900">{fmt(p.final_amount)}</p>
                      {p.discount_applied > 0 && (
                        <p className="text-xs text-gray-400 line-through">{fmt(p.amount)}</p>
                      )}
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
  );
};

export default MyPayments;
