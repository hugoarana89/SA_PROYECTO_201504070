import { Inject, Injectable, OnModuleInit, HttpException, HttpStatus } from '@nestjs/common';
import * as microservices from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { lastValueFrom } from 'rxjs';
import { RestaurantGrpcService } from './grpc/restaurant.grpc.interface';

@Injectable()
export class RestaurantService implements OnModuleInit {
  private restaurantGrpc: RestaurantGrpcService;

  constructor(
    @Inject('RESTAURANT_CATALOG_SERVICE')
    private readonly client: microservices.ClientGrpc,
  ) {}

  onModuleInit() {
    this.restaurantGrpc = this.client.getService<RestaurantGrpcService>('RestaurantCatalogService');
  }

  // Restaurantes
  async createRestaurant(data: any, ownerId: string) {
    try {
      return await lastValueFrom(
        this.restaurantGrpc.CreateRestaurant({
          ...data,
          owner_id: ownerId,
        }),
      );
    } catch (error) {
      console.error('Error en CreateRestaurant:', error);
      this.handleGrpcError(error);
    }
  }

  async updateRestaurant(id: string, data: any, ownerId: string) {
    try {
      return await lastValueFrom(
        this.restaurantGrpc.UpdateRestaurant({
          id,
          ...data,
          owner_id: ownerId,
        }),
      );
    } catch (error) {
      this.handleGrpcError(error);
    }
  }

  async deleteRestaurant(id: string, ownerId: string) {
    try {
      return await lastValueFrom(
        this.restaurantGrpc.DeleteRestaurant({
          id,
          owner_id: ownerId,
        }),
      );
    } catch (error) {
      this.handleGrpcError(error);
    }
  }

  async getRestaurant(id: string) {
    try {
      return await lastValueFrom(
        this.restaurantGrpc.GetRestaurant({ id }),
      );
    } catch (error) {
      this.handleGrpcError(error);
    }
  }

  async listRestaurants(page: number, limit: number, is_active?: boolean, search?: string) {
    try {
      return await lastValueFrom(
        this.restaurantGrpc.ListRestaurants({
          page,
          limit,
          is_active: is_active,
          search,
        }),
      );
    } catch (error) {
      this.handleGrpcError(error);
    }
  }

  // Listar restaurantes de un propietario
  async listRestaurantsByOwner(ownerId: string) {
    try {
      return await lastValueFrom(
        this.restaurantGrpc.ListRestaurantsByOwner({ owner_id: ownerId }),
      );
    } catch (error) {
      this.handleGrpcError(error);
    }
  }

  // Menú
  async createMenuItem(data: any) {
    try {
      return await lastValueFrom(
        this.restaurantGrpc.CreateMenuItem(data),
      );
    } catch (error) {
      this.handleGrpcError(error);
    }
  }

  async updateMenuItem(id: string, data: any) {
    try {
      return await lastValueFrom(
        this.restaurantGrpc.UpdateMenuItem({
          id,
          ...data,
        }),
      );
    } catch (error) {
      this.handleGrpcError(error);
    }
  }

  async deleteMenuItem(id: string, restaurantId: string) {
    try {
      return await lastValueFrom(
        this.restaurantGrpc.DeleteMenuItem({
          id,
          restaurant_id: restaurantId,
        }),
      );
    } catch (error) {
      this.handleGrpcError(error);
    }
  }

  async listMenuItems(restaurantId: string, onlyAvailable?: boolean, page?: number, limit?: number) {
    try {
      return await lastValueFrom(
        this.restaurantGrpc.ListMenuItems({
          restaurant_id: restaurantId,
          only_available: onlyAvailable,
          page: page || 1,
          limit: limit || 10,
        }),
      );
    } catch (error) {
      this.handleGrpcError(error);
    }
  }

  async getRestaurantMenu(restaurantId: string, onlyAvailable?: boolean, page?: number, limit?: number) {
    try {
      return await lastValueFrom(
        this.restaurantGrpc.GetRestaurantMenu({
          restaurant_id: restaurantId,
          only_available: onlyAvailable,
          page: page || 1,
          limit: limit || 10,
        }),
      );
    } catch (error) {
      this.handleGrpcError(error);
    }
  }

  // Validación
  async validateOrderItems(restaurantId: string, items: any[]) {
    try {
      return await lastValueFrom(
        this.restaurantGrpc.ValidateOrderItems({
          restaurant_id: restaurantId,
          items: items.map(item => ({
            menu_item_id: item.menuItemId,
            quantity: item.quantity,
            price: item.price,
          })),
        }),
      );
    } catch (error) {
      this.handleGrpcError(error);
    }
  }

  private handleGrpcError(error: any): never {
    switch (error.code) {
      case status.NOT_FOUND:
        throw new HttpException(error.details || 'Recurso no encontrado', HttpStatus.NOT_FOUND);
      case status.ALREADY_EXISTS:
        throw new HttpException(error.details || 'El recurso ya existe', HttpStatus.CONFLICT);
      case status.PERMISSION_DENIED:
        throw new HttpException(error.details || 'Permiso denegado', HttpStatus.FORBIDDEN);
      case status.INVALID_ARGUMENT:
        throw new HttpException(error.details || 'Argumento inválido', HttpStatus.BAD_REQUEST);
      case status.UNAUTHENTICATED:
        throw new HttpException(error.details || 'No autenticado', HttpStatus.UNAUTHORIZED);
      default:
        throw new HttpException(
          error.details || 'Error interno del servidor',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
    }
  }
}