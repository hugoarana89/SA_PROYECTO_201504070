import { Injectable, Inject, OnModuleInit, Logger } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { 
  RestaurantCatalogClient,
  ValidateOrderItemsResult,
  OrderItemValidationRequest,
} from '../../../domain/ports/restaurant-catalog.client.interface';

interface ValidateOrderItemsResponse {
  valid: boolean;
  errors?: Array<{ code: string; message: string; menu_item_id: string }>;
  validated_items?: Array<{
    menu_item_id: string;
    name: string;
    current_price: number;
    is_available: boolean;
    requested_quantity: number;
    subtotal: number;
  }>;
  total_amount: number;
}

interface RestaurantCatalogGrpcService {
  ValidateOrderItems(request: any): any;
  GetRestaurantMenu(request: any): any;
  GetRestaurant(request: any): any;
}

@Injectable()
export class RestaurantCatalogGrpcClient implements RestaurantCatalogClient, OnModuleInit {
  private readonly logger = new Logger(RestaurantCatalogGrpcClient.name);
  private catalogService: RestaurantCatalogGrpcService;

  constructor(
    @Inject('RESTAURANT_CATALOG_SERVICE')
    private readonly client: ClientGrpc, 
  ) {}

  onModuleInit() {
    this.catalogService = this.client.getService<RestaurantCatalogGrpcService>('RestaurantCatalogService');
    this.logger.log('✅ RestaurantCatalogGrpcClient initialized');
  }

  async validateOrderItems(
    restaurantId: string,
    items: OrderItemValidationRequest[],
  ): Promise<ValidateOrderItemsResult> {
    try {
      this.logger.debug(`📤 Enviando validación para restaurante ${restaurantId} con ${items.length} items`);
      
      const response = await lastValueFrom(
        this.catalogService.ValidateOrderItems({
          restaurant_id: restaurantId,
          items: items.map(item => ({
            menu_item_id: item.menuItemId,
            quantity: item.quantity,
            price: item.price,
          })),
        })
      );

      this.logger.debug('📥 Respuesta recibida del catálogo:', JSON.stringify(response, null, 2));

      if (!response) {
        throw new Error('Respuesta vacía del servicio de catálogo');
      }

      // ✅ SOLUCIÓN: Tipar la respuesta explícitamente con 'as'
      const typedResponse = response as ValidateOrderItemsResponse;

      const result: ValidateOrderItemsResult = {
        valid: typedResponse.valid ?? false,
        errors: Array.isArray(typedResponse.errors) 
          ? typedResponse.errors.map(error => ({
              code: error.code || 'UNKNOWN_ERROR',
              message: error.message || 'Error desconocido',
              menuItemId: error.menu_item_id || '',
            }))
          : [],
        validatedItems: Array.isArray(typedResponse.validated_items)
          ? typedResponse.validated_items.map(item => ({
              menuItemId: item.menu_item_id,
              name: item.name || '',
              currentPrice: item.current_price || 0,
              isAvailable: item.is_available ?? false,
              requestedQuantity: item.requested_quantity || 0,
              subtotal: item.subtotal || 0,
            }))
          : [],
        totalAmount: typedResponse.total_amount || 0,
      };

      this.logger.debug('✅ Resultado procesado:', JSON.stringify(result, null, 2));
      return result;
      
    } catch (error) {
      this.logger.error(`❌ Error validating order items: ${error.message}`);
      throw error;
    }
  }

  async getRestaurantMenu(restaurantId: string): Promise<any> {
    try {
      const response = await lastValueFrom(
        this.catalogService.GetRestaurantMenu({
          restaurant_id: restaurantId,
        })
      );
      return response;
    } catch (error) {
      this.logger.error(`Error getting restaurant menu: ${error.message}`);
      throw error;
    }
  }

  async getRestaurant(restaurantId: string): Promise<any> {
    try {
      const response = await lastValueFrom(
        this.catalogService.GetRestaurant({
          id: restaurantId,
        })
      );
      return response;
    } catch (error) {
      this.logger.error(`Error getting restaurant: ${error.message}`);
      throw error;
    }
  }
}