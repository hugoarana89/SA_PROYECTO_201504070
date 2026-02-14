import { Controller, Logger } from '@nestjs/common';
import { GrpcMethod, Payload } from '@nestjs/microservices';
import { GrpcValidate } from '../../../common/decorators/grpc-validate.decorator';

// Use Cases
import { CreateRestaurantUseCase } from '../../../application/usecases/restaurant/create-restaurant.usecase';
import { UpdateRestaurantUseCase } from '../../../application/usecases/restaurant/update-restaurant.usecase';
import { DeleteRestaurantUseCase } from '../../../application/usecases/restaurant/delete-restaurant.usecase';
import { GetRestaurantUseCase } from '../../../application/usecases/restaurant/get-restaurant.usecase';
import { ListRestaurantsUseCase } from '../../../application/usecases/restaurant/list-restaurants.usecase';
import { CreateMenuItemUseCase } from '../../../application/usecases/menu/create-menu-item.usecase';
import { UpdateMenuItemUseCase } from '../../../application/usecases/menu/update-menu-item.usecase';
import { DeleteMenuItemUseCase } from '../../../application/usecases/menu/delete-menu-item.usecase';
import { ListMenuItemsUseCase } from '../../../application/usecases/menu/list-menu-items.usecase';
import { ValidateOrderItemsUseCase } from '../../../application/usecases/validation/validate-order-items.usecase';

// DTOs
import { 
  CreateRestaurantDto, 
  UpdateRestaurantDto, 
  DeleteRestaurantDto,
  GetRestaurantDto,
  ListRestaurantsDto,
  GetRestaurantMenuRequestDto  // ← NUEVO DTO
} from '../dto/restaurant.dto';
import {
  CreateMenuItemDto,
  UpdateMenuItemDto,
  DeleteMenuItemDto,
  ListMenuItemsDto
} from '../dto/menu-item.dto';
import {
  ValidateOrderItemsRequestDto,
} from '../dto/validation.dto';

// Value Objects
import { Address } from '../../../domain/value-objects/address.value-object';
import { Time } from '../../../domain/value-objects/time.value-object';
import { Price } from '../../../domain/value-objects/price.value-object';

@Controller()
export class RestaurantCatalogGrpcController {
  private readonly logger = new Logger(RestaurantCatalogGrpcController.name);
  constructor(
    // Restaurant Use Cases
    private readonly createRestaurantUseCase: CreateRestaurantUseCase,
    private readonly updateRestaurantUseCase: UpdateRestaurantUseCase,
    private readonly deleteRestaurantUseCase: DeleteRestaurantUseCase,
    private readonly getRestaurantUseCase: GetRestaurantUseCase,
    private readonly listRestaurantsUseCase: ListRestaurantsUseCase,
    
    // Menu Use Cases
    private readonly createMenuItemUseCase: CreateMenuItemUseCase,
    private readonly updateMenuItemUseCase: UpdateMenuItemUseCase,
    private readonly deleteMenuItemUseCase: DeleteMenuItemUseCase,
    private readonly listMenuItemsUseCase: ListMenuItemsUseCase,
    
    // Validation Use Cases
    private readonly validateOrderItemsUseCase: ValidateOrderItemsUseCase,
  ) {}

  /* ======================
     MÉTODOS DE VALIDACIÓN
     ====================== */
 @GrpcValidate(ValidateOrderItemsRequestDto, 'ValidateOrderItems')
async validateOrderItems(@Payload() data: ValidateOrderItemsRequestDto) {
  this.logger.log(`📥 Recibida petición de validación para restaurante: ${data.restaurant_id}`);
  this.logger.debug(`Items a validar: ${JSON.stringify(data.items)}`);
  
  try {
    const result = await this.validateOrderItemsUseCase.execute(
      data.restaurant_id,
      data.items.map(item => ({
        menuItemId: item.menu_item_id,
        quantity: item.quantity,
        price: item.price,
      })),
    );

    this.logger.log(`✅ Validación completada. Válido: ${result.valid}`);
    
    // ✅ CONSTRUIR LA RESPUESTA EXPLÍCITAMENTE
    const response = {
      valid: result.valid,
      errors: result.errors.map(error => ({
        code: error.code,
        message: error.message,
        menu_item_id: error.menuItemId,
      })),
      validated_items: result.validatedItems.map(item => ({
        menu_item_id: item.menuItemId,
        name: item.name,
        current_price: item.currentPrice,
        is_available: item.isAvailable,
        requested_quantity: item.requestedQuantity,
        subtotal: item.subtotal,
      })),
      total_amount: result.totalAmount,
    };

    this.logger.debug(`📤 Respuesta: ${JSON.stringify(response)}`);
    return response;
    
  } catch (error) {
    this.logger.error(`❌ Error en validación: ${error.message}`);
    throw error;
  }
}

  /* ======================
     MÉTODOS DE RESTAURANTES
     ====================== */
  //@GrpcMethod('RestaurantCatalogService', 'CreateRestaurant')
  @GrpcValidate(CreateRestaurantDto, 'CreateRestaurant')
  async createRestaurant(@Payload() data: CreateRestaurantDto) {
    const result = await this.createRestaurantUseCase.execute({
      ownerId: data.owner_id!,
      name: data.name,
      description: data.description,
      address: new Address(data.address),
      phone: data.phone,
      openingTime: new Time(data.opening_time),
      closingTime: new Time(data.closing_time),
    });

    return this.mapRestaurantToResponse(result);
  }

