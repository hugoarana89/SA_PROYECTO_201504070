// ─────────────────────────────────────────────────────────────
// Application: payment.service.ts (API Gateway)
// Orquesta las llamadas gRPC al Payment-Service.
// ─────────────────────────────────────────────────────────────

import {
  Inject, Injectable, OnModuleInit,
  HttpException, HttpStatus, Logger,
  NotFoundException, ConflictException, BadRequestException,
} from '@nestjs/common';
import * as microservices from '@nestjs/microservices';
import { status }         from '@grpc/grpc-js';
import { lastValueFrom }  from 'rxjs';
import {
  PaymentGrpcService,
  CreateCouponPayload, UpdateCouponPayload, CreatePaymentPayload,
} from './grpc/payment.grpc.interface';

@Injectable()
export class PaymentService implements OnModuleInit {
  private readonly logger = new Logger(PaymentService.name);
  private paymentGrpc: PaymentGrpcService;

  constructor(
    @Inject('PAYMENT_SERVICE')
    private readonly client: microservices.ClientGrpc,
  ) {}

  onModuleInit() {
    this.paymentGrpc = this.client.getService<PaymentGrpcService>('PaymentService');
    this.logger.log('✅ PaymentService gRPC client initialized');
  }

  // ══════════════════════════════════════════
  // WALLET
  // ══════════════════════════════════════════

  async createWallet(userId: string) {
    try { return await lastValueFrom(this.paymentGrpc.CreateWallet({ user_id: userId })); }
    catch (e) { this.handleGrpcError(e); }
  }

  async getWalletByUser(userId: string) {
    try { 
      return await lastValueFrom(this.paymentGrpc.GetWalletByUser({ user_id: userId })); }
    catch (e) { this.handleGrpcError(e); }
  }

  async getWalletById(walletId: string) {
    try { return await lastValueFrom(this.paymentGrpc.GetWalletById({ wallet_id: walletId })); }
    catch (e) { this.handleGrpcError(e); }
  }

  async rechargeWallet(userId: string, amount: number, description?: string) {
    try { return await lastValueFrom(this.paymentGrpc.RechargeWallet({ user_id: userId, amount, description })); }
    catch (e) { this.handleGrpcError(e); }
  }

  async listTransactions(walletId: string, page = 1, limit = 10) {
    try { return await lastValueFrom(this.paymentGrpc.ListTransactions({ wallet_id: walletId, page, limit })); }
    catch (e) { this.handleGrpcError(e); }
  }

  // ══════════════════════════════════════════
  // COUPON
  // ══════════════════════════════════════════

  async createCoupon(payload: CreateCouponPayload) {
    try { return await lastValueFrom(this.paymentGrpc.CreateCoupon(payload)); }
    catch (e) { this.handleGrpcError(e); }
  }

  async getCouponById(couponId: string) {
    try { return await lastValueFrom(this.paymentGrpc.GetCouponById({ coupon_id: couponId })); }
    catch (e) { this.handleGrpcError(e); }
  }

  async getCouponByCode(code: string) {
    try { return await lastValueFrom(this.paymentGrpc.GetCouponByCode({ code })); }
    catch (e) { this.handleGrpcError(e); }
  }

  async listCoupons(page = 1, limit = 10) {
    try { return await lastValueFrom(this.paymentGrpc.ListCoupons({ page, limit })); }
    catch (e) { this.handleGrpcError(e); }
  }

  async updateCoupon(payload: UpdateCouponPayload) {
    try { return await lastValueFrom(this.paymentGrpc.UpdateCoupon(payload)); }
    catch (e) { this.handleGrpcError(e); }
  }

  async deleteCoupon(couponId: string) {
    try { return await lastValueFrom(this.paymentGrpc.DeleteCoupon({ coupon_id: couponId })); }
    catch (e) { this.handleGrpcError(e); }
  }

  async validateCoupon(code: string, orderAmount: number) {
    try { return await lastValueFrom(this.paymentGrpc.ValidateCoupon({ code, order_amount: orderAmount })); }
    catch (e) { this.handleGrpcError(e); }
  }

  // ══════════════════════════════════════════
  // PAYMENT
  // ══════════════════════════════════════════

  async createPayment(payload: CreatePaymentPayload) {
    try { return await lastValueFrom(this.paymentGrpc.CreatePayment(payload)); }
    catch (e) { this.handleGrpcError(e); }
  }

  async getPaymentById(paymentId: string) {
    try { return await lastValueFrom(this.paymentGrpc.GetPaymentById({ payment_id: paymentId })); }
    catch (e) { this.handleGrpcError(e); }
  }

  async getPaymentByOrder(orderId: string) {
    try { return await lastValueFrom(this.paymentGrpc.GetPaymentByOrder({ order_id: orderId })); }
    catch (e) { this.handleGrpcError(e); }
  }

  async listPayments(userId?: string, status?: string, page = 1, limit = 10) {
    try { return await lastValueFrom(this.paymentGrpc.ListPayments({ user_id: userId, status, page, limit })); }
    catch (e) { this.handleGrpcError(e); }
  }

  async updatePaymentStatus(paymentId: string, paymentStatus: string) {
    try { return await lastValueFrom(this.paymentGrpc.UpdatePaymentStatus({ payment_id: paymentId, status: paymentStatus })); }
    catch (e) { this.handleGrpcError(e); }
  }

  // ── Error handler ─────────────────────────────────────────
  private handleGrpcError(error: any): never {
    this.logger.error(`gRPC Error [${error.code}]: ${error.details || error.message}`);
    switch (error.code) {
      case status.NOT_FOUND:
        throw new NotFoundException(error.details || 'Recurso no encontrado');
      case status.ALREADY_EXISTS:
        throw new ConflictException(error.details || 'El recurso ya existe');
      case status.INVALID_ARGUMENT:
        throw new BadRequestException(error.details || 'Argumento inválido');
      case status.FAILED_PRECONDITION:
        throw new HttpException(error.details || 'Operación no permitida en el estado actual', HttpStatus.PRECONDITION_FAILED);
      case status.PERMISSION_DENIED:
        throw new HttpException(error.details || 'Permiso denegado', HttpStatus.FORBIDDEN);
      case status.UNAUTHENTICATED:
        throw new HttpException(error.details || 'No autenticado', HttpStatus.UNAUTHORIZED);
      case status.UNAVAILABLE:
        throw new HttpException('Servicio de pagos no disponible', HttpStatus.SERVICE_UNAVAILABLE);
      default:
        throw new HttpException(error.details || 'Error interno del servidor', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
