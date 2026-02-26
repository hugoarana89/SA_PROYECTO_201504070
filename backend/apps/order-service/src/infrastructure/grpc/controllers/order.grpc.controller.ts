import { Controller, Logger } from '@nestjs/common';
import { Payload } from '@nestjs/microservices';
import { GrpcValidate } from '../../../common/decorators/grpc-validate.decorator';

// Use Cases
import { CreateOrderUseCase } from '../../../application/usecases/create-order.usecase';
import { CancelOrderUseCase } from '../../../application/usecases/cancel-order.usecase';
import { RejectOrderUseCase } from '../../../application/usecases/reject-order.usecase';
import { AcceptOrderUseCase } from '../../../application/usecases/accept-order.usecase';
import { ReadyOrderUseCase } from '../../../application/usecases/ready-order.usecase';
import { CompleteOrderUseCase } from '../../../application/usecases/complete-order.usecase';
import { GetOrderUseCase } from '../../../application/usecases/get-order.usecase';
import { ListOrdersUseCase } from '../../../application/usecases/list-orders.usecase';
import { RabbitMQService } from 'apps/order-service/src/rabbitmq/rabbitmq';

// DTOs
import {
  CreateOrderRequestDto,
  CancelOrderRequestDto,
  RejectOrderRequestDto,
  AcceptOrderRequestDto,
  ReadyOrderRequestDto,
  CompleteOrderRequestDto,
  GetOrderRequestDto,
  ListOrdersRequestDto,
  ListRestaurantOrdersRequestDto,
  ListClientOrdersRequestDto,
} from '../dto/order.dto';

@Controller()
export class OrderGrpcController {
  private readonly logger = new Logger(OrderGrpcController.name);

  constructor(
    private readonly createOrderUseCase: CreateOrderUseCase,
    private readonly cancelOrderUseCase: CancelOrderUseCase,
    private readonly rejectOrderUseCase: RejectOrderUseCase,
    private readonly acceptOrderUseCase: AcceptOrderUseCase,
    private readonly readyOrderUseCase: ReadyOrderUseCase,
    private readonly completeOrderUseCase: CompleteOrderUseCase,
    private readonly getOrderUseCase: GetOrderUseCase,
    private readonly listOrdersUseCase: ListOrdersUseCase,
    private readonly rabbitMQService: RabbitMQService,
  ) { }

  @GrpcValidate(CreateOrderRequestDto, 'CreateOrder')
  async createOrder(@Payload() data: CreateOrderRequestDto) {
    this.logger.debug(
      `📤 Recibida solicitud de creación de orden para cliente 
      ${data.client_id} en restaurante ${data.restaurant_id} con ${data.items.length} items`,
    );
    /*const result = await this.createOrderUseCase.execute({
      clientId: data.client_id,
      restaurantId: data.restaurant_id,
      items: data.items.map((item) => ({
        menuItemId: item.menu_item_id,
        quantity: item.quantity,
        price: item.price,
        productName: item.product_name,
      })),
    });*/

    const result = {
      id: '123',
      client_id: data.client_id,
      restaurant_id: data.restaurant_id,
      items: data.items.map((item) => ({
        menuItemId: item.menu_item_id,
        quantity: item.quantity,
        price: item.price,
        productName: item.product_name,
      })),
    }
    this.rabbitMQService.enviarPedido(result);
    return this.mapOrderToResponse(result);
  }

  @GrpcValidate(CancelOrderRequestDto, 'CancelOrder')
  async cancelOrder(@Payload() data: CancelOrderRequestDto) {
    this.logger.debug(
      `📤 Recibida solicitud de cancelación de orden ${data.order_id} para cliente ${data.client_id}`,
    );
    const result = await this.cancelOrderUseCase.execute({
      orderId: data.order_id,
      clientId: data.client_id,
    });

    return this.mapOrderToResponse(result);
  };

  @GrpcValidate(RejectOrderRequestDto, 'RejectOrder')
  async rejectOrder(@Payload() data: RejectOrderRequestDto) {
    this.logger.debug(
      `📤 Recibida solicitud de rechazo de orden 
      ${data.order_id} para restaurante ${data.restaurant_id} con motivo: ${data.reason}`,
    );
    const result = await this.rejectOrderUseCase.execute({
      orderId: data.order_id,
      restaurantId: data.restaurant_id,
      reason: data.reason,
    });

    return this.mapOrderToResponse(result);
  }