  @GrpcValidate(UpdateRestaurantDto, 'UpdateRestaurant')
  async updateRestaurant(@Payload() data: UpdateRestaurantDto) {
    const result = await this.updateRestaurantUseCase.execute({
      id: data.id,
      name: data.name,
      description: data.description,
      address: data.address ? new Address(data.address) : undefined,
      phone: data.phone,
      openingTime: data.opening_time ? new Time(data.opening_time) : undefined,
      closingTime: data.closing_time ? new Time(data.closing_time) : undefined,
      isActive: data.is_active,
    });

    return this.mapRestaurantToResponse(result);
  }

  @GrpcValidate(DeleteRestaurantDto, 'DeleteRestaurant')
  async deleteRestaurant(@Payload() data: DeleteRestaurantDto) {
    await this.deleteRestaurantUseCase.execute({
      id: data.id,
      ownerId: data.owner_id,
    });
    return {};
  }

  @GrpcValidate(GetRestaurantDto, 'GetRestaurant')
  async getRestaurant(@Payload() data: GetRestaurantDto) {
    const result = await this.getRestaurantUseCase.execute(data.id);
    return this.mapRestaurantToResponse(result);
  }

  @GrpcValidate(ListRestaurantsDto, 'ListRestaurants')
  async listRestaurants(@Payload() data: ListRestaurantsDto) {
    const result = await this.listRestaurantsUseCase.execute({
      page: data.page || 1,
      limit: data.limit || 10,
      is_active: data.is_active,
      search: data.search,
    });

    return {
      restaurants: result.items.map(item => this.mapRestaurantToResponse(item)),
      total: result.total,
      page: data.page || 1,
      limit: data.limit || 10,
    };
  }

  /* ======================
     MÉTODO CORREGIDO: GetRestaurantMenu
     ====================== */
  @GrpcValidate(GetRestaurantMenuRequestDto, 'GetRestaurantMenu')
  async getRestaurantMenu(@Payload() data: GetRestaurantMenuRequestDto) {
    const result = await this.listMenuItemsUseCase.execute({
      restaurantId: data.restaurant_id,
      onlyAvailable: data.only_available,
      page: data.page || 1,
      limit: data.limit || 10,
    });

    return {
      items: result.items.map(item => this.mapMenuItemToResponse(item)),
      total: result.total,
      page: data.page || 1,
      limit: data.limit || 10,
    };
  }

  /* ======================
     MÉTODOS DE MENÚ
     ====================== */
  @GrpcValidate(CreateMenuItemDto, 'CreateMenuItem')
  async createMenuItem(@Payload() data: CreateMenuItemDto) {
    const result = await this.createMenuItemUseCase.execute({
      restaurantId: data.restaurant_id,
      name: data.name,
      description: data.description,
      price: new Price(data.price),
      imageUrl: data.image_url,
      isAvailable: data.is_available,
    });

    return this.mapMenuItemToResponse(result);
  }

  @GrpcValidate(UpdateMenuItemDto, 'UpdateMenuItem')
  async updateMenuItem(@Payload() data: UpdateMenuItemDto) {
    const result = await this.updateMenuItemUseCase.execute({
      id: data.id,
      name: data.name,
      description: data.description,
      price: data.price ? new Price(data.price) : undefined,
      imageUrl: data.image_url,
      isAvailable: data.is_available,
      restaurantId: data.restaurant_id,
    });

    return this.mapMenuItemToResponse(result);
  }

  @GrpcValidate(DeleteMenuItemDto, 'DeleteMenuItem')
  async deleteMenuItem(@Payload() data: DeleteMenuItemDto) {
    await this.deleteMenuItemUseCase.execute({
      id: data.id,
      restaurantId: data.restaurant_id,
    });
    return {};
  }

  @GrpcValidate(ListMenuItemsDto, 'ListMenuItems')
  async listMenuItems(@Payload() data: ListMenuItemsDto) {
    const result = await this.listMenuItemsUseCase.execute({
      restaurantId: data.restaurant_id,
      onlyAvailable: data.only_available,
      page: data.page || 1,
      limit: data.limit || 10,
    });

    return {
      items: result.items.map(item => this.mapMenuItemToResponse(item)),
      total: result.total,
      page: data.page || 1,
      limit: data.limit || 10,
    };
  }

  /* ======================
     MAPEADORES
     ====================== */
  private mapRestaurantToResponse(restaurant: any) {
    return {
      id: restaurant.id,
      owner_id: restaurant.ownerId,
      name: restaurant.name,
      description: restaurant.description,
      address: restaurant.address.toString(),
      phone: restaurant.phone,
      opening_time: restaurant.openingTime.toString(),
      closing_time: restaurant.closingTime.toString(),
      is_active: restaurant.isActive,
      created_at: restaurant.createdAt.toISOString(),
      updated_at: restaurant.updatedAt.toISOString(),
    };
  }

  private mapMenuItemToResponse(menuItem: any) {
    return {
      id: menuItem.id,
      restaurant_id: menuItem.restaurantId,
      name: menuItem.name,
      description: menuItem.description,
      price: menuItem.price.value,
      image_url: menuItem.imageUrl,
      is_available: menuItem.isAvailable,
      created_at: menuItem.createdAt.toISOString(),
      updated_at: menuItem.updatedAt.toISOString(),
    };
  }
}