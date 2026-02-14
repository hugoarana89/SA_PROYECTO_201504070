import { Inject, Injectable } from '@nestjs/common';
import * as orderRepositoryInterface from '../../domain/ports/order.repository.interface';
import { DomainException, OrderNotFoundException } from '../../domain/exceptions/domain.exceptions';

export interface CancelOrderRequest {
  orderId: string;
  clientId: string;
}

@Injectable()
export class CancelOrderUseCase {
  constructor(
    @Inject(orderRepositoryInterface.ORDER_REPOSITORY)
    private readonly orderRepository: orderRepositoryInterface.OrderRepository,
  ) {}

  async execute(request: CancelOrderRequest): Promise<any> {
    // 1. Buscar la orden
    const order = await this.orderRepository.findById(request.orderId);
    
    if (!order) {
      throw new OrderNotFoundException(request.orderId);
    }

    // 2. Cancelar la orden (validaciones dentro del dominio)
    order.cancel(request.clientId);

    // 3. Guardar los cambios
    const updatedOrder = await this.orderRepository.update(order.id, order);

    return {
      id: updatedOrder.id,
      clientId: updatedOrder.clientId,
      restaurantId: updatedOrder.restaurantId,
      status: updatedOrder.status.value,
      items: updatedOrder.items.map(item => item.toJSON()),
      totalAmount: updatedOrder.totalAmount.value,
      updatedAt: updatedOrder.updatedAt,
    };
  }
}