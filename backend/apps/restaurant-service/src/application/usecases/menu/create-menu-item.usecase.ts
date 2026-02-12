import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import * as menuItemRepositoryInterface from '../../../domain/ports/menu-item.repository.interface';
import * as restaurantRepositoryInterface from '../../../domain/ports/restaurant.repository.interface';
import { MenuItem } from '../../../domain/entities/menu-item.entity';
import { Price } from '../../../domain/value-objects/price.value-object';
import { RestaurantNotFoundException } from '../../../domain/exceptions/domain.exceptions';

export interface CreateMenuItemRequest {
  restaurantId: string;
  name: string;
  description: string;
  price: Price;
  imageUrl: string;
  isAvailable: boolean;
}

@Injectable()
export class CreateMenuItemUseCase {
  constructor(
    @Inject(menuItemRepositoryInterface.MENU_ITEM_REPOSITORY)
    private readonly menuItemRepository: menuItemRepositoryInterface.MenuItemRepository,
    @Inject(restaurantRepositoryInterface.RESTAURANT_REPOSITORY)
    private readonly restaurantRepository: restaurantRepositoryInterface.RestaurantRepository,
  ) {}

  async execute(request: CreateMenuItemRequest): Promise<MenuItem> {
    // Verificar que el restaurante existe
    const restaurant = await this.restaurantRepository.findById(request.restaurantId);
    if (!restaurant) {
      throw new RestaurantNotFoundException(request.restaurantId);
    }

    const menuItem = new MenuItem(
      uuidv4(),
      request.restaurantId,
      request.name,
      request.description,
      request.price,
      request.imageUrl || '',
      request.isAvailable,
      new Date(),
      new Date(),
    );

    return await this.menuItemRepository.save(menuItem);
  }
}