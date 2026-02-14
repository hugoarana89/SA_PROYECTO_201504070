import { Inject, Injectable } from '@nestjs/common';
import * as orderRepositoryInterface from '../../domain/ports/order.repository.interface';
import { OrderNotFoundException } from '../../domain/exceptions/domain.exceptions';

@Injectable()
export class GetOrderUseCase {
  constructor(
    @Inject(orderRepositoryInterface.ORDER_REPOSITORY)
    private readonly orderRepository: orderRepositoryInterface.OrderRepository,
  ) {}

  async execute(orderId: string): Promise<any> {
    const order = await this.orderRepository.findById(orderId);
    
    if (!order) {
      throw new OrderNotFoundException(orderId);
    }


    return {
      id: order.id,
      client_id: order.clientId,
      restaurant_id: order.restaurantId,
      status: order.status.value,
      items: order.items.map(item => ({
        id: item.id,
        menu_item_id: item.menuItemId,
        product_name: item.productName,
        quantity: item.quantity,
        unit_price: item.unitPrice.value,
        subtotal: item.subtotal.value,
      })),
      total_amount: order.totalAmount.value,
      rejection_reason: order.rejectionReason,
      created_at: order.createdAt.toISOString(),
      updated_at: order.updatedAt.toISOString(),
    };
  }
}