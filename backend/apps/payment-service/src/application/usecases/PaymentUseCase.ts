// ─────────────────────────────────────────────────────────────
// UseCase: PaymentUseCase
// Orquesta el ciclo de vida de los pagos.
// ─────────────────────────────────────────────────────────────

import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 }       from 'uuid';

import { Payment, PaymentMethod, PaymentStatus } from '../../domain/entities/Payment';
import * as repositories from '../../domain/ports/repositories';

export interface CreatePaymentInput {
  orderId:     string;
  userId:      string;
  method:      PaymentMethod;
  amount:      number;
  couponCode?: string;
}

@Injectable()
export class PaymentUseCase {
  constructor(
    @Inject(repositories.PAYMENT_REPOSITORY)
    private readonly paymentRepo: repositories.PaymentRepository,

    @Inject(repositories.COUPON_REPOSITORY)
    private readonly couponRepo: repositories.CouponRepository,
  ) {}

  /** Crea un pago en estado PENDIENTE, aplicando cupón si se provee */
  async create(input: CreatePaymentInput): Promise<Payment> {
    const existing = await this.paymentRepo.findByOrderId(input.orderId);
    if (existing) throw new Error(`Ya existe un pago para la orden '${input.orderId}'.`);

    let discountApplied = 0;
    let couponId: string | null = null;

    if (input.couponCode) {
      const coupon = await this.couponRepo.findByCode(input.couponCode.toUpperCase().trim());
      if (!coupon) throw new Error(`Cupón '${input.couponCode}' no encontrado.`);
      discountApplied = coupon.calculateDiscount(input.amount); // lanza si no es aplicable
      coupon.redeem();
      await this.couponRepo.update(coupon);
      couponId = coupon.id;
    }

    const payment = Payment.create(
      uuidv4(),
      input.orderId,
      input.userId,
      input.method,
      input.amount,
      discountApplied,
      couponId,
    );
    await this.paymentRepo.save(payment);
    return payment;
  }

  async findById(id: string): Promise<Payment> {
    const payment = await this.paymentRepo.findById(id);
    if (!payment) throw new Error(`Pago con id '${id}' no encontrado.`);
    return payment;
  }

  async findByOrderId(orderId: string): Promise<Payment> {
    const payment = await this.paymentRepo.findByOrderId(orderId);
    if (!payment) throw new Error(`No se encontró pago para la orden '${orderId}'.`);
    return payment;
  }

  async listAll(params: repositories.PaymentFindAllParams): Promise<repositories.PaginatedResult<Payment>> {
    return this.paymentRepo.findAll(params);
  }

  async confirmPayment(id: string): Promise<Payment> {
    const payment = await this.findById(id);
    payment.markAsPaid();
    await this.paymentRepo.update(payment);
    return payment;
  }

  async failPayment(id: string): Promise<Payment> {
    const payment = await this.findById(id);
    payment.markAsFailed();
    await this.paymentRepo.update(payment);
    return payment;
  }

  async refundPayment(id: string): Promise<Payment> {
    const payment = await this.findById(id);
    payment.refund();
    await this.paymentRepo.update(payment);
    return payment;
  }
}
