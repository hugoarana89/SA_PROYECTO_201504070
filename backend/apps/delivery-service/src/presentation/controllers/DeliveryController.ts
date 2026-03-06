// ─────────────────────────────────────────────────────────────
// Presentation: DeliveryController
// SRP: Solo traduce gRPC ↔ casos de uso. No contiene lógica.
// DIP: Depende de los casos de uso, no de la infraestructura.
// ─────────────────────────────────────────────────────────────

import { Controller } from '@nestjs/common';
import { Payload, RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';

import { GrpcValidate } from '../../infrastructure/grpc/decorator/grpc-validate.decorator';
import {
  AcceptOrderRequestDto,
  UpdateDeliveryStatusRequestDto,
  ListDeliveriesRequestDto,
  DeliveryStatusGrpc,
} from '../../infrastructure/grpc/dto/delivery.dto';
import { AcceptOrderUseCase }          from '../../application/usecases/AcceptOrderUseCase';
import { UpdateDeliveryStatusUseCase } from '../../application/usecases/UpdateDeliveryStatusUseCase';
import { ListDeliveriesUseCase }       from '../../application/usecases/ListDeliveriesUsecase';
import { DeliveryStatus }              from '../../domain/entities/Delivery';

// Mapeo de enum gRPC → enum de dominio (centralizado, evita repetición)
const STATUS_GRPC_TO_DOMAIN: Record<DeliveryStatusGrpc, DeliveryStatus> = {
  [DeliveryStatusGrpc.ASIGNADA]:  DeliveryStatus.ASIGNADA,
  [DeliveryStatusGrpc.EN_CAMINO]: DeliveryStatus.EN_CAMINO,
  [DeliveryStatusGrpc.ENTREGADA]: DeliveryStatus.ENTREGADA,
  [DeliveryStatusGrpc.CANCELADA]: DeliveryStatus.CANCELADA,
};

@Controller()
export class DeliveryController {
  constructor(
    private readonly acceptOrderUseCase:          AcceptOrderUseCase,
    private readonly updateDeliveryStatusUseCase: UpdateDeliveryStatusUseCase,
    private readonly listDeliveriesUseCase:       ListDeliveriesUseCase,
  ) {}

  // ── AcceptOrder ───────────────────────────────────────────
  @GrpcValidate(AcceptOrderRequestDto, 'AcceptOrder')
  async acceptOrder(@Payload() data: AcceptOrderRequestDto) {
    try {
      const delivery = await this.acceptOrderUseCase.execute({
        orderId:        data.order_id,
        deliveryUserId: data.delivery_user_id,
      });

      return { delivery: this.mapToGrpc(delivery) };
    } catch (error) {
      if (error.message.includes('ya fue aceptada')) {
        throw new RpcException({ code: status.ALREADY_EXISTS, message: error.message });
      }
      throw new RpcException({ code: status.INTERNAL, message: error.message || 'Error interno' });
    }
  }

  // ── UpdateDeliveryStatus ──────────────────────────────────
  @GrpcValidate(UpdateDeliveryStatusRequestDto, 'UpdateDeliveryStatus')
  async updateDeliveryStatus(@Payload() data: UpdateDeliveryStatusRequestDto) {
    try {
      const delivery = await this.updateDeliveryStatusUseCase.execute({
        deliveryId:    data.delivery_id,
        status:        STATUS_GRPC_TO_DOMAIN[data.status],
        cancelReason:  data.cancel_reason,
        proofImageUrl: data.proof_image_url,
      });

      return { delivery: this.mapToGrpc(delivery) };
    } catch (error) {
      if (error.message.includes('no encontrada')) {
        throw new RpcException({ code: status.NOT_FOUND, message: error.message });
      }
      if (error.message.includes('proof_image_url') || error.message.includes('foto de prueba')) {
        throw new RpcException({ code: status.INVALID_ARGUMENT, message: error.message });
      }
      throw new RpcException({ code: status.FAILED_PRECONDITION, message: error.message });
    }
  }

  // ── ListDeliveries ────────────────────────────────────────
  @GrpcValidate(ListDeliveriesRequestDto, 'ListDeliveries')
  async listDeliveries(@Payload() data: ListDeliveriesRequestDto) {
    try {
      const statusFilter = data.status_filter
        ? STATUS_GRPC_TO_DOMAIN[data.status_filter as DeliveryStatusGrpc]
        : undefined;

      // si no viene delivery_user_id, es porque el admin quiere listar todas las entregas (sin filtrar por repartidor)
      if (!data.delivery_user_id) {
        const result = await this.listDeliveriesUseCase.executeAll({
          statusFilter,
          page:  data.page  ?? 1,
          limit: data.limit ?? 10,
        });

        return {
          deliveries: result.deliveries.map((d) => this.mapToGrpc(d)),
          total:      result.total,
          page:       result.page,
          limit:      result.limit,
        };
      }

      const result = await this.listDeliveriesUseCase.execute({
        deliveryUserId: data.delivery_user_id,
        statusFilter,
        page:  data.page  ?? 1,
        limit: data.limit ?? 10,
      });

      return {
        deliveries: result.deliveries.map((d) => this.mapToGrpc(d)),
        total:      result.total,
        page:       result.page,
        limit:      result.limit,
      };

    } catch (error) {
      if (error instanceof RpcException) throw error;
      throw new RpcException({ code: status.INTERNAL, message: error.message || 'Error interno' });
    }
  }

  // ── Mapper dominio → gRPC ─────────────────────────────────
  private mapToGrpc(delivery: any) {
    return {
      id:               delivery.id,
      order_id:         delivery.orderId,
      delivery_user_id: delivery.deliveryUserId,
      status:           delivery.status,
      assigned_at:      delivery.assignedAt?.toISOString()  ?? '',
      delivered_at:     delivery.deliveredAt?.toISOString() ?? '',
      cancel_reason:    delivery.cancelReason   ?? '',
      proof_image_url:  delivery.proofImageUrl  ?? '',
    };
  }
}
