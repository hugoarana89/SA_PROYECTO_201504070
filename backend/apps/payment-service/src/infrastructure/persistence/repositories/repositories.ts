// ─────────────────────────────────────────────────────────────
// Infrastructure: TypeORM Repositories
// LSP: Implementan completamente los contratos de dominio.
// SRP: Solo traducen entre entidades TypeORM y dominio.
// ─────────────────────────────────────────────────────────────

import { Injectable }       from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository }       from 'typeorm';

import { Wallet }           from '../../../domain/entities/Wallet';
import { WalletTransaction, TransactionType } from '../../../domain/entities/WalletTransaction';
import { Coupon, DiscountType }               from '../../../domain/entities/Coupon';
import { Payment, PaymentMethod, PaymentStatus } from '../../../domain/entities/Payment';
import {
  WalletRepository, WalletTransactionRepository,
  CouponRepository, PaymentRepository,
  PaginatedResult, PaymentFindAllParams,
} from '../../../domain/ports/repositories';
import {
  WalletEntity, WalletTransactionEntity,
  CouponEntity, PaymentEntity,
} from '../entities/entities';

// ── TypeOrmWalletRepository ───────────────────────────────────
@Injectable()
export class TypeOrmWalletRepository implements WalletRepository {
  constructor(@InjectRepository(WalletEntity) private readonly repo: Repository<WalletEntity>) {}

  private toDomain(e: WalletEntity): Wallet {
    return new Wallet({ id: e.id, userId: e.userId, balance: Number(e.balance), createdAt: e.createdAt, updatedAt: e.updatedAt });
  }

  private toEntity(w: Wallet): WalletEntity {
    const e = new WalletEntity();
    e.id        = w.id;
    e.userId    = w.userId;
    e.balance   = w.balance;
    e.createdAt = w.createdAt;
    e.updatedAt = w.updatedAt;
    return e;
  }

  async save(wallet: Wallet): Promise<void>   { await this.repo.save(this.toEntity(wallet)); }
  async update(wallet: Wallet): Promise<void> { await this.repo.save(this.toEntity(wallet)); }

  async findById(id: string): Promise<Wallet | null> {
    const e = await this.repo.findOneBy({ id });
    return e ? this.toDomain(e) : null;
  }

  async findByUserId(userId: string): Promise<Wallet | null> {
    const e = await this.repo.findOneBy({ userId });
    return e ? this.toDomain(e) : null;
  }
}

// ── TypeOrmWalletTransactionRepository ───────────────────────
@Injectable()
export class TypeOrmWalletTransactionRepository implements WalletTransactionRepository {
  constructor(@InjectRepository(WalletTransactionEntity) private readonly repo: Repository<WalletTransactionEntity>) {}

  private toDomain(e: WalletTransactionEntity): WalletTransaction {
    return new WalletTransaction({
      id:          e.id,
      walletId:    e.walletId,
      type:        e.type as TransactionType,
      amount:      Number(e.amount),
      description: e.description,
      createdAt:   e.createdAt,
    });
  }

  async save(tx: WalletTransaction): Promise<void> {
    const e = new WalletTransactionEntity();
    e.id          = tx.id;
    e.walletId    = tx.walletId;
    e.type        = tx.type;
    e.amount      = tx.amount;
    e.description = tx.description;
    e.createdAt   = tx.createdAt;
    await this.repo.save(e);
  }

  async findByWalletId(walletId: string, page: number, limit: number): Promise<PaginatedResult<WalletTransaction>> {
    const safe  = Math.max(1, page);
    const lim   = Math.min(Math.max(1, limit), 100);
    const [entities, total] = await this.repo.findAndCount({
      where: { walletId },
      order: { createdAt: 'DESC' },
      skip:  (safe - 1) * lim,
      take:  lim,
    });
    return { items: entities.map(e => this.toDomain(e)), total, page: safe, limit: lim };
  }
}

// ── TypeOrmCouponRepository ───────────────────────────────────
@Injectable()
export class TypeOrmCouponRepository implements CouponRepository {
  constructor(@InjectRepository(CouponEntity) private readonly repo: Repository<CouponEntity>) {}

