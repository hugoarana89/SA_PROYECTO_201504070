// ─────────────────────────────────────────────────────────────
// Application: notification.service.ts (API Gateway)
// SRP: Orquesta las llamadas gRPC al Notification-Service.
//      No contiene lógica de negocio ni accede a BD.
// DIP: Depende de NotificationGrpcService (interfaz), no del
//      cliente gRPC concreto de NestJS.
//
// IMPORTANTE: Este servicio no expone endpoints HTTP propios.
// Es invocado internamente por otros servicios del Gateway
// (OrderService, DeliveryService) después de sus operaciones.
// ─────────────────────────────────────────────────────────────

import {
  Inject,
  Injectable,
  OnModuleInit,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import * as microservices from '@nestjs/microservices';
import { status }        from '@grpc/grpc-js';
import { lastValueFrom } from 'rxjs';

import {
  NotificationGrpcService,
  NotifyOrderCreatedRequest,
  NotifyOrderCancelledByClientRequest,
  NotifyOrderInTransitRequest,
  NotifyOrderCancelledByRestaurantRequest,
  NotifyOrderCancelledByDeliveryRequest,
  NotifyOrderRejectedRequest,
  NotificationResponse,
} from './grpc/notification.grpc.interface';

@Injectable()
export class NotificationService implements OnModuleInit {
  private notificationGrpc: NotificationGrpcService;

  constructor(
    @Inject('NOTIFICATION_SERVICE')
    private readonly client: microservices.ClientGrpc,
  ) {}

  onModuleInit() {
    this.notificationGrpc = this.client.getService<NotificationGrpcService>('NotificationService');
  }

  // ── NotifyOrderCreated ────────────────────────────────────
  /**
   * Llamado por OrderService tras crear una orden exitosamente.
   */
  async notifyOrderCreated(
    data: NotifyOrderCreatedRequest,
  ): Promise<NotificationResponse> {
    try {
      return await lastValueFrom(this.notificationGrpc.notifyOrderCreated(data));
    } catch (error) {
      this.handleGrpcError(error);
    }
  }

  // ── NotifyOrderCancelledByClient ──────────────────────────
  /**
   * Llamado por OrderService cuando el cliente cancela su orden.
   */
  async notifyOrderCancelledByClient(
    data: NotifyOrderCancelledByClientRequest,
  ): Promise<NotificationResponse> {
    try {
      return await lastValueFrom(this.notificationGrpc.notifyOrderCancelledByClient(data));
    } catch (error) {
      this.handleGrpcError(error);
    }
  }

  // ── NotifyOrderInTransit ──────────────────────────────────
  /**
   * Llamado por DeliveryService cuando un repartidor acepta la orden.
   */
  async notifyOrderInTransit(
    data: NotifyOrderInTransitRequest,
  ): Promise<NotificationResponse> {
    try {
      return await lastValueFrom(this.notificationGrpc.notifyOrderInTransit(data));
    } catch (error) {
      this.handleGrpcError(error);
    }
  }

  // ── NotifyOrderCancelledByRestaurant ──────────────────────
  /**
   * Llamado por OrderService cuando el restaurante cancela la orden.
   */
  async notifyOrderCancelledByRestaurant(
    data: NotifyOrderCancelledByRestaurantRequest,
  ): Promise<NotificationResponse> {
    try {
      return await lastValueFrom(this.notificationGrpc.notifyOrderCancelledByRestaurant(data));
    } catch (error) {
      this.handleGrpcError(error);
    }
  }

  // ── NotifyOrderCancelledByDelivery ────────────────────────
  /**
   * Llamado por DeliveryService cuando el repartidor cancela la entrega.
   */
  async notifyOrderCancelledByDelivery(
    data: NotifyOrderCancelledByDeliveryRequest,
  ): Promise<NotificationResponse> {
    try {
      return await lastValueFrom(this.notificationGrpc.notifyOrderCancelledByDelivery(data));
    } catch (error) {
      this.handleGrpcError(error);
    }
  }

  // ── NotifyOrderRejected ───────────────────────────────────
  /**
   * Llamado por OrderService cuando el restaurante rechaza la orden.
   */
  async notifyOrderRejected(
    data: NotifyOrderRejectedRequest,
  ): Promise<NotificationResponse> {
    try {
      return await lastValueFrom(this.notificationGrpc.notifyOrderRejected(data));
    } catch (error) {
      this.handleGrpcError(error);
    }
  }

  // ── Manejo de errores gRPC → HTTP ─────────────────────────
  private handleGrpcError(error: any): never {
    if (error instanceof HttpException) throw error;

    switch (error.code) {
      case status.INVALID_ARGUMENT:
        throw new HttpException(
          error.details || 'Datos de notificación inválidos',
          HttpStatus.BAD_REQUEST,
        );

      case status.UNAVAILABLE:
        throw new HttpException(
          error.details || 'Error al enviar el correo electrónico',
          HttpStatus.SERVICE_UNAVAILABLE,
        );

      case status.UNIMPLEMENTED:
        throw new HttpException(
          error.details || 'Método de notificación no implementado',
          HttpStatus.NOT_IMPLEMENTED,
        );

      default:
        // Las notificaciones son un proceso secundario: logueamos pero
        // no bloqueamos la respuesta principal si el servicio falla.
        console.error('[NotificationService] Error gRPC no manejado:', error);
        throw new HttpException(
          error.details || 'Error interno en el servicio de notificaciones',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
    }
  }
}