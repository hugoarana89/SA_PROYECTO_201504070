import { Inject, Injectable } from '@nestjs/common';
import * as orderRepositoryInterface from '../../domain/ports/order.repository.interface';
import { DomainException, OrderNotFoundException } from '../../domain/exceptions/domain.exceptions';

export interface RejectOrderRequest {
  orderId: string;
  restaurantId: string;
  reason: string;
}

@Injectable()
export class RejectOrderUseCase {
  constructor(
    @Inject(orderRepositoryInterface.ORDER_REPOSITORY)
    private readonly orderRepository: orderRepositoryInterface.OrderRepository,
  ) {}

  async execute(request: RejectOrderRequest): Promise<any> {
    // 1. Buscar la orden
    const order = await this.orderRepository.findById(request.orderId);
    
    if (!order) {
      throw new OrderNotFoundException(request.orderId);
    }

    // 2. Rechazar la orden (validaciones dentro del dominio)
    order.reject(request.restaurantId, request.reason || 'Sin razón especificada');

    // 3. Guardar los cambios
    const updatedOrder = await this.orderRepository.update(order.id, order);

    return {
      id: updatedOrder.id,
      clientId: updatedOrder.clientId,
      restaurantId: updatedOrder.restaurantId,
      status: updatedOrder.status.value,
      rejectionReason: updatedOrder.rejectionReason,
      items: updatedOrder.items.map(item => item.toJSON()),
      totalAmount: updatedOrder.totalAmount.value,
      updatedAt: updatedOrder.updatedAt,
    };
  }
}