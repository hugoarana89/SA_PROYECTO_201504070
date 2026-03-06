import React, { useState, useEffect, useCallback } from 'react';
import {
  WalletIcon,
  ArrowUpCircleIcon,
  ArrowDownCircleIcon,
  ArrowPathIcon,
  PlusCircleIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  BanknotesIcon,
  CreditCardIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { walletService } from '../../services/payment.service';
import type { Wallet, WalletTransaction } from '../../types/payment.types';
import Spinner from '../../components/Spinner';

// ── helpers ──────────────────────────────────────────────────
const TXN_CONFIG: Record<string, { icon: any; color: string; label: string; sign: string }> = {
  RECARGA:   { icon: ArrowUpCircleIcon,   color: 'text-emerald-600', label: 'Recarga',   sign: '+' },
  PAGO:      { icon: ArrowDownCircleIcon, color: 'text-rose-600',    label: 'Pago',      sign: '−' },
  REEMBOLSO: { icon: ArrowPathIcon,       color: 'text-sky-600',     label: 'Reembolso', sign: '+' },
};

const PRESET_AMOUNTS = [25, 50, 100, 200, 500];

const fmt = (n: number) =>
  new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(n);

const fmtDate = (s: string) =>
  new Date(s).toLocaleDateString('es-GT', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

// ── Modal de Recarga ─────────────────────────────────────────
interface RechargeModalProps {
  open:     boolean;
  onClose:  () => void;
  onSuccess: (wallet: Wallet) => void;
}

const RechargeModal: React.FC<RechargeModalProps> = ({ open, onClose, onSuccess }) => {
  const [amount, setAmount]       = useState('');
  const [description, setDesc]    = useState('');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [success, setSuccess]     = useState(false);

  const reset = () => { setAmount(''); setDesc(''); setError(null); setSuccess(false); };

  const handleClose = () => { reset(); onClose(); };

  const handleSubmit = async () => {
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) { setError('Ingresa un monto válido mayor a 0.'); return; }
    if (num > 10000) { setError('El monto máximo de recarga es Q10,000.'); return; }
    try {
      setLoading(true);
      setError(null);
      const res = await walletService.recharge(num, description || undefined);
      setSuccess(true);
      onSuccess(res.wallet);
      setTimeout(() => handleClose(), 1800);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al recargar');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-xl p-2">
                <BanknotesIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Recargar Cartera</h2>
                <p className="text-indigo-200 text-sm">Fondos disponibles al instante</p>
              </div>
            </div>
            <button onClick={handleClose} className="text-white/70 hover:text-white transition-colors">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {success ? (
            <div className="text-center py-6">
              <CheckCircleIcon className="h-16 w-16 text-emerald-500 mx-auto mb-3" />
              <p className="text-xl font-bold text-gray-900">¡Recarga exitosa!</p>
              <p className="text-gray-500 mt-1">Tu saldo ha sido actualizado.</p>
            </div>
          ) : (
            <>
              {/* Montos rápidos */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Montos rápidos</p>
                <div className="flex flex-wrap gap-2">
                  {PRESET_AMOUNTS.map(p => (
                    <button
                      key={p}
                      onClick={() => setAmount(String(p))}
                      className={`px-3 py-1.5 rounded-lg text-sm font-semibold border-2 transition-all ${
                        amount === String(p)
                          ? 'border-indigo-600 bg-indigo-600 text-white'
                          : 'border-gray-200 text-gray-700 hover:border-indigo-300'
                      }`}
                    >
                      Q{p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Monto personalizado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Monto a recargar (Q)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">Q</span>
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    step="0.01"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-0 text-lg font-semibold outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Descripción <span className="text-gray-400 font-normal">(opcional)</span>
                </label>
                <input
                  type="text"
                  maxLength={255}
                  value={description}
                  onChange={e => setDesc(e.target.value)}
                  placeholder="Ej: Recarga de saldo mensual"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-0 outline-none transition-colors"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-rose-600 bg-rose-50 px-4 py-3 rounded-xl text-sm">
                  <ExclamationCircleIcon className="h-5 w-5 flex-shrink-0" />
                  {error}
                </div>
              )}

              {/* Botón */}
              <button
                onClick={handleSubmit}
                disabled={loading || !amount}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-bold text-base hover:from-indigo-700 hover:to-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
              >
                {loading ? <Spinner size="sm" /> : (
                  <>
                    <PlusCircleIcon className="h-5 w-5" />
                    Recargar {amount ? fmt(parseFloat(amount) || 0) : ''}
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Componente principal ─────────────────────────────────────
const MyWallet: React.FC = () => {
  const [wallet, setWallet]           = useState<Wallet | null>(null);
  const [transactions, setTxns]       = useState<WalletTransaction[]>([]);
  const [loadingWallet, setLoadingW]  = useState(true);
  const [loadingTxns, setLoadingT]    = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [showRecharge, setShowRecharge] = useState(false);
  const [page, setPage]               = useState(1);
  const [totalPages, setTotalPages]   = useState(1);
  const LIMIT = 8;

  const loadWallet = useCallback(async () => {
    try {
      setLoadingW(true);
      const res = await walletService.getMyWallet();
      setWallet(res.wallet);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar la cartera');
    } finally {
      setLoadingW(false);
    }
  }, []);

  const loadTransactions = useCallback(async (walletId: string, p: number) => {
    try {
      setLoadingT(true);
      const res = await walletService.listTransactions(walletId, p, LIMIT);
      setTxns(res.transactions);
      setTotalPages(Math.ceil(res.total / LIMIT) || 1);
    } catch {
      // silencioso — la cartera ya se muestra
    } finally {
      setLoadingT(false);
    }
  }, []);

  useEffect(() => { loadWallet(); }, [loadWallet]);

  useEffect(() => {
    if (wallet) loadTransactions(wallet.id, page);
  }, [wallet, page, loadTransactions]);

  const handleRechargeSuccess = (updated: Wallet) => {
    setWallet(updated);
    if (wallet) loadTransactions(wallet.id, 1);
    setPage(1);
  };

  if (loadingWallet) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error && !wallet) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationCircleIcon className="h-12 w-12 text-rose-400 mx-auto mb-3" />
          <p className="text-gray-700 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <RechargeModal
        open={showRecharge}
        onClose={() => setShowRecharge(false)}
        onSuccess={handleRechargeSuccess}
      />

      <div className="min-h-screen bg-gray-50">
        {/* Hero banner */}
        <div className="bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-600 pb-28">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
            <h1 className="text-3xl font-bold text-white">Mi Cartera Digital</h1>
            <p className="text-indigo-200 mt-1 text-sm">Gestiona tu saldo y movimientos</p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 pb-16 space-y-6">

          {/* Card de balance */}
          {wallet && (
            <div className="relative bg-gradient-to-br from-indigo-900 to-violet-900 rounded-3xl shadow-2xl shadow-indigo-900/40 overflow-hidden">
              {/* decoración */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

              <div className="relative p-8">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <WalletIcon className="h-5 w-5 text-indigo-300" />
                      <span className="text-indigo-300 text-sm font-medium uppercase tracking-widest">Saldo disponible</span>
                    </div>
                    <p className="text-5xl font-black text-white mt-2 tracking-tight">
                      {fmt(wallet.balance)}
                    </p>
                    <p className="text-indigo-300 text-xs mt-3">
                      Actualizado: {fmtDate(wallet.updated_at)}
                    </p>
                  </div>

                  <button
                    onClick={() => setShowRecharge(true)}
                    className="flex items-center gap-2 bg-white text-indigo-700 px-5 py-3 rounded-2xl font-bold text-sm shadow-lg hover:bg-indigo-50 active:scale-95 transition-all"
                  >
                    <PlusCircleIcon className="h-5 w-5" />
                    Recargar
                  </button>
                </div>

                {/* ID de cartera */}
                <div className="mt-6 pt-4 border-t border-white/10">
                  <p className="text-indigo-400 text-xs font-mono">
                    ID: {wallet.id}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Transacciones */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ClockIcon className="h-5 w-5 text-gray-400" />
                <h2 className="text-base font-bold text-gray-900">Historial de movimientos</h2>
              </div>
              {loadingTxns && <Spinner size="sm" />}
            </div>

            {transactions.length === 0 && !loadingTxns ? (
              <div className="text-center py-16">
                <CreditCardIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">Sin movimientos aún</p>
                <p className="text-gray-400 text-sm mt-1">Recarga tu cartera para empezar</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-50">
                {transactions.map(tx => {
                  const cfg = TXN_CONFIG[tx.type] ?? TXN_CONFIG.PAGO;
                  const Icon = cfg.icon;
                  const isPositive = tx.type === 'RECARGA' || tx.type === 'REEMBOLSO';

                  return (
                    <li key={tx.id} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                      <div className={`p-2.5 rounded-xl bg-gray-100 ${cfg.color} flex-shrink-0`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm">{cfg.label}</p>
                        {tx.description && (
                          <p className="text-gray-400 text-xs truncate mt-0.5">{tx.description}</p>
                        )}
                        <p className="text-gray-400 text-xs mt-0.5">{fmtDate(tx.created_at)}</p>
                      </div>
                      <span className={`font-bold text-base flex-shrink-0 ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {cfg.sign}{fmt(tx.amount)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Página <span className="font-semibold">{page}</span> de{' '}
                  <span className="font-semibold">{totalPages}</span>
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1.5 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default MyWallet;
