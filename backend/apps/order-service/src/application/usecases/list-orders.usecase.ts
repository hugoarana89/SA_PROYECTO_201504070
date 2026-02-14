import { Inject, Injectable } from '@nestjs/common';
import * as orderRepositoryInterface from '../../domain/ports/order.repository.interface';

export interface ListOrdersRequest {
  page: number;
  limit: number;
  status?: string;
}

export interface ListOrdersByRestaurantRequest {
  restaurantId: string;
  page: number;
  limit: number;
  status?: string;
}

export interface ListOrdersByClientRequest {
  clientId: string;
  page: number;
  limit: number;
  status?: string;
}

@Injectable()
export class ListOrdersUseCase {
  constructor(
    @Inject(orderRepositoryInterface.ORDER_REPOSITORY)
    private readonly orderRepository: orderRepositoryInterface.OrderRepository,
  ) {}

  async execute(request: ListOrdersRequest): Promise<{ items: any[]; total: number }> {
    const result = await this.orderRepository.findAll(
      request.page,
      request.limit,
      request.status,
    );

    return {
      items: result.items.map(order => ({
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
        created_at: order.createdAt.toISOString(),
        updated_at: order.updatedAt.toISOString(),
      })),
      total: result.total,
    };
  }

  async executeByRestaurant(request: ListOrdersByRestaurantRequest): Promise<{ items: any[]; total: number }> {
    const result = await this.orderRepository.findByRestaurantId(
      request.restaurantId,
      request.page,
      request.limit,
      request.status,
    );

    return {
      items: result.items.map(order => ({
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
        created_at: order.createdAt.toISOString(),
        updated_at: order.updatedAt.toISOString(),
      })),
      total: result.total,
    };
  }

  async executeByClient(request: ListOrdersByClientRequest): Promise<{ items: any[]; total: number }> {
    const result = await this.orderRepository.findByClientId(
      request.clientId,
      request.page,
      request.limit,
      request.status,
    );

    return {
      items: result.items.map(order => ({
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
        created_at: order.createdAt.toISOString(),
        updated_at: order.updatedAt.toISOString(),
      })),
      total: result.total,
    };
  }
}