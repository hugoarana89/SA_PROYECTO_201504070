// ─────────────────────────────────────────────────────────────
// Presentation: notification.controller.ts (API Gateway)
// SRP: Solo traduce HTTP ↔ NotificationService. Sin lógica de negocio.
//
// DISEÑO: Estos endpoints son de uso INTERNO entre servicios del
// monorepo. No están pensados para ser llamados directamente
// por el cliente final, sino por otros controllers del Gateway
// (OrderController, DeliveryController) tras sus operaciones.
// ─────────────────────────────────────────────────────────────

import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';

import { NotificationService }  from './notification.service';
import { JwtAuthGuard }         from '../common/guards/jwt-auth.guard';
import { RolesGuard }           from '../common/guards/roles.guard';
import { Roles }                from '../common/decorators/roles.decorator';
import { Role }                 from '../common/enums/role.enum';
import type {
  NotifyOrderCreatedRequest,
  NotifyOrderCancelledByClientRequest,
  NotifyOrderInTransitRequest,
  NotifyOrderCancelledByRestaurantRequest,
  NotifyOrderCancelledByDeliveryRequest,
  NotifyOrderRejectedRequest,
} from './grpc/notification.grpc.interface';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  // ==================== CLIENTE ====================

  /**
   * POST /notifications/order-created
   * Notifica al cliente que su orden fue creada exitosamente.
   * Disparado por OrderService tras crear una orden (CLIENTE).
   */
  @Post('order-created')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CLIENTE)
  @HttpCode(HttpStatus.OK)
  async notifyOrderCreated(
    @Body() body: Omit<NotifyOrderCreatedRequest, 'user_id'>,
    @Request() req,
  ) {
    return this.notificationService.notifyOrderCreated({
      ...body,
      user_id: req.user.userId,  // siempre del JWT, nunca del body
    });
  }

  /**
   * POST /notifications/order-cancelled-by-client
   * Notifica al cliente la confirmación de su propia cancelación.
   * Disparado por OrderService cuando el cliente cancela (CLIENTE).
   */
  @Post('order-cancelled-by-client')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CLIENTE)
  @HttpCode(HttpStatus.OK)
  async notifyOrderCancelledByClient(
    @Body() body: Omit<NotifyOrderCancelledByClientRequest, 'user_id'>,
    @Request() req,
  ) {
    return this.notificationService.notifyOrderCancelledByClient({
      ...body,
      user_id: req.user.userId,
    });
  }

  // ==================== REPARTIDOR ====================

  /**
   * POST /notifications/order-in-transit
   * Notifica al cliente que su orden ya está en camino.
   * Disparado por DeliveryService cuando el repartidor acepta (REPARTIDOR).
   */
  @Post('order-in-transit')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.REPARTIDOR)
  @HttpCode(HttpStatus.OK)
  async notifyOrderInTransit(
    @Body() body: NotifyOrderInTransitRequest,
  ) {
    return this.notificationService.notifyOrderInTransit(body);
  }

  /**
   * POST /notifications/order-cancelled-by-delivery
   * Notifica al cliente que el repartidor canceló la entrega.
   * Disparado por DeliveryService cuando el repartidor cancela (REPARTIDOR).
   */
  @Post('order-cancelled-by-delivery')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.REPARTIDOR)
  @HttpCode(HttpStatus.OK)
  async notifyOrderCancelledByDelivery(
    @Body() body: NotifyOrderCancelledByDeliveryRequest,
  ) {
    return this.notificationService.notifyOrderCancelledByDelivery(body);
  }

  // ==================== RESTAURANTE ====================

  /**
   * POST /notifications/order-cancelled-by-restaurant
   * Notifica al cliente que el restaurante canceló su orden.
   * Disparado por OrderService cuando el restaurante cancela (RESTAURANTE).
   */
  @Post('order-cancelled-by-restaurant')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.RESTAURANTE)
  @HttpCode(HttpStatus.OK)
  async notifyOrderCancelledByRestaurant(
    @Body() body: NotifyOrderCancelledByRestaurantRequest,
  ) {
    return this.notificationService.notifyOrderCancelledByRestaurant(body);
  }

  /**
   * POST /notifications/order-rejected
   * Notifica al cliente que su orden fue rechazada por el restaurante.
   * Disparado por OrderService cuando el restaurante rechaza (RESTAURANTE).
   */
  @Post('order-rejected')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.RESTAURANTE)
  @HttpCode(HttpStatus.OK)
  async notifyOrderRejected(
    @Body() body: NotifyOrderRejectedRequest,
  ) {
    return this.notificationService.notifyOrderRejected(body);
  }
}