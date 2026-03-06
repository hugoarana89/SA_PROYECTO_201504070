// ─────────────────────────────────────────────────────────────
// Types: payment.types.ts
// ─────────────────────────────────────────────────────────────

export type TransactionType = 'RECARGA' | 'PAGO' | 'REEMBOLSO';
export type DiscountType    = 'PORCENTAJE' | 'MONTO_FIJO';
export type PaymentMethod   = 'TARJETA_CREDITO' | 'TARJETA_DEBITO' | 'CARTERA_DIGITAL';
export type PaymentStatus   = 'PENDIENTE' | 'PAGADO' | 'FALLIDO' | 'REEMBOLSADO';

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

export interface TransactionsResponse {
  transactions: WalletTransaction[];
  total:        number;
  page:         number;
  limit:        number;
}

export interface Coupon {
  id:               string;
  code:             string;
  discount_type:    DiscountType;
  discount_value:   number;
  min_order_amount: number;
  max_uses:         number | null;
  current_uses:     number;
  expires_at:       string;
  is_active:        boolean;
  created_at:       string;
}

export interface CouponsResponse {
  coupons: Coupon[];
  total:   number;
  page:    number;
  limit:   number;
}

export interface CouponValidation {
  coupon:          Coupon;
  discount_amount: number;
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

export interface PaymentsResponse {
  payments: Payment[];
  total:    number;
  page:     number;
  limit:    number;
}

export interface CreatePaymentInput {
  order_id:     string;
  method:       PaymentMethod;
  amount:       number;
  coupon_code?: string;
}

export interface CreateCouponInput {
  code:              string;
  discount_type:     DiscountType;
  discount_value:    number;
  min_order_amount?: number;
  max_uses?:         number | null;
  expires_at?:       string;
}

export interface UpdateCouponInput {
  discount_value?:   number;
  min_order_amount?: number;
  max_uses?:         number | null;
  expires_at?:       string;
  is_active?:        boolean;
}
