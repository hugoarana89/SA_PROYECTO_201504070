import { Inject, Injectable, OnModuleInit, HttpException, HttpStatus, Logger } from '@nestjs/common';
import * as microservices from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { lastValueFrom } from 'rxjs';
import { OrderGrpcService } from './grpc/order.grpc.interface';

@Injectable()
export class OrderService implements OnModuleInit {
  private readonly logger = new Logger(OrderService.name);
  private orderGrpc: OrderGrpcService;

  constructor(
    @Inject('ORDER_SERVICE')
    private readonly client: microservices.ClientGrpc,
  ) {}

  onModuleInit() {
    this.orderGrpc = this.client.getService<OrderGrpcService>('OrderService');
    this.logger.log('✅ OrderService gRPC client initialized');
  }

  // ==================== ÓRDENES ====================

  async createOrder(clientId: string, restaurantId: string, items: any[]) {
    try {
      this.logger.debug(`Creating order for client: ${clientId}, restaurant: ${restaurantId}`);

      return await lastValueFrom(
        this.orderGrpc.CreateOrder({
          client_id: clientId,
          restaurant_id: restaurantId,
          items: items.map(item => ({
            menu_item_id: item.menuItemId || item.menu_item_id,
            quantity: item.quantity,
            price: item.price,
            product_name: item.productName || item.product_name,
          })),
        }),
      );
    } catch (error) {
      this.logger.error(`Error creating order: ${error.message}`);
      this.handleGrpcError(error);
    }
  }

  async cancelOrder(orderId: string, clientId: string) {
    try {
      this.logger.debug(`Canceling order: ${orderId} for client: ${clientId}`);
      return await lastValueFrom(
        this.orderGrpc.CancelOrder({
          order_id: orderId,
          client_id: clientId,
        }),
      );
    } catch (error) {
      this.logger.error(`Error canceling order: ${error.message}`);
      this.handleGrpcError(error);
    }
  }

  async acceptOrder(orderId: string, restaurantId: string) {
    try {
      this.logger.debug(`Accepting order: ${orderId} for restaurant: ${restaurantId}`);
      return await lastValueFrom(
        this.orderGrpc.AcceptOrder({
          order_id: orderId,
          restaurant_id: restaurantId,
        }),
      );
    } catch (error) {
      this.logger.error(`Error accepting order: ${error.message}`);
      this.handleGrpcError(error);
    }
  }

  async rejectOrder(orderId: string, restaurantId: string, reason?: string) {
    try {
      this.logger.debug(`Rejecting order: ${orderId} for restaurant: ${restaurantId} with reason: ${reason || 'Sin razón especificada'}`);
      return await lastValueFrom(
        this.orderGrpc.RejectOrder({
          order_id: orderId,
          restaurant_id: restaurantId,
          reason: reason || 'Sin razón especificada',
        }),
      );
    } catch (error) {
      this.logger.error(`Error rejecting order: ${error.message}`);
      this.handleGrpcError(error);
    }
  }

  async completeOrder(orderId: string, restaurantId: string) {
    try {
      this.logger.debug(`Completing order: ${orderId} for restaurant: ${restaurantId}`);
      return await lastValueFrom(
        this.orderGrpc.CompleteOrder({
          order_id: orderId,
          restaurant_id: restaurantId,
        }),
      );
    } catch (error) {
      this.logger.error(`Error completing order: ${error.message}`);
      this.handleGrpcError(error);
    }
  }

  async getOrder(orderId: string) {
    try {
      this.logger.debug(`Getting order: ${orderId}`);
      return await lastValueFrom(
        this.orderGrpc.GetOrder({
          order_id: orderId,
        }),
      );
    } catch (error) {
      this.logger.error(`Error getting order: ${error.message}`);
      this.handleGrpcError(error);
    }
  }

  async listOrders(page: number = 1, limit: number = 10, status?: string) {
    try {
      this.logger.debug(`Listing orders: page=${page}, limit=${limit}, status=${status}`);
      return await lastValueFrom(
        this.orderGrpc.ListOrders({
          page,
          limit,
          status,
        }),
      );
    } catch (error) {
      this.logger.error(`Error listing orders: ${error.message}`);
      this.handleGrpcError(error);
    }
  }

  async listRestaurantOrders(restaurantId: string, page: number = 1, limit: number = 10, status?: string) {
    try {
      this.logger.debug(`Listing restaurant orders: restaurantId=${restaurantId}, page=${page}, limit=${limit}, status=${status}`);
      return await lastValueFrom(
        this.orderGrpc.ListRestaurantOrders({
          restaurant_id: restaurantId,
          page,
          limit,
          status,
        }),
      );
    } catch (error) {
      this.logger.error(`Error listing restaurant orders: ${error.message}`);
      this.handleGrpcError(error);
    }
  }

  async listClientOrders(clientId: string, page: number = 1, limit: number = 10, status?: string) {
    try {
      this.logger.debug(`Listing client orders: clientId=${clientId}, page=${page}, limit=${limit}, status=${status}`);
      return await lastValueFrom(
        this.orderGrpc.ListClientOrders({
          client_id: clientId,
          page,
          limit,
          status,
        }),
      );
    } catch (error) {
      this.logger.error(`Error listing client orders: ${error.message}`);
      this.handleGrpcError(error);
    }
  }

  // ==================== MANEJO DE ERRORES ====================

  private handleGrpcError(error: any): never {
    this.logger.error(`gRPC Error [${error.code}]: ${error.details}`);
    
    switch (error.code) {
      case status.NOT_FOUND:
        throw new HttpException(
          error.details || 'Orden no encontrada',
          HttpStatus.NOT_FOUND
        );
      
      case status.ALREADY_EXISTS:
        throw new HttpException(
          error.details || 'La orden ya existe',
          HttpStatus.CONFLICT
        );
      
      case status.PERMISSION_DENIED:
        throw new HttpException(
          error.details || 'No tienes permiso para realizar esta acción',
          HttpStatus.FORBIDDEN
        );
      
      case status.INVALID_ARGUMENT:
        throw new HttpException(
          error.details || 'Datos inválidos',
          HttpStatus.BAD_REQUEST
        );
      
      case status.FAILED_PRECONDITION:
        throw new HttpException(
          error.details || 'No se puede realizar esta operación en el estado actual de la orden',
          HttpStatus.CONFLICT
        );
      
      case status.UNAUTHENTICATED:
        throw new HttpException(
          error.details || 'No autenticado',
          HttpStatus.UNAUTHORIZED
        );
      
      case status.UNAVAILABLE:
        throw new HttpException(
          'Servicio de órdenes no disponible',
          HttpStatus.SERVICE_UNAVAILABLE
        );
      
      default:
        throw new HttpException(
          error.details || 'Error interno del servidor',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
    }
  }
}