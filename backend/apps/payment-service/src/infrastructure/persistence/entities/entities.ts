// ─────────────────────────────────────────────────────────────
// Infrastructure: TypeORM Entities
// SRP: solo mapean tablas ↔ TypeORM, sin lógica de negocio.
// ─────────────────────────────────────────────────────────────

import {
  Column, CreateDateColumn, Entity, Index,
  ManyToOne, JoinColumn, PrimaryColumn, UpdateDateColumn,
} from 'typeorm';
import { TransactionType }    from '../../../domain/entities/WalletTransaction';
import { DiscountType }       from '../../../domain/entities/Coupon';
import { PaymentMethod, PaymentStatus } from '../../../domain/entities/Payment';

// ── Wallet ────────────────────────────────────────────────────
@Entity('wallets')
export class WalletEntity {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string;

  @Index('idx_user_id', { unique: true })
  @Column({ name: 'user_id', type: 'varchar', length: 36, unique: true, comment: 'Referencia lógica al usuario en auth_db' })
  userId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  balance: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

// ── WalletTransaction ─────────────────────────────────────────
@Entity('wallet_transactions')
export class WalletTransactionEntity {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string;

  @Index('idx_wallet_id')
  @Column({ name: 'wallet_id', type: 'varchar', length: 36 })
  walletId: string;

  @Index('idx_type')
  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => WalletEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'wallet_id' })
  wallet: WalletEntity;
}

// ── Coupon ────────────────────────────────────────────────────
@Entity('coupons')
export class CouponEntity {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string;

  @Index('idx_code', { unique: true })
  @Column({ type: 'varchar', length: 50, unique: true })
  code: string;

  @Column({ name: 'discount_type', type: 'enum', enum: DiscountType })
  discountType: DiscountType;

  @Column({ name: 'discount_value', type: 'decimal', precision: 10, scale: 2 })
  discountValue: number;

  @Column({ name: 'min_order_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  minOrderAmount: number;

  @Column({ name: 'max_uses', type: 'int', nullable: true, comment: 'NULL = usos ilimitados' })
  maxUses: number | null;

  @Column({ name: 'current_uses', type: 'int', default: 0 })
  currentUses: number;

  @Index('idx_expires_at')
  @Column({ name: 'expires_at', type: 'datetime', nullable: true })
  expiresAt: Date | null;

  @Index('idx_is_active')
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

// ── Payment ───────────────────────────────────────────────────
@Entity('payments')
export class PaymentEntity {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string;

  @Index('idx_order_id', { unique: true })
  @Column({ name: 'order_id', type: 'varchar', length: 36, unique: true, comment: 'Referencia lógica a la orden en order_db' })
  orderId: string;

  @Index('idx_user_id')
  @Column({ name: 'user_id', type: 'varchar', length: 36, comment: 'Referencia lógica al usuario en auth_db' })
  userId: string;

  @Column({ type: 'enum', enum: PaymentMethod })
  method: PaymentMethod;

  @Index('idx_status')
  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDIENTE })
  status: PaymentStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ name: 'coupon_id', type: 'varchar', length: 36, nullable: true })
  couponId: string | null;

  @Column({ name: 'discount_applied', type: 'decimal', precision: 10, scale: 2, default: 0 })
  discountApplied: number;

  @Column({ name: 'final_amount', type: 'decimal', precision: 10, scale: 2 })
  finalAmount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => CouponEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'coupon_id' })
  coupon: CouponEntity;
}
