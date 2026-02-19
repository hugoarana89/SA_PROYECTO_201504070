// ─────────────────────────────────────────────────────────────
// Presentation: NotificationController
// SRP: Solo traduce gRPC ↔ casos de uso.
// DIP: Depende de los casos de uso, no de infraestructura.
// ─────────────────────────────────────────────────────────────

import { Controller } from '@nestjs/common';
import { Payload, RpcException } from '@nestjs/microservices';
import { status }                from '@grpc/grpc-js';

import { GrpcValidate } from '../../infrastructure/grpc/decorator/grpc-validate.decorator';
import {
  NotifyOrderCreatedRequestDto,
  NotifyOrderCancelledByClientRequestDto,
  NotifyOrderInTransitRequestDto,
  NotifyOrderCancelledByRestaurantRequestDto,
  NotifyOrderCancelledByDeliveryRequestDto,
  NotifyOrderRejectedRequestDto,
} from '../../infrastructure/grpc/dto/notification.dto';

import { SendOrderCreatedNotificationUseCase } from '../../application/usecases/SendOrderCreatedNotificationUseCase';
import { SendOrderCancelledByClientUseCase } from '../../application/usecases/SendOrderCancelledByClientUseCase';
import { SendOrderInTransitNotificationUseCase } from '../../application/usecases/SendOrderInTransitNotificationUseCase';
import { SendOrderCancelledByRestaurantUseCase } from '../../application/usecases/SendOrderCancelledByRestaurantUseCase';
import { SendOrderCancelledByDeliveryUseCase } from '../../application/usecases/SendOrderCancelledByDeliveryUseCase';
import { SendOrderRejectedNotificationUseCase } from '../../application/usecases/SendOrderRejectedNotificationUseCase';

@Controller()
export class NotificationController {
  constructor(
    private readonly sendOrderCreated:            SendOrderCreatedNotificationUseCase,
    private readonly sendCancelledByClient:       SendOrderCancelledByClientUseCase,
    private readonly sendInTransit:               SendOrderInTransitNotificationUseCase,
    private readonly sendCancelledByRestaurant:   SendOrderCancelledByRestaurantUseCase,
    private readonly sendCancelledByDelivery:     SendOrderCancelledByDeliveryUseCase,
    private readonly sendRejected:                SendOrderRejectedNotificationUseCase,
  ) {}

  // ── NotifyOrderCreated ────────────────────────────────────
  @GrpcValidate(NotifyOrderCreatedRequestDto, 'NotifyOrderCreated')
  async notifyOrderCreated(@Payload() data: NotifyOrderCreatedRequestDto) {
    try {
      const notification = await this.sendOrderCreated.execute({
        userId:      data.user_id,
        clientName:  data.client_name,
        clientEmail: data.client_email,
        orderId:     data.order_id,
        products:    data.products,
        totalAmount: data.total_amount,
        createdAt:   data.created_at,
      });

      return this.successResponse(notification.id, 'Notificación de orden creada enviada');
    } catch (error) {
      this.handleError(error, 'NotifyOrderCreated');
    }
  }

  // ── NotifyOrderCancelledByClient ──────────────────────────
  @GrpcValidate(NotifyOrderCancelledByClientRequestDto, 'NotifyOrderCancelledByClient')
  async notifyOrderCancelledByClient(@Payload() data: NotifyOrderCancelledByClientRequestDto) {
    try {
      const notification = await this.sendCancelledByClient.execute({
        userId:      data.user_id,
        clientName:  data.client_name,
        clientEmail: data.client_email,
        orderId:     data.order_id,
        products:    data.products,
        cancelledAt: data.cancelled_at,
      });

      return this.successResponse(notification.id, 'Notificación de cancelación por cliente enviada');
    } catch (error) {
      this.handleError(error, 'NotifyOrderCancelledByClient');
    }
  }

