// ─────────────────────────────────────────────────────────────
// Presentation: PaymentController (microservicio gRPC)
// SRP: traduce gRPC ↔ casos de uso. Sin lógica de negocio.
// ─────────────────────────────────────────────────────────────

import { Controller, Logger } from '@nestjs/common';
import { Payload, RpcException } from '@nestjs/microservices';
import { status }                from '@grpc/grpc-js';

import { GrpcValidate }   from '../../infrastructure/grpc/decorator/grpc-validate.decorator';
import {
  CreateWalletDto, GetWalletByUserDto, GetWalletByIdDto,
  RechargeWalletDto, ListTransactionsDto,
  CreateCouponDto, GetCouponByIdDto, GetCouponByCodeDto,
  ListCouponsDto, UpdateCouponDto, DeleteCouponDto, ValidateCouponDto,
  CreatePaymentDto, GetPaymentByIdDto, GetPaymentByOrderDto,
  ListPaymentsDto, UpdatePaymentStatusDto,
} from '../../infrastructure/grpc/dto/payment.dto';
import { WalletUseCase }    from '../../application/usecases/WalletUseCase';
import { CouponUseCase }    from '../../application/usecases/CouponUseCase';
import { PaymentUseCase }   from '../../application/usecases/PaymentUseCase';
import { Wallet }           from '../../domain/entities/Wallet';
import { WalletTransaction } from '../../domain/entities/WalletTransaction';
import { Coupon }           from '../../domain/entities/Coupon';
import { Payment }          from '../../domain/entities/Payment';
import { PaymentStatus }    from '../../domain/entities/Payment';
import { DiscountType }     from '../../domain/entities/Coupon';

