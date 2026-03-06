// ─────────────────────────────────────────────────────────────
// Ports: repositorios de dominio (DIP)
// ─────────────────────────────────────────────────────────────

import { Wallet }             from '../entities/Wallet';
import { WalletTransaction }  from '../entities/WalletTransaction';
import { Coupon }             from '../entities/Coupon';
import { Payment, PaymentStatus } from '../entities/Payment';

// ── Paginación genérica ───────────────────────────────────────
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page:  number;
  limit: number;
}

// ── WalletRepository ─────────────────────────────────────────
export interface WalletRepository {
  save(wallet: Wallet): Promise<void>;
  update(wallet: Wallet): Promise<void>;
  findById(id: string): Promise<Wallet | null>;
  findByUserId(userId: string): Promise<Wallet | null>;
}

// ── WalletTransactionRepository ──────────────────────────────
export interface WalletTransactionRepository {
  save(tx: WalletTransaction): Promise<void>;
  findByWalletId(
    walletId: string,
    page: number,
    limit: number,
  ): Promise<PaginatedResult<WalletTransaction>>;
}

// ── CouponRepository ─────────────────────────────────────────
export interface CouponRepository {
  save(coupon: Coupon): Promise<void>;
  update(coupon: Coupon): Promise<void>;
  findById(id: string): Promise<Coupon | null>;
  findByCode(code: string): Promise<Coupon | null>;
  findAll(page: number, limit: number): Promise<PaginatedResult<Coupon>>;
  delete(id: string): Promise<void>;
}

// ── PaymentRepository ────────────────────────────────────────
export interface PaymentFindAllParams {
  page:       number;
  limit:      number;
  userId?:    string;
  status?:    PaymentStatus;
}

export interface PaymentRepository {
  save(payment: Payment): Promise<void>;
  update(payment: Payment): Promise<void>;
  findById(id: string): Promise<Payment | null>;
  findByOrderId(orderId: string): Promise<Payment | null>;
  findAll(params: PaymentFindAllParams): Promise<PaginatedResult<Payment>>;
}

// ── Tokens de inyección ───────────────────────────────────────
export const WALLET_REPOSITORY              = 'WALLET_REPOSITORY';
export const WALLET_TRANSACTION_REPOSITORY  = 'WALLET_TRANSACTION_REPOSITORY';
export const COUPON_REPOSITORY              = 'COUPON_REPOSITORY';
export const PAYMENT_REPOSITORY             = 'PAYMENT_REPOSITORY';
