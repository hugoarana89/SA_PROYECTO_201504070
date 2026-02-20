import { Inject, Injectable } from '@nestjs/common';
import * as orderRepositoryInterface from '../../domain/ports/order.repository.interface';
import { OrderNotFoundException } from '../../domain/exceptions/domain.exceptions';

export interface ReadyOrderRequest {
  orderId: string;
  restaurantId: string;
}

@Injectable()
export class ReadyOrderUseCase {
  constructor(
    @Inject(orderRepositoryInterface.ORDER_REPOSITORY)
    private readonly orderRepository: orderRepositoryInterface.OrderRepository,
  ) {}

  async execute(request: ReadyOrderRequest): Promise<any> {
    const order = await this.orderRepository.findById(request.orderId);
    
    if (!order) {
      throw new OrderNotFoundException(request.orderId);
    }

    order.ready(request.restaurantId);
    const updatedOrder = await this.orderRepository.update(order.id, order);

    return {
      id: updatedOrder.id,
      client_id: updatedOrder.clientId,
      restaurant_id: updatedOrder.restaurantId,
      status: updatedOrder.status.value,
      items: updatedOrder.items.map(item => ({
        id: item.id,
        menu_item_id: item.menuItemId,
        product_name: item.productName,
        quantity: item.quantity,
        unit_price: item.unitPrice.value,
        subtotal: item.subtotal.value,
      })),
      total_amount: updatedOrder.totalAmount.value,
      created_at: updatedOrder.createdAt.toISOString(),
      updated_at: updatedOrder.updatedAt.toISOString(),
    };
  }
}