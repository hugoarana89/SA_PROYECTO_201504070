// ─────────────────────────────────────────────────────────────
// GrpcInterface: payment.grpc.interface.ts (API Gateway)
// Espejo tipado del payment.proto — solo lo que el Gateway consume.
// ─────────────────────────────────────────────────────────────

import { Observable } from 'rxjs';

// ── Enums ─────────────────────────────────────────────────────
export type TransactionType = 'RECARGA' | 'PAGO' | 'REEMBOLSO';
export type DiscountType    = 'PORCENTAJE' | 'MONTO_FIJO';
export type PaymentMethod   = 'TARJETA_CREDITO' | 'TARJETA_DEBITO' | 'CARTERA_DIGITAL';
export type PaymentStatus   = 'PENDIENTE' | 'PAGADO' | 'FALLIDO' | 'REEMBOLSADO';

// ── Entities ──────────────────────────────────────────────────
export interface Wallet {
  id:         string;
  user_id:    string;
  balance:    number;
  created_at: string;
  updated_at: string;
}

export interface WalletTransaction {
  id:          string;
  wallet_id:   string;
  type:        TransactionType;
  amount:      number;
  description: string;
  created_at:  string;
}

export interface Coupon {
  id:               string;
  code:             string;
  discount_type:    DiscountType;
  discount_value:   number;
  min_order_amount: number;
  max_uses:         number;
  current_uses:     number;
  expires_at:       string;
  is_active:        boolean;
  created_at:       string;
}

export interface Payment {
  id:               string;
  order_id:         string;
  user_id:          string;
  method:           PaymentMethod;
  status:           PaymentStatus;
  amount:           number;
  coupon_id:        string;
  discount_applied: number;
  final_amount:     number;
  created_at:       string;
  updated_at:       string;
}

// ── Paginated wrappers ────────────────────────────────────────
export interface Paginated<T> { total: number; page: number; limit: number; items?: T[] }

// ── Contrato gRPC ─────────────────────────────────────────────
export interface PaymentGrpcService {
  // Wallet
  CreateWallet(data: { user_id: string }):                                           Observable<{ wallet: Wallet }>;
  GetWalletByUser(data: { user_id: string }):                                        Observable<{ wallet: Wallet }>;
  GetWalletById(data: { wallet_id: string }):                                        Observable<{ wallet: Wallet }>;
  RechargeWallet(data: { user_id: string; amount: number; description?: string }):   Observable<{ wallet: Wallet }>;
  ListTransactions(data: { wallet_id: string; page?: number; limit?: number }):      Observable<{ transactions: WalletTransaction[]; total: number; page: number; limit: number }>;

  // Coupon
  CreateCoupon(data: CreateCouponPayload):                                            Observable<{ coupon: Coupon }>;
  GetCouponById(data: { coupon_id: string }):                                        Observable<{ coupon: Coupon }>;
  GetCouponByCode(data: { code: string }):                                           Observable<{ coupon: Coupon }>;
  ListCoupons(data: { page?: number; limit?: number }):                              Observable<{ coupons: Coupon[]; total: number; page: number; limit: number }>;
  UpdateCoupon(data: UpdateCouponPayload):                                            Observable<{ coupon: Coupon }>;
  DeleteCoupon(data: { coupon_id: string }):                                         Observable<{ success: boolean; message: string }>;
  ValidateCoupon(data: { code: string; order_amount: number }):                      Observable<{ coupon: Coupon; discount_amount: number }>;

  // Payment
  CreatePayment(data: CreatePaymentPayload):                                          Observable<{ payment: Payment }>;
  GetPaymentById(data: { payment_id: string }):                                      Observable<{ payment: Payment }>;
  GetPaymentByOrder(data: { order_id: string }):                                     Observable<{ payment: Payment }>;
  ListPayments(data: { user_id?: string; status?: string; page?: number; limit?: number }): Observable<{ payments: Payment[]; total: number; page: number; limit: number }>;
  UpdatePaymentStatus(data: { payment_id: string; status: string }):                Observable<{ payment: Payment }>;
}

export interface CreateCouponPayload {
  code:             string;
  discount_type:    DiscountType;
  discount_value:   number;
  min_order_amount?: number;
  max_uses?:         number;
  expires_at?:       string;
}

export interface UpdateCouponPayload {
  coupon_id:        string;
  discount_value?:  number;
  min_order_amount?: number;
  max_uses?:         number;
  expires_at?:       string;
  is_active?:        boolean;
}

export interface CreatePaymentPayload {
  order_id:     string;
  user_id:      string;
  method:       PaymentMethod;
  amount:       number;
  coupon_code?: string;
}
