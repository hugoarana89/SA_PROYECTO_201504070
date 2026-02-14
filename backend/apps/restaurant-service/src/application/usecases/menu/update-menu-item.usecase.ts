import { Inject, Injectable } from '@nestjs/common';
import * as menuItemRepositoryInterface from '../../../domain/ports/menu-item.repository.interface';
import { Price } from '../../../domain/value-objects/price.value-object';
import { MenuItemNotFoundException } from '../../../domain/exceptions/domain.exceptions';

export interface UpdateMenuItemRequest {
  id: string;
  name?: string;
  description?: string;
  price?: Price;
  imageUrl?: string;
  isAvailable?: boolean;
  restaurantId: string; // Para validación
}

@Injectable()
export class UpdateMenuItemUseCase {
  constructor(
    @Inject(menuItemRepositoryInterface.MENU_ITEM_REPOSITORY)
    private readonly menuItemRepository: menuItemRepositoryInterface.MenuItemRepository,
  ) {}

  async execute(request: UpdateMenuItemRequest): Promise<any> {
    const menuItem = await this.menuItemRepository.findById(request.id);
    
    if (!menuItem) {
      throw new MenuItemNotFoundException(request.id);
    }

    if (menuItem.restaurantId !== request.restaurantId) {
      throw new Error('Menu item does not belong to this restaurant');
    }

    menuItem.updateDetails(
      request.name ?? menuItem.name,
      request.description ?? menuItem.description,
      request.price ?? menuItem.price,
      request.imageUrl ?? menuItem.imageUrl,
      request.isAvailable ?? menuItem.isAvailable,
    );

    return await this.menuItemRepository.update(request.id, menuItem);
  }
}