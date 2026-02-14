import { Inject, Injectable } from '@nestjs/common';
import * as menuItemRepositoryInterface from '../../../domain/ports/menu-item.repository.interface';
import { MenuItemNotFoundException } from '../../../domain/exceptions/domain.exceptions';

export interface DeleteMenuItemRequest {
  id: string;
  restaurantId: string;
}

@Injectable()
export class DeleteMenuItemUseCase {
  constructor(
    @Inject(menuItemRepositoryInterface.MENU_ITEM_REPOSITORY)
    private readonly menuItemRepository: menuItemRepositoryInterface.MenuItemRepository,
  ) {}

  async execute(request: DeleteMenuItemRequest): Promise<void> {
    const menuItem = await this.menuItemRepository.findById(request.id);
    
    if (!menuItem) {
      throw new MenuItemNotFoundException(request.id);
    }

    if (menuItem.restaurantId !== request.restaurantId) {
      throw new Error('Menu item does not belong to this restaurant');
    }

    await this.menuItemRepository.delete(request.id);
  }
}