// ─────────────────────────────────────────────────────────────
// Presentation: payment.controller.ts (API Gateway)
// SRP: Solo traduce HTTP ↔ PaymentService. Sin lógica de negocio.
// ─────────────────────────────────────────────────────────────

import {
  Controller, Get, Post, Put, Delete, Patch,
  Body, Param, Query, Request, UseGuards,
  HttpCode, HttpStatus, ParseUUIDPipe,
} from '@nestjs/common';
import { PaymentService }  from './payment.service';
import { JwtAuthGuard }    from '../common/guards/jwt-auth.guard';
import { RolesGuard }      from '../common/guards/roles.guard';
import { Roles }           from '../common/decorators/roles.decorator';
import { Role }            from '../common/enums/role.enum';
import { DiscountType, PaymentMethod } from './grpc/payment.grpc.interface';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  // ══════════════════════════════════════════
  // WALLET  —  /payment/wallet
  // ══════════════════════════════════════════

  /**
   * POST /payment/wallet
   * Crea una cartera para el usuario autenticado.
   * Roles: CLIENTE
   */
  @Post('wallet')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CLIENTE)
  @HttpCode(HttpStatus.CREATED)
  createWallet(@Request() req) {
    return this.paymentService.createWallet(req.user.userId);
  }

  /**
   * GET /payment/wallet/me
   * Consulta la cartera del usuario autenticado.
   * Roles: CLIENTE
   */
  @Get('wallet/me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CLIENTE)
  getMyWallet(@Request() req) {
    return this.paymentService.getWalletByUser(req.user.userId);
  }

  /**
   * GET /payment/wallet/:walletId
   * Consulta una cartera por ID.
   * Roles: ADMINISTRADOR
   */
  @Get('wallet/:walletId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMINISTRADOR)
  getWalletById(@Param('walletId', ParseUUIDPipe) walletId: string) {
    return this.paymentService.getWalletById(walletId);
  }

  /**
   * POST /payment/wallet/recharge
   * Recarga saldo en la cartera del usuario autenticado.
   * Roles: CLIENTE, ADMINISTRADOR
   */
  @Post('wallet/recharge')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CLIENTE, Role.ADMINISTRADOR)
  rechargeWallet(
    @Request() req,
    @Body() body: { amount: number; description?: string },
  ) {
    return this.paymentService.rechargeWallet(req.user.userId, body.amount, body.description);
  }

  /**
   * GET /payment/wallet/:walletId/transactions
   * Lista transacciones de una cartera.
   * Roles: CLIENTE (solo su propia), ADMINISTRADOR
   */
  @Get('wallet/:walletId/transactions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CLIENTE, Role.ADMINISTRADOR)
  listTransactions(
    @Param('walletId', ParseUUIDPipe) walletId: string,
    @Query('page')  page?:  string,
    @Query('limit') limit?: string,
  ) {
    return this.paymentService.listTransactions(
      walletId,
      page  ? parseInt(page)  : 1,
      limit ? parseInt(limit) : 10,
    );
  }

  // ══════════════════════════════════════════
  // COUPON  —  /payment/coupons
  // ══════════════════════════════════════════

  /**
   * POST /payment/coupons
   * Crea un cupón. Solo ADMINISTRADOR.
   */
  @Post('coupons')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMINISTRADOR)
  @HttpCode(HttpStatus.CREATED)
  createCoupon(
    @Body() body: {
      code:             string;
      discount_type:    DiscountType;
      discount_value:   number;
      min_order_amount?: number;
      max_uses?:         number;
      expires_at?:       string;
    },
  ) {
    return this.paymentService.createCoupon(body);
  }

  /**
   * GET /payment/coupons
   * Lista todos los cupones. ADMINISTRADOR.
   */
  @Get('coupons')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMINISTRADOR)
  listCoupons(
    @Query('page')  page?:  string,
    @Query('limit') limit?: string,
  ) {
    return this.paymentService.listCoupons(
      page  ? parseInt(page)  : 1,
      limit ? parseInt(limit) : 10,
    );
  }

  /**
   * GET /payment/coupons/validate
   * Valida un cupón contra un monto de orden. CLIENTE.
   */
  @Get('coupons/validate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CLIENTE)
  validateCoupon(
    @Query('code')         code:        string,
    @Query('order_amount') orderAmount: string,
  ) {
    return this.paymentService.validateCoupon(code, parseFloat(orderAmount));
  }

  /**
   * GET /payment/coupons/code/:code
   * Busca un cupón por su código. ADMINISTRADOR, CLIENTE.
   */
  @Get('coupons/code/:code')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMINISTRADOR, Role.CLIENTE)
  getCouponByCode(@Param('code') code: string) {
    return this.paymentService.getCouponByCode(code);
  }

  /**
   * GET /payment/coupons/:couponId
   * Busca un cupón por ID. ADMINISTRADOR.
   */
  @Get('coupons/:couponId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMINISTRADOR)
  getCouponById(@Param('couponId', ParseUUIDPipe) couponId: string) {
    return this.paymentService.getCouponById(couponId);
  }

  /**
   * PUT /payment/coupons/:couponId
   * Actualiza un cupón. ADMINISTRADOR.
   */
  @Put('coupons/:couponId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMINISTRADOR)
  updateCoupon(
    @Param('couponId', ParseUUIDPipe) couponId: string,
    @Body() body: {
      discount_value?:   number;
      min_order_amount?: number;
      max_uses?:         number;
      expires_at?:       string;
      is_active?:        boolean;
    },
  ) {
    return this.paymentService.updateCoupon({ coupon_id: couponId, ...body });
  }

  /**
   * DELETE /payment/coupons/:couponId
   * Elimina un cupón. ADMINISTRADOR.
   */
  @Delete('coupons/:couponId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMINISTRADOR)
  deleteCoupon(@Param('couponId', ParseUUIDPipe) couponId: string) {
    return this.paymentService.deleteCoupon(couponId);
  }

  // ══════════════════════════════════════════
  // PAYMENT  —  /payment/payments
  // ══════════════════════════════════════════

  /**
   * POST /payment/payments
   * Crea un pago para una orden. CLIENTE.
   */
  @Post('payments')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CLIENTE)
  @HttpCode(HttpStatus.CREATED)
  createPayment(
    @Request() req,
    @Body() body: {
      order_id:     string;
      method:       PaymentMethod;
      amount:       number;
      coupon_code?: string;
    },
  ) {
    return this.paymentService.createPayment({
      order_id:    body.order_id,
      user_id:     req.user.userId,
      method:      body.method,
      amount:      body.amount,
      coupon_code: body.coupon_code,
    });
  }

  /**
   * GET /payment/payments
   * Lista pagos. ADMINISTRADOR puede ver todos; CLIENTE, solo los suyos.
   */
  @Get('payments')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMINISTRADOR, Role.CLIENTE)
  listPayments(
    @Request() req,
    @Query('status') paymentStatus?: string,
    @Query('page')   page?:          string,
    @Query('limit')  limit?:         string,
  ) {
    // CLIENTE solo puede ver sus propios pagos
    const userId = req.user.role === Role.ADMINISTRADOR ? undefined : req.user.userId;
    return this.paymentService.listPayments(
      userId,
      paymentStatus,
      page  ? parseInt(page)  : 1,
      limit ? parseInt(limit) : 10,
    );
  }

  /**
   * GET /payment/payments/order/:orderId
   * Consulta el pago de una orden específica.
   */
  @Get('payments/order/:orderId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMINISTRADOR, Role.CLIENTE, Role.RESTAURANTE)
  getPaymentByOrder(@Param('orderId', ParseUUIDPipe) orderId: string) {
    return this.paymentService.getPaymentByOrder(orderId);
  }

  /**
   * GET /payment/payments/:paymentId
   * Consulta un pago por ID.
   */
  @Get('payments/:paymentId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMINISTRADOR, Role.CLIENTE)
  getPaymentById(@Param('paymentId', ParseUUIDPipe) paymentId: string) {
    return this.paymentService.getPaymentById(paymentId);
  }

  /**
   * PATCH /payment/payments/:paymentId/status
   * Actualiza el estado de un pago. ADMINISTRADOR.
   * Body: { status: "PAGADO" | "FALLIDO" | "REEMBOLSADO" }
   */
  @Patch('payments/:paymentId/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMINISTRADOR, Role.CLIENTE)
  updatePaymentStatus(
    @Param('paymentId', ParseUUIDPipe) paymentId: string,
    @Body('status') paymentStatus: string,
  ) {
    return this.paymentService.updatePaymentStatus(paymentId, paymentStatus);
  }
}
