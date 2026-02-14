import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import * as orderRepositoryInterface from '../../domain/ports/order.repository.interface';
import * as restaurantCatalogClientInterface from '../../domain/ports/restaurant-catalog.client.interface';
import { Order } from '../../domain/entities/order.entity';
import { OrderItem } from '../../domain/entities/order-item.entity';
import { OrderStatus } from '../../domain/value-objects/order-status.value-object';
import { Money } from '../../domain/value-objects/money.value-object';
import { DomainException } from '../../domain/exceptions/domain.exceptions';

export interface CreateOrderRequest {
  clientId: string;
  restaurantId: string;
  items: {
    menuItemId: string;
    quantity: number;
    price: number;
    productName: string;
  }[];
}

export interface CreateOrderResponse {
  id: string;
  clientId: string;
  restaurantId: string;
  status: string;
  items: any[];
  totalAmount: number;
  createdAt: Date;
}

@Injectable()
export class CreateOrderUseCase {
  constructor(
    @Inject(orderRepositoryInterface.ORDER_REPOSITORY)
    private readonly orderRepository: orderRepositoryInterface.OrderRepository,
    @Inject(restaurantCatalogClientInterface.RESTAURANT_CATALOG_CLIENT)
    private readonly catalogClient: restaurantCatalogClientInterface.RestaurantCatalogClient,
  ) {}

  async execute(request: CreateOrderRequest): Promise<CreateOrderResponse> {

    // 1. Validar los items con el servicio de catálogo
    const validationResult = await this.catalogClient.validateOrderItems(
      request.restaurantId,
      request.items.map(item => ({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        price: item.price,
      })),
    );

    // 2. Si la validación falla, lanzar excepción con detalles
    if (!validationResult.valid) {
      const errorMessages = validationResult.errors
        .map(error => error.message)
        .join(', ');
      
      throw new DomainException(`Order validation failed: ${errorMessages}`);
    }

    // 3. Crear los items de la orden con los precios validados
    const orderItems = validationResult.validatedItems.map(validatedItem => {
      const requestedItem = request.items.find(
        item => item.menuItemId === validatedItem.menuItemId
      );
      
      return new OrderItem(
        uuidv4(),
        validatedItem.menuItemId,
        validatedItem.name,
        validatedItem.requestedQuantity,
        new Money(validatedItem.currentPrice),
      );
    });

    // 4. Crear la orden
    const order = new Order(
      uuidv4(),
      request.clientId,
      request.restaurantId,
      orderItems,
      OrderStatus.CREATED,
      new Money(validationResult.totalAmount),
      '',
      new Date(),
      new Date(),
    );

    // 5. Guardar la orden
    const savedOrder = await this.orderRepository.save(order);

    return {
      id: savedOrder.id,
      clientId: savedOrder.clientId,
      restaurantId: savedOrder.restaurantId,
      status: savedOrder.status.value,
      items: savedOrder.items.map(item => item.toJSON()),
      totalAmount: savedOrder.totalAmount.value,
      createdAt: savedOrder.createdAt,
    };
  }
}