  private toDomain(e: CouponEntity): Coupon {
    return new Coupon({
      id:             e.id,
      code:           e.code,
      discountType:   e.discountType as DiscountType,
      discountValue:  Number(e.discountValue),
      minOrderAmount: Number(e.minOrderAmount),
      maxUses:        e.maxUses,
      currentUses:    e.currentUses,
      expiresAt:      e.expiresAt,
      isActive:       e.isActive,
      createdAt:      e.createdAt,
    });
  }

  private toEntity(c: Coupon): CouponEntity {
    const e = new CouponEntity();
    e.id             = c.id;
    e.code           = c.code;
    e.discountType   = c.discountType;
    e.discountValue  = c.discountValue;
    e.minOrderAmount = c.minOrderAmount;
    e.maxUses        = c.maxUses;
    e.currentUses    = c.currentUses;
    e.expiresAt      = c.expiresAt;
    e.isActive       = c.isActive;
    e.createdAt      = c.createdAt;
    return e;
  }

  async save(coupon: Coupon): Promise<void>   { await this.repo.save(this.toEntity(coupon)); }
  async update(coupon: Coupon): Promise<void> { await this.repo.save(this.toEntity(coupon)); }
  async delete(id: string): Promise<void>     { await this.repo.delete(id); }

  async findById(id: string): Promise<Coupon | null> {
    const e = await this.repo.findOneBy({ id });
    return e ? this.toDomain(e) : null;
  }

  async findByCode(code: string): Promise<Coupon | null> {
    const e = await this.repo.findOneBy({ code });
    return e ? this.toDomain(e) : null;
  }

  async findAll(page: number, limit: number): Promise<PaginatedResult<Coupon>> {
    const safe = Math.max(1, page);
    const lim  = Math.min(Math.max(1, limit), 100);
    const [entities, total] = await this.repo.findAndCount({
      order: { createdAt: 'DESC' },
      skip:  (safe - 1) * lim,
      take:  lim,
    });
    return { items: entities.map(e => this.toDomain(e)), total, page: safe, limit: lim };
  }
}

// ── TypeOrmPaymentRepository ──────────────────────────────────
@Injectable()
export class TypeOrmPaymentRepository implements PaymentRepository {
  constructor(@InjectRepository(PaymentEntity) private readonly repo: Repository<PaymentEntity>) {}

  private toDomain(e: PaymentEntity): Payment {
    return new Payment({
      id:              e.id,
      orderId:         e.orderId,
      userId:          e.userId,
      method:          e.method as PaymentMethod,
      status:          e.status as PaymentStatus,
      amount:          Number(e.amount),
      couponId:        e.couponId,
      discountApplied: Number(e.discountApplied),
      finalAmount:     Number(e.finalAmount),
      createdAt:       e.createdAt,
      updatedAt:       e.updatedAt,
    });
  }

  private toEntity(p: Payment): PaymentEntity {
    const e = new PaymentEntity();
    e.id              = p.id;
    e.orderId         = p.orderId;
    e.userId          = p.userId;
    e.method          = p.method;
    e.status          = p.status;
    e.amount          = p.amount;
    e.couponId        = p.couponId;
    e.discountApplied = p.discountApplied;
    e.finalAmount     = p.finalAmount;
    e.createdAt       = p.createdAt;
    e.updatedAt       = p.updatedAt;
    return e;
  }

  async save(payment: Payment): Promise<void>   { await this.repo.save(this.toEntity(payment)); }
  async update(payment: Payment): Promise<void> { await this.repo.save(this.toEntity(payment)); }

  async findById(id: string): Promise<Payment | null> {
    const e = await this.repo.findOneBy({ id });
    return e ? this.toDomain(e) : null;
  }

  async findByOrderId(orderId: string): Promise<Payment | null> {
    const e = await this.repo.findOneBy({ orderId });
    return e ? this.toDomain(e) : null;
  }

  async findAll(params: PaymentFindAllParams): Promise<PaginatedResult<Payment>> {
    const safe = Math.max(1, params.page);
    const lim  = Math.min(Math.max(1, params.limit), 100);
    const qb   = this.repo.createQueryBuilder('payment').orderBy('payment.createdAt', 'DESC');

    if (params.userId) qb.andWhere('payment.userId = :userId', { userId: params.userId });
    if (params.status) qb.andWhere('payment.status = :status', { status: params.status });

    qb.skip((safe - 1) * lim).take(lim);
    const [entities, total] = await qb.getManyAndCount();
    return { items: entities.map(e => this.toDomain(e)), total, page: safe, limit: lim };
  }
}