  @GrpcValidate(AcceptOrderRequestDto, 'AcceptOrder')
  async acceptOrder(@Payload() data: AcceptOrderRequestDto) {
    this.logger.debug(
      `📤 Recibida solicitud de aceptación de orden ${data.order_id} para restaurante ${data.restaurant_id}`,
    );
    const result = await this.acceptOrderUseCase.execute({
      orderId: data.order_id,
      restaurantId: data.restaurant_id,
    });

    return this.mapOrderToResponse(result);
  }

  @GrpcValidate(ReadyOrderRequestDto, 'ReadyOrder')
  async readyOrder(@Payload() data: ReadyOrderRequestDto) {
    this.logger.debug(
      `📤 Recibida solicitud de completación de orden 
      ${data.order_id} para restaurante ${data.restaurant_id}`,
    );
    const result = await this.readyOrderUseCase.execute({
      orderId: data.order_id,
      restaurantId: data.restaurant_id
    });

    return this.mapOrderToResponse(result);
  }

  @GrpcValidate(CompleteOrderRequestDto, 'CompleteOrder')
  async completeOrder(@Payload() data: CompleteOrderRequestDto) {
    this.logger.debug(
      `📤 Recibida solicitud de completación de orden 
      ${data.order_id} para restaurante ${data.restaurant_id}`,
    );
    const result = await this.completeOrderUseCase.execute({
      orderId: data.order_id,
      restaurantId: data.restaurant_id,
    });

    return this.mapOrderToResponse(result);
  }

  @GrpcValidate(GetOrderRequestDto, 'GetOrder')
  async getOrder(@Payload() data: GetOrderRequestDto) {
    this.logger.debug(
      `📤 Recibida solicitud de obtención de orden ${data.order_id}`,
    );
    const result = await this.getOrderUseCase.execute(data.order_id);
    return this.mapOrderToResponse(result);
  }

  @GrpcValidate(ListOrdersRequestDto, 'ListOrders')
  async listOrders(@Payload() data: ListOrdersRequestDto) {
    this.logger.debug(
      `📤 Recibida solicitud de listado de órdenes con página 
      ${data.page || 1} y límite ${data.limit || 10}`,
    );
    const result = await this.listOrdersUseCase.execute({
      page: data.page || 1,
      limit: data.limit || 10,
      status: data.status,
    });

    return {
      orders: result.items.map((item) => this.mapOrderToResponse(item)),
      total: result.total,
      page: data.page || 1,
      limit: data.limit || 10,
    };
  }

  @GrpcValidate(ListRestaurantOrdersRequestDto, 'ListRestaurantOrders')
  async listRestaurantOrders(@Payload() data: ListRestaurantOrdersRequestDto) {
    this.logger.debug(
      `📤 Recibida solicitud de listado de órdenes para restaurante 
      ${data.restaurant_id} con página ${data.page || 1} y límite ${data.limit || 10}`,
    );
    const result = await this.listOrdersUseCase.executeByRestaurant({
      restaurantId: data.restaurant_id,
      page: data.page || 1,
      limit: data.limit || 10,
      status: data.status,
    });

    return {
      orders: result.items.map((item) => this.mapOrderToResponse(item)),
      total: result.total,
      page: data.page || 1,
      limit: data.limit || 10,
    };
  }

  @GrpcValidate(ListClientOrdersRequestDto, 'ListClientOrders')
  async listClientOrders(@Payload() data: ListClientOrdersRequestDto) {
    this.logger.debug(
      `📤 Recibida solicitud de listado de órdenes para cliente 
      ${data.client_id} con página ${data.page || 1} y límite ${data.limit || 10}`,
    );
    const result = await this.listOrdersUseCase.executeByClient({
      clientId: data.client_id,
      page: data.page || 1,
      limit: data.limit || 10,
      status: data.status,
    });

    return {
      orders: result.items.map((item) => this.mapOrderToResponse(item)),
      total: result.total,
      page: data.page || 1,
      limit: data.limit || 10,
    };
  }

  private mapOrderToResponse(order: any) {
    return {
      id: order.id,
      // order.clientId es indefinido entonces intentar con clinet_id, lo mismo para restaurantId y restaurant_id
      client_id: order.clientId || order.client_id,
      restaurant_id: order.restaurantId || order.restaurant_id,
      status: order.status,
      total_amount: order.totalAmount || order.total_amount,
      items: order.items.map((item) => ({
        id: item.id,
        menu_item_id: item.menuItemId || item.menu_item_id,
        product_name: item.productName || item.product_name,
        quantity: item.quantity,
        unit_price: item.unitPrice || item.unit_price,
        subtotal: item.subtotal,
      })),
      created_at: order.createdAt?.toISOString() || order.created_at,
      updated_at: order.updatedAt?.toISOString() || order.updated_at,
      rejection_reason: order.rejectionReason || order.rejection_reason,
    };
  }
}
