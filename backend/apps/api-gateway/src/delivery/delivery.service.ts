// ─────────────────────────────────────────────────────────────
// Application: delivery.service.ts (API Gateway)
// SRP: Orquesta las llamadas gRPC al Delivery-Service.
// DIP: Depende de DeliveryGrpcService (interfaz), no del cliente concreto.
// ─────────────────────────────────────────────────────────────

import {
  Inject,
  Injectable,
  OnModuleInit,
  HttpException,
  HttpStatus,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import * as microservices from '@nestjs/microservices';
import { status }         from '@grpc/grpc-js';
import { lastValueFrom }  from 'rxjs';

import {
  DeliveryGrpcService,
  AcceptOrderRequest,
  UpdateDeliveryStatusRequest,
  GetDeliveryRequest,
  ListDeliveriesRequest,
  DeliveryStatusFilter,
  Delivery,
} from './grpc/delivery.grpc.interface';

@Injectable()
export class DeliveryService implements OnModuleInit {
  private deliveryGrpc: DeliveryGrpcService;

  constructor(
    @Inject('DELIVERY_SERVICE')
    private readonly client: microservices.ClientGrpc,
  ) {}

  onModuleInit() {
    this.deliveryGrpc = this.client.getService<DeliveryGrpcService>('DeliveryService');
  }

  // ── AcceptOrder ───────────────────────────────────────────
  async acceptOrder(data: AcceptOrderRequest): Promise<{ delivery: Delivery }> {
    try {
      return await lastValueFrom(this.deliveryGrpc.acceptOrder(data));
    } catch (error) {
      this.handleGrpcError(error);
    }
  }

  // ── UpdateDeliveryStatus ──────────────────────────────────
  /**
   * Actualiza el estado de una entrega.
   * Para ENTREGADA es obligatorio enviar proof_image_url con la foto en base64.
   */
  async updateDeliveryStatus(
    data: UpdateDeliveryStatusRequest,
  ): Promise<{ delivery: Delivery }> {
    try {
      return await lastValueFrom(this.deliveryGrpc.updateDeliveryStatus(data));
    } catch (error) {
      this.handleGrpcError(error);
    }
  }

  // ── GetDelivery ───────────────────────────────────────────
  async getDelivery(data: GetDeliveryRequest): Promise<{ delivery: Delivery }> {
    try {
      return await lastValueFrom(this.deliveryGrpc.getDelivery(data));
    } catch (error) {
      this.handleGrpcError(error);
    }
  }

  // ── ListDeliveries ────────────────────────────────────────
  async listDeliveries(
    deliveryUserId: string,
    statusFilter:   DeliveryStatusFilter | undefined,
    page:           number,
    limit:          number,
  ) {
    const request: ListDeliveriesRequest = {
      delivery_user_id: deliveryUserId,
      status_filter:    statusFilter ?? '',
      page,
      limit,
    };

    try {
      return await lastValueFrom(this.deliveryGrpc.listDeliveries(request));
    } catch (error) {
      this.handleGrpcError(error);
    }
  }

  // ── Manejo de errores gRPC → HTTP ─────────────────────────
  private handleGrpcError(error: any): never {
    if (error instanceof HttpException) throw error;

    switch (error.code) {
      case status.NOT_FOUND:
        throw new NotFoundException(error.details || 'Entrega no encontrada');

      case status.ALREADY_EXISTS:
        throw new HttpException(
          error.details || 'La orden ya tiene una entrega asignada',
          HttpStatus.CONFLICT,
        );

      case status.PERMISSION_DENIED:
        throw new ForbiddenException(error.details || 'Permiso denegado');

      case status.INVALID_ARGUMENT:
        throw new HttpException(
          error.details || 'Argumento inválido',
          HttpStatus.BAD_REQUEST,
        );

      case status.FAILED_PRECONDITION:
        throw new HttpException(
          error.details || 'No se puede realizar la operación en el estado actual',
          HttpStatus.PRECONDITION_FAILED,
        );

      case status.UNAUTHENTICATED:
        throw new HttpException(
          error.details || 'No autenticado',
          HttpStatus.UNAUTHORIZED,
        );

      case status.RESOURCE_EXHAUSTED:
        throw new HttpException(
          error.details || 'Límite de entregas alcanzado',
          HttpStatus.TOO_MANY_REQUESTS,
        );

      case status.UNIMPLEMENTED:
        throw new HttpException(
          error.details || 'Método no implementado',
          HttpStatus.NOT_IMPLEMENTED,
        );

      default:
        console.error('Error gRPC no manejado:', error);
        throw new HttpException(
          error.details || 'Error interno del servidor',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
    }
  }
}
