import React, { useState, useEffect } from 'react';
import {
  CreditCardIcon,
  WalletIcon,
  TagIcon,
  CheckCircleIcon,
  XMarkIcon,
  ExclamationCircleIcon,
  ArrowRightIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';
import { walletService, couponService, paymentService } from '../../services/payment.service';
import type { Wallet, PaymentMethod, CouponValidation } from '../../types/payment.types';
import Spinner from '../../components/Spinner';

// ── tipos ────────────────────────────────────────────────────
interface CheckoutModalProps {
  open:       boolean;
  onClose:    () => void;
  onSuccess:  () => void;
  orderId:    string;
  amount:     number;       // monto original de la orden
}

const METHOD_OPTIONS: { value: PaymentMethod; label: string; icon: any; desc: string }[] = [
  { value: 'TARJETA_CREDITO',  label: 'Tarjeta de crédito',  icon: CreditCardIcon, desc: 'Pago simulado' },
  { value: 'TARJETA_DEBITO',   label: 'Tarjeta de débito',   icon: CreditCardIcon, desc: 'Pago simulado' },
  { value: 'CARTERA_DIGITAL',  label: 'Cartera digital',     icon: WalletIcon,     desc: 'Saldo de tu cartera' },
];

const fmt = (n: number) =>
  new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(n);

// ── componente ───────────────────────────────────────────────
const CheckoutModal: React.FC<CheckoutModalProps> = ({
  open, onClose, onSuccess, orderId, amount,
}) => {
  const [method, setMethod]             = useState<PaymentMethod>('TARJETA_CREDITO');
  const [couponCode, setCouponCode]     = useState('');
  const [couponResult, setCouponResult] = useState<CouponValidation | null>(null);
  const [couponError, setCouponError]   = useState<string | null>(null);
  const [validatingCoupon, setVC]       = useState(false);
  const [wallet, setWallet]             = useState<Wallet | null>(null);
  const [loadingWallet, setLW]          = useState(false);
  const [processing, setProcessing]     = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [success, setSuccess]           = useState(false);

  // Cargar wallet cuando se selecciona cartera digital
  useEffect(() => {
    if (method === 'CARTERA_DIGITAL' && !wallet) {
      setLW(true);
      walletService.getMyWallet()
        .then(r => setWallet(r.wallet))
        .catch(() => {})
        .finally(() => setLW(false));
    }
  }, [method, wallet]);

  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      setVC(true);
      setCouponError(null);
      const result = await couponService.validate(couponCode.trim(), amount);
      setCouponResult(result);
    } catch (e) {
      setCouponError(e instanceof Error ? e.message : 'Cupón inválido');
      setCouponResult(null);
    } finally {
      setVC(false);
    }
  };

  const removeCoupon = () => {
    setCouponResult(null);
    setCouponCode('');
    setCouponError(null);
  };

  const discount        = couponResult?.discount_amount ?? 0;
  const finalAmount     = Math.max(0, amount - discount);
  const insufficientBal = method === 'CARTERA_DIGITAL' && wallet && wallet.balance < finalAmount;

  const handlePay = async () => {
    if (insufficientBal) { setError('Saldo insuficiente en tu cartera.'); return; }
    try {
      setProcessing(true);
      setError(null);
      const result = await paymentService.create({
        order_id:    orderId,
        method,
        amount,
        coupon_code: couponResult ? couponCode.trim() : undefined,
      });

      await paymentService.updateStatus(result.payment.id, 'PAGADO'); // Simulamos que el pago se procesa instantáneamente

      setSuccess(true);
      setTimeout(() => { onSuccess(); onClose(); }, 2200);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al procesar el pago');
    } finally {
      setProcessing(false);
    }
  };

  const handleClose = () => {
    if (processing) return;
    setMethod('TARJETA_CREDITO'); setCouponCode(''); setCouponResult(null);
    setCouponError(null); setError(null); setSuccess(false);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 rounded-xl p-2">
              <LockClosedIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Pago seguro</h2>
              <p className="text-slate-400 text-xs">Procesamiento simulado</p>
            </div>
          </div>
          <button onClick={handleClose} disabled={processing}
            className="text-slate-400 hover:text-white transition-colors disabled:opacity-40">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {success ? (
          <div className="py-16 text-center px-6">
            <CheckCircleIcon className="h-20 w-20 text-emerald-500 mx-auto mb-4" />
            <p className="text-2xl font-black text-gray-900">¡Pago procesado!</p>
            <p className="text-gray-500 mt-2">Tu pago de {fmt(finalAmount)} fue registrado correctamente.</p>
          </div>
        ) : (
          <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">

            {/* Resumen de orden */}
            <div className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Orden</p>
                <p className="font-mono text-sm text-gray-800 font-semibold">#{orderId.slice(0, 8)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total</p>
                <p className="text-xl font-black text-gray-900">{fmt(amount)}</p>
              </div>
            </div>

            {/* Método de pago */}
            <div>
              <p className="text-sm font-bold text-gray-700 mb-2">Método de pago</p>
              <div className="space-y-2">
                {METHOD_OPTIONS.map(opt => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setMethod(opt.value)}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                        method === opt.value
                          ? 'border-indigo-600 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className={`p-2 rounded-xl ${method === opt.value ? 'bg-indigo-100' : 'bg-gray-100'}`}>
                        <Icon className={`h-5 w-5 ${method === opt.value ? 'text-indigo-600' : 'text-gray-500'}`} />
                      </div>
                      <div className="flex-1">
                        <p className={`font-semibold text-sm ${method === opt.value ? 'text-indigo-900' : 'text-gray-800'}`}>
                          {opt.label}
                        </p>
                        <p className="text-xs text-gray-400">{opt.desc}</p>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                        method === opt.value ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300'
                      }`}>
                        {method === opt.value && <div className="w-2 h-2 bg-white rounded-full m-0.5" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Saldo de cartera */}
              {method === 'CARTERA_DIGITAL' && (
                <div className={`mt-3 px-4 py-3 rounded-xl text-sm ${
                  loadingWallet ? 'bg-gray-50' :
                  insufficientBal ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
                }`}>
                  {loadingWallet ? (
                    <div className="flex items-center gap-2 text-gray-500"><Spinner size="sm" /> Cargando saldo...</div>
                  ) : wallet ? (
                    <>
                      <span className="font-bold">Saldo disponible: {fmt(wallet.balance)}</span>
                      {insufficientBal && <span className="block mt-0.5 text-xs">Saldo insuficiente para esta orden.</span>}
                    </>
                  ) : (
                    <span className="text-gray-500">No se pudo cargar el saldo.</span>
                  )}
                </div>
              )}
            </div>

            {/* Cupón */}
            <div>
              <p className="text-sm font-bold text-gray-700 mb-2">Cupón de descuento</p>
              {couponResult ? (
                <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                  <TagIcon className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-bold text-emerald-800 text-sm">{couponResult.coupon.code}</p>
                    <p className="text-emerald-600 text-xs">
                      Descuento aplicado: {fmt(couponResult.discount_amount)}
                    </p>
                  </div>
                  <button onClick={removeCoupon} className="text-emerald-500 hover:text-emerald-700">
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ingresa tu código"
                    value={couponCode}
                    onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponError(null); }}
                    className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm font-mono uppercase focus:border-indigo-500 focus:ring-0 outline-none transition-colors"
                  />
                  <button
                    onClick={handleValidateCoupon}
                    disabled={!couponCode.trim() || validatingCoupon}
                    className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
                  >
                    {validatingCoupon ? <Spinner size="sm" /> : 'Aplicar'}
                  </button>
                </div>
              )}
              {couponError && (
                <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1">
                  <ExclamationCircleIcon className="h-4 w-4" />{couponError}
                </p>
              )}
            </div>

            {/* Resumen de cobro */}
            <div className="bg-gray-50 rounded-2xl p-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span><span>{fmt(amount)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Descuento</span><span>−{fmt(discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-black text-gray-900 text-base pt-2 border-t border-gray-200">
                <span>Total a pagar</span><span>{fmt(finalAmount)}</span>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-rose-600 bg-rose-50 px-4 py-3 rounded-xl text-sm">
                <ExclamationCircleIcon className="h-5 w-5 flex-shrink-0" />{error}
              </div>
            )}

            {/* Botón de pago */}
            <button
              onClick={handlePay}
              disabled={processing || !!insufficientBal}
              className="w-full py-4 bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-xl font-bold text-base hover:from-slate-900 hover:to-black disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              {processing ? <Spinner size="sm" /> : (
                <>
                  <LockClosedIcon className="h-5 w-5" />
                  Pagar {fmt(finalAmount)}
                  <ArrowRightIcon className="h-5 w-5" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutModal;