  // ── NotifyOrderInTransit ──────────────────────────────────
  @GrpcValidate(NotifyOrderInTransitRequestDto, 'NotifyOrderInTransit')
  async notifyOrderInTransit(@Payload() data: NotifyOrderInTransitRequestDto) {
    try {
      const notification = await this.sendInTransit.execute({
        userId:         data.user_id,
        clientEmail:    data.client_email,
        orderId:        data.order_id,
        deliveryUserId: data.delivery_user_id,
        deliveryName:   data.delivery_name,
        products:       data.products,
      });

      return this.successResponse(notification.id, 'Notificación de orden en camino enviada');
    } catch (error) {
      this.handleError(error, 'NotifyOrderInTransit');
    }
  }

  // ── NotifyOrderCancelledByRestaurant ──────────────────────
  @GrpcValidate(NotifyOrderCancelledByRestaurantRequestDto, 'NotifyOrderCancelledByRestaurant')
  async notifyOrderCancelledByRestaurant(@Payload() data: NotifyOrderCancelledByRestaurantRequestDto) {
    try {
      const notification = await this.sendCancelledByRestaurant.execute({
        userId:         data.user_id,
        clientEmail:    data.client_email,
        orderId:        data.order_id,
        restaurantName: data.restaurant_name,
        cancelReason:   data.cancel_reason,
        products:       data.products,
      });

      return this.successResponse(notification.id, 'Notificación de cancelación por restaurante enviada');
    } catch (error) {
      this.handleError(error, 'NotifyOrderCancelledByRestaurant');
    }
  }

  // ── NotifyOrderCancelledByDelivery ────────────────────────
  @GrpcValidate(NotifyOrderCancelledByDeliveryRequestDto, 'NotifyOrderCancelledByDelivery')
  async notifyOrderCancelledByDelivery(@Payload() data: NotifyOrderCancelledByDeliveryRequestDto) {
    try {
      const notification = await this.sendCancelledByDelivery.execute({
        userId:         data.user_id,
        clientEmail:    data.client_email,
        orderId:        data.order_id,
        deliveryUserId: data.delivery_user_id,
        deliveryName:   data.delivery_name,
        cancelReason:   data.cancel_reason,
        products:       data.products,
      });

      return this.successResponse(notification.id, 'Notificación de cancelación por repartidor enviada');
    } catch (error) {
      this.handleError(error, 'NotifyOrderCancelledByDelivery');
    }
  }

  // ── NotifyOrderRejected ───────────────────────────────────
  @GrpcValidate(NotifyOrderRejectedRequestDto, 'NotifyOrderRejected')
  async notifyOrderRejected(@Payload() data: NotifyOrderRejectedRequestDto) {
    try {
      const notification = await this.sendRejected.execute({
        userId:         data.user_id,
        clientEmail:    data.client_email,
        orderId:        data.order_id,
        restaurantName: data.restaurant_name,
        products:       data.products,
      });

      return this.successResponse(notification.id, 'Notificación de orden rechazada enviada');
    } catch (error) {
      this.handleError(error, 'NotifyOrderRejected');
    }
  }

  // ── Helpers ───────────────────────────────────────────────
  private successResponse(notificationId: string, message: string) {
    return { success: true, notification_id: notificationId, message };
  }

  private handleError(error: any, method: string): never {
    // Si ya es un RpcException (viene del pipe de validación), la relanzamos
    if (error instanceof RpcException) throw error;

    console.error(`[NotificationController.${method}] Error:`, error);

    // Error de SendGrid (status code HTTP en la respuesta)
    if (error?.response?.body?.errors) {
      const sgError = error.response.body.errors[0]?.message ?? 'Error de SendGrid';
      throw new RpcException({
        code:    status.UNAVAILABLE,
        message: `Error al enviar el correo: ${sgError}`,
      });
    }

    throw new RpcException({
      code:    status.INTERNAL,
      message: error?.message ?? 'Error interno del servidor',
    });
  }
}
