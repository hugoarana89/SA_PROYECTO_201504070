// ─────────────────────────────────────────────────────────────
// Service: payment.service.ts
// Consume la API del API Gateway para el módulo de pagos.
// ─────────────────────────────────────────────────────────────

import { authFetch } from '../utils/authFetch';
import { CONFIG }    from '../config/config';
import type {
  Wallet, TransactionsResponse,
  Coupon, CouponsResponse, CouponValidation,
  Payment, PaymentsResponse,
  CreatePaymentInput, CreateCouponInput, UpdateCouponInput,
} from '../types/payment.types';

const BASE = `${CONFIG.API_URL}/payment`;

// ── helpers ───────────────────────────────────────────────────
async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
}

// ══════════════════════════════════════════════════════════════
// WALLET
// ══════════════════════════════════════════════════════════════
export const walletService = {

  /** Crea una nueva cartera (llamar al registrarse / primer login) */
  async create(): Promise<{ wallet: Wallet }> {
    const res = await authFetch(`${BASE}/wallet`, { method: 'POST' });
    return handle(res);
  },

  /** Obtiene la cartera del usuario autenticado */
  async getMyWallet(): Promise<{ wallet: Wallet }> {
    const res = await authFetch(`${BASE}/wallet/me`);
    return handle(res);
  },

  /** Recarga saldo */
  async recharge(amount: number, description?: string): Promise<{ wallet: Wallet }> {
    const res = await authFetch(`${BASE}/wallet/recharge`, {
      method: 'POST',
      body:   JSON.stringify({ amount, description }),
    });
    return handle(res);
  },

  /** Lista transacciones de una cartera */
  async listTransactions(walletId: string, page = 1, limit = 10): Promise<TransactionsResponse> {
    const res = await authFetch(`${BASE}/wallet/${walletId}/transactions?page=${page}&limit=${limit}`);
    return handle(res);
  },
};

// ══════════════════════════════════════════════════════════════
// COUPONS
// ══════════════════════════════════════════════════════════════
export const couponService = {

  /** Crea un cupón (solo ADMINISTRADOR) */
  async create(data: CreateCouponInput): Promise<{ coupon: Coupon }> {
    const res = await authFetch(`${BASE}/coupons`, {
      method: 'POST',
      body:   JSON.stringify(data),
    });
    return handle(res);
  },

  /** Lista todos los cupones (ADMINISTRADOR) */
  async listAll(page = 1, limit = 20): Promise<CouponsResponse> {
    const res = await authFetch(`${BASE}/coupons?page=${page}&limit=${limit}`);
    return handle(res);
  },

  /** Busca cupón por código */
  async getByCode(code: string): Promise<{ coupon: Coupon }> {
    const res = await authFetch(`${BASE}/coupons/code/${encodeURIComponent(code)}`);
    return handle(res);
  },

  /** Valida un cupón contra un monto (CLIENTE) */
  async validate(code: string, orderAmount: number): Promise<CouponValidation> {
    const res = await authFetch(
      `${BASE}/coupons/validate?code=${encodeURIComponent(code)}&order_amount=${orderAmount}`,
    );
    return handle(res);
  },

  /** Actualiza un cupón (ADMINISTRADOR) */
  async update(couponId: string, data: UpdateCouponInput): Promise<{ coupon: Coupon }> {
    const res = await authFetch(`${BASE}/coupons/${couponId}`, {
      method: 'PUT',
      body:   JSON.stringify(data),
    });
    return handle(res);
  },

  /** Elimina un cupón (ADMINISTRADOR) */
  async delete(couponId: string): Promise<{ success: boolean; message: string }> {
    const res = await authFetch(`${BASE}/coupons/${couponId}`, { method: 'DELETE' });
    return handle(res);
  },
};

// ══════════════════════════════════════════════════════════════
// PAYMENTS
// ══════════════════════════════════════════════════════════════
export const paymentService = {

  /** Crea un pago para una orden (CLIENTE) */
  async create(data: CreatePaymentInput): Promise<{ payment: Payment }> {
    const res = await authFetch(`${BASE}/payments`, {
      method: 'POST',
      body:   JSON.stringify(data),
    });
    return handle(res);
  },

  /** Lista los pagos del usuario autenticado */
  async listMine(params?: { status?: string; page?: number; limit?: number }): Promise<PaymentsResponse> {
    const q = new URLSearchParams();
    if (params?.status) q.append('status', params.status);
    if (params?.page)   q.append('page',   String(params.page));
    if (params?.limit)  q.append('limit',  String(params.limit));
    const res = await authFetch(`${BASE}/payments${q.toString() ? `?${q}` : ''}`);
    return handle(res);
  },

  /** Obtiene el pago de una orden específica */
  async getByOrder(orderId: string): Promise<{ payment: Payment }> {
    const res = await authFetch(`${BASE}/payments/order/${orderId}`);
    return handle(res);
  },

  /** Obtiene un pago por ID */
  async getById(paymentId: string): Promise<{ payment: Payment }> {
    const res = await authFetch(`${BASE}/payments/${paymentId}`);
    return handle(res);
  },

  /** Actualiza el estado de un pago (ADMINISTRADOR, Cliente) */
  async updateStatus(paymentId: string, status: string): Promise<{ payment: Payment }> {
    const res = await authFetch(`${BASE}/payments/${paymentId}/status`, {
      method: 'PATCH',
      body:   JSON.stringify({ status }),
    });
    return handle(res);
  },
};