@Controller()
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);

  constructor(
    private readonly walletUseCase:  WalletUseCase,
    private readonly couponUseCase:  CouponUseCase,
    private readonly paymentUseCase: PaymentUseCase,
  ) {}

  // ══════════════════════════════════════════
  // WALLET
  // ══════════════════════════════════════════

  @GrpcValidate(CreateWalletDto, 'CreateWallet')
  async createWallet(@Payload() data: CreateWalletDto) {
    try {
      const wallet = await this.walletUseCase.createWallet(data.user_id);
      return { wallet: this.mapWallet(wallet) };
    } catch (error) {
      this.throwRpc(error);
    }
  }

  @GrpcValidate(GetWalletByUserDto, 'GetWalletByUser')
  async getWalletByUser(@Payload() data: GetWalletByUserDto) {
    try {
      console.log('Consultando cartera para usuariocscs:', data.user_id);
      const wallet = await this.walletUseCase.getWalletByUser(data.user_id);
      return { wallet: this.mapWallet(wallet) };
    } catch (error) {
      this.throwRpc(error);
    }
  }

  @GrpcValidate(GetWalletByIdDto, 'GetWalletById')
  async getWalletById(@Payload() data: GetWalletByIdDto) {
    try {
      const wallet = await this.walletUseCase.getWalletById(data.wallet_id);
      return { wallet: this.mapWallet(wallet) };
    } catch (error) {
      this.throwRpc(error);
    }
  }

  @GrpcValidate(RechargeWalletDto, 'RechargeWallet')
  async rechargeWallet(@Payload() data: RechargeWalletDto) {
    try {
      const wallet = await this.walletUseCase.recharge(data.user_id, data.amount, data.description ?? null);
      return { wallet: this.mapWallet(wallet) };
    } catch (error) {
      this.throwRpc(error);
    }
  }

  @GrpcValidate(ListTransactionsDto, 'ListTransactions')
  async listTransactions(@Payload() data: ListTransactionsDto) {
    try {
      const result = await this.walletUseCase.listTransactions(data.wallet_id, data.page ?? 1, data.limit ?? 10);
      return {
        transactions: result.items.map(t => this.mapTransaction(t)),
        total: result.total, page: result.page, limit: result.limit,
      };
    } catch (error) {
      this.throwRpc(error);
    }
  }

  // ══════════════════════════════════════════
  // COUPON
  // ══════════════════════════════════════════

  @GrpcValidate(CreateCouponDto, 'CreateCoupon')
  async createCoupon(@Payload() data: CreateCouponDto) {
    try {
      const coupon = await this.couponUseCase.create({
        code:           data.code,
        discountType:   data.discount_type,
        discountValue:  data.discount_value,
        minOrderAmount: data.min_order_amount,
        maxUses:        data.max_uses ?? null,
        expiresAt:      data.expires_at ? new Date(data.expires_at) : null,
      });
      return { coupon: this.mapCoupon(coupon) };
    } catch (error) {
      this.throwRpc(error);
    }
  }

  @GrpcValidate(GetCouponByIdDto, 'GetCouponById')
  async getCouponById(@Payload() data: GetCouponByIdDto) {
    try {
      const coupon = await this.couponUseCase.findById(data.coupon_id);
      return { coupon: this.mapCoupon(coupon) };
    } catch (error) {
      this.throwRpc(error);
    }
  }

  @GrpcValidate(GetCouponByCodeDto, 'GetCouponByCode')
  async getCouponByCode(@Payload() data: GetCouponByCodeDto) {
    try {
      const coupon = await this.couponUseCase.findByCode(data.code);
      return { coupon: this.mapCoupon(coupon) };
    } catch (error) {
      this.throwRpc(error);
    }
  }

  @GrpcValidate(ListCouponsDto, 'ListCoupons')
  async listCoupons(@Payload() data: ListCouponsDto) {
    try {
      const result = await this.couponUseCase.listAll(data.page ?? 1, data.limit ?? 10);
      return { coupons: result.items.map(c => this.mapCoupon(c)), total: result.total, page: result.page, limit: result.limit };
    } catch (error) {
      this.throwRpc(error);
    }
  }

  @GrpcValidate(UpdateCouponDto, 'UpdateCoupon')
  async updateCoupon(@Payload() data: UpdateCouponDto) {
    try {
      const coupon = await this.couponUseCase.update({
        couponId:       data.coupon_id,
        discountValue:  data.discount_value,
        minOrderAmount: data.min_order_amount,
        maxUses:        data.max_uses,
        expiresAt:      data.expires_at ? new Date(data.expires_at) : undefined,
        isActive:       data.is_active,
      });
      return { coupon: this.mapCoupon(coupon) };
    } catch (error) {
      this.throwRpc(error);
    }
  }

  @GrpcValidate(DeleteCouponDto, 'DeleteCoupon')
  async deleteCoupon(@Payload() data: DeleteCouponDto) {
    try {
      await this.couponUseCase.delete(data.coupon_id);
      return { success: true, message: `Cupón '${data.coupon_id}' eliminado.` };
    } catch (error) {
      this.throwRpc(error);
    }
  }

  @GrpcValidate(ValidateCouponDto, 'ValidateCoupon')
  async validateCoupon(@Payload() data: ValidateCouponDto) {
    try {
      const { coupon, discount } = await this.couponUseCase.validateAndCalculate(data.code, data.order_amount);
      return { coupon: this.mapCoupon(coupon), discount_amount: discount };
    } catch (error) {
      this.throwRpc(error);
    }
  }

  // ══════════════════════════════════════════
  // PAYMENT
  // ══════════════════════════════════════════

  @GrpcValidate(CreatePaymentDto, 'CreatePayment')
  async createPayment(@Payload() data: CreatePaymentDto) {
    try {
      const payment = await this.paymentUseCase.create({
        orderId:    data.order_id,
        userId:     data.user_id,
        method:     data.method,
        amount:     data.amount,
        couponCode: data.coupon_code,
      });
      return { payment: this.mapPayment(payment) };
    } catch (error) {
      this.throwRpc(error);
    }
  }

  @GrpcValidate(GetPaymentByIdDto, 'GetPaymentById')
  async getPaymentById(@Payload() data: GetPaymentByIdDto) {
    try {
      const payment = await this.paymentUseCase.findById(data.payment_id);
      return { payment: this.mapPayment(payment) };
    } catch (error) {
      this.throwRpc(error);
    }
  }

  @GrpcValidate(GetPaymentByOrderDto, 'GetPaymentByOrder')
  async getPaymentByOrder(@Payload() data: GetPaymentByOrderDto) {
    try {
      const payment = await this.paymentUseCase.findByOrderId(data.order_id);
      return { payment: this.mapPayment(payment) };
    } catch (error) {
      this.throwRpc(error);
    }
  }

  @GrpcValidate(ListPaymentsDto, 'ListPayments')
  async listPayments(@Payload() data: ListPaymentsDto) {
    try {
      const result = await this.paymentUseCase.listAll({
        page:   data.page  ?? 1,
        limit:  data.limit ?? 10,
        userId: data.user_id,
        status: data.status as PaymentStatus | undefined,
      });
      return { payments: result.items.map(p => this.mapPayment(p)), total: result.total, page: result.page, limit: result.limit };
    } catch (error) {
      this.throwRpc(error);
    }
  }

  @GrpcValidate(UpdatePaymentStatusDto, 'UpdatePaymentStatus')
  async updatePaymentStatus(@Payload() data: UpdatePaymentStatusDto) {
    try {
      let payment: Payment;
      if (data.status === 'PAGADO')      payment = await this.paymentUseCase.confirmPayment(data.payment_id);
      else if (data.status === 'FALLIDO') payment = await this.paymentUseCase.failPayment(data.payment_id);
      else                                payment = await this.paymentUseCase.refundPayment(data.payment_id);
      return { payment: this.mapPayment(payment) };
    } catch (error) {
      this.throwRpc(error);
    }
  }

  // ── Mappers dominio → gRPC ─────────────────────────────────
  private mapWallet(w: Wallet) {
    return {
      id:         w.id,
      user_id:    w.userId,
      balance:    w.balance,
      created_at: w.createdAt.toISOString(),
      updated_at: w.updatedAt.toISOString(),
    };
  }

  private mapTransaction(t: WalletTransaction) {
    return {
      id:          t.id,
      wallet_id:   t.walletId,
      type:        t.type,
      amount:      t.amount,
      description: t.description ?? '',
      created_at:  t.createdAt.toISOString(),
    };
  }

  private mapCoupon(c: Coupon) {
    return {
      id:               c.id,
      code:             c.code,
      discount_type:    c.discountType,
      discount_value:   c.discountValue,
      min_order_amount: c.minOrderAmount,
      max_uses:         c.maxUses ?? 0,
      current_uses:     c.currentUses,
      expires_at:       c.expiresAt?.toISOString() ?? '',
      is_active:        c.isActive,
      created_at:       c.createdAt.toISOString(),
    };
  }

  private mapPayment(p: Payment) {
    return {
      id:               p.id,
      order_id:         p.orderId,
      user_id:          p.userId,
      method:           p.method,
      status:           p.status,
      amount:           p.amount,
      coupon_id:        p.couponId ?? '',
      discount_applied: p.discountApplied,
      final_amount:     p.finalAmount,
      created_at:       p.createdAt.toISOString(),
      updated_at:       p.updatedAt.toISOString(),
    };
  }

  // ── Error handler ──────────────────────────────────────────
  private throwRpc(error: any): never {
    this.logger.error(error.message);
    if (error instanceof RpcException) throw error;

    if (error.message?.includes('no encontrad') || error.message?.includes('no se encontró'))
      throw new RpcException({ code: status.NOT_FOUND, message: error.message });
    if (error.message?.includes('ya existe') || error.message?.includes('ya tiene'))
      throw new RpcException({ code: status.ALREADY_EXISTS, message: error.message });
    if (error.message?.includes('Saldo insuficiente') || error.message?.includes('PENDIENTE')
      || error.message?.includes('estado') || error.message?.includes('mínimo')
      || error.message?.includes('expirado') || error.message?.includes('límite'))
      throw new RpcException({ code: status.FAILED_PRECONDITION, message: error.message });
    if (error.message?.includes('mayor a 0') || error.message?.includes('porcentaje')
      || error.message?.includes('negativo'))
      throw new RpcException({ code: status.INVALID_ARGUMENT, message: error.message });

    throw new RpcException({ code: status.INTERNAL, message: error.message || 'Error interno del servidor' });
  }
}
