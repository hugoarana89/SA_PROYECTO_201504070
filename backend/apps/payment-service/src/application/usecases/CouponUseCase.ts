// ─────────────────────────────────────────────────────────────
// UseCase: CouponUseCase
// CRUD completo de cupones de descuento.
// ─────────────────────────────────────────────────────────────

import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 }       from 'uuid';

import { Coupon, DiscountType }  from '../../domain/entities/Coupon';
import * as repositories from '../../domain/ports/repositories';

export interface CreateCouponInput {
  code:           string;
  discountType:   DiscountType;
  discountValue:  number;
  minOrderAmount?: number;
  maxUses?:        number | null;
  expiresAt?:      Date | null;
}

export interface UpdateCouponInput {
  couponId:        string;
  discountValue?:  number;
  minOrderAmount?: number;
  maxUses?:        number | null;
  expiresAt?:      Date | null;
  isActive?:       boolean;
}

@Injectable()
export class CouponUseCase {
  constructor(
    @Inject(repositories.COUPON_REPOSITORY)
    private readonly couponRepo: repositories.CouponRepository,
  ) {}

  async create(input: CreateCouponInput): Promise<Coupon> {
    const existing = await this.couponRepo.findByCode(input.code);
    if (existing) throw new Error(`El código de cupón '${input.code}' ya existe.`);

    const coupon = Coupon.create(
      uuidv4(),
      input.code,
      input.discountType,
      input.discountValue,
      input.minOrderAmount ?? 0,
      input.maxUses ?? null,
      input.expiresAt ?? null,
    );
    await this.couponRepo.save(coupon);
    return coupon;
  }

  async findById(id: string): Promise<Coupon> {
    const coupon = await this.couponRepo.findById(id);
    if (!coupon) throw new Error(`Cupón con id '${id}' no encontrado.`);
    return coupon;
  }

  async findByCode(code: string): Promise<Coupon> {
    const coupon = await this.couponRepo.findByCode(code.toUpperCase().trim());
    if (!coupon) throw new Error(`Cupón con código '${code}' no encontrado.`);
    return coupon;
  }

  async listAll(page: number, limit: number): Promise<repositories.PaginatedResult<Coupon>> {
    return this.couponRepo.findAll(page, limit);
  }

  async update(input: UpdateCouponInput): Promise<Coupon> {
    const coupon = await this.findById(input.couponId);

    // Reconstruimos con los nuevos valores usando reflexión simple
    const updated = new Coupon({
      id:             coupon.id,
      code:           coupon.code,
      discountType:   coupon.discountType,
      discountValue:  input.discountValue  ?? coupon.discountValue,
      minOrderAmount: input.minOrderAmount ?? coupon.minOrderAmount,
      maxUses:        input.maxUses        !== undefined ? input.maxUses : coupon.maxUses,
      currentUses:    coupon.currentUses,
      expiresAt:      input.expiresAt      !== undefined ? input.expiresAt : coupon.expiresAt,
      isActive:       input.isActive       !== undefined ? input.isActive  : coupon.isActive,
      createdAt:      coupon.createdAt,
    });
    await this.couponRepo.update(updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.findById(id); // valida existencia
    await this.couponRepo.delete(id);
  }

  /** Valida y retorna el descuento para un monto de orden dado */
  async validateAndCalculate(code: string, orderAmount: number): Promise<{ coupon: Coupon; discount: number }> {
    const coupon   = await this.findByCode(code);
    const discount = coupon.calculateDiscount(orderAmount);
    return { coupon, discount };
  }
}
