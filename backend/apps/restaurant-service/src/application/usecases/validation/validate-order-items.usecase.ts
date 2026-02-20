import { Inject, Injectable } from '@nestjs/common';
import * as menuItemRepositoryInterface from '../../../domain/ports/menu-item.repository.interface';
import * as restaurantRepositoryInterface from '../../../domain/ports/restaurant.repository.interface';
import { RestaurantNotFoundException } from '../../../domain/exceptions/domain.exceptions';

export interface OrderItemValidationRequest {
  menuItemId: string;
  quantity: number;
  price: number;
}

export interface ValidatedItem {
  menuItemId: string;
  name: string;
  currentPrice: number;
  isAvailable: boolean;
  requestedQuantity: number;
  subtotal: number;
}

export interface ValidationError {
  code: string;
  message: string;
  menuItemId: string;
}

export interface ValidateOrderItemsResult {
  valid: boolean;
  errors: ValidationError[];
  validatedItems: ValidatedItem[];
  totalAmount: number;
}

@Injectable()
export class ValidateOrderItemsUseCase {
  constructor(
    @Inject(menuItemRepositoryInterface.MENU_ITEM_REPOSITORY)
    private readonly menuItemRepository: menuItemRepositoryInterface.MenuItemRepository,
    @Inject(restaurantRepositoryInterface.RESTAURANT_REPOSITORY)
    private readonly restaurantRepository: restaurantRepositoryInterface.RestaurantRepository,
  ) {}

  async execute(
    restaurantId: string,
    items: OrderItemValidationRequest[],
  ): Promise<ValidateOrderItemsResult> {
    // 1. Verificar que el restaurante existe y está activo
    const restaurant = await this.restaurantRepository.findById(restaurantId);

    if (!restaurant) {
      throw new RestaurantNotFoundException(restaurantId);
    }

    if (!restaurant.isActive) {
      return {
        valid: false,
        errors: [{
          code: 'RESTAURANT_NOT_ACTIVE',
          message: 'El restaurante no está activo actualmente',
          menuItemId: '',
        }],
        validatedItems: [],
        totalAmount: 0,
      };
    }

    // 2. Obtener todos los items del menú solicitados
    const menuItemIds = items.map(item => item.menuItemId);
    const menuItems = await this.menuItemRepository.findByIdsAndRestaurant(
      menuItemIds,
      restaurantId,
    );

    // 3. Validar cada item
    const errors: ValidationError[] = [];
    const validatedItems: ValidatedItem[] = [];
    let totalAmount = 0;

    for (const requestedItem of items) {
      const menuItem = menuItems.find(mi => mi.id === requestedItem.menuItemId);

      // Validar existencia
      if (!menuItem) {
        errors.push({
          code: 'ITEM_NOT_FOUND',
          message: `El producto no pertenece a este restaurante o no existe`,
          menuItemId: requestedItem.menuItemId,
        });
        continue;
      }

      // Validar disponibilidad
      if (!menuItem.isAvailable) {
        errors.push({
          code: 'ITEM_NOT_AVAILABLE',
          message: `El producto "${menuItem.name}" no está disponible actualmente`,
          menuItemId: requestedItem.menuItemId,
        });
        continue;
      }

      // Validar precio
      if (menuItem.price.value !== requestedItem.price) {
        errors.push({
          code: 'PRICE_MISMATCH',
          message: `El precio del producto "${menuItem.name}" ha cambiado. Precio actual: $${menuItem.price.value}`,
          menuItemId: requestedItem.menuItemId,
        });
        continue;
      }

      // Validar cantidad
      if (requestedItem.quantity <= 0) {
        errors.push({
          code: 'INVALID_QUANTITY',
          message: 'La cantidad debe ser mayor a 0',
          menuItemId: requestedItem.menuItemId,
        });
        continue;
      }

      // Item válido
      const subtotal = menuItem.price.value * requestedItem.quantity;
      totalAmount += subtotal;

      validatedItems.push({
        menuItemId: menuItem.id,
        name: menuItem.name,
        currentPrice: menuItem.price.value,
        isAvailable: menuItem.isAvailable,
        requestedQuantity: requestedItem.quantity,
        subtotal,
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      validatedItems,
      totalAmount: Math.round(totalAmount * 100) / 100,
    };
  }
}