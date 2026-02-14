import { Inject, Injectable } from '@nestjs/common';
import * as menuItemRepositoryInterface from '../../../domain/ports/menu-item.repository.interface';

export interface ListMenuItemsRequest {
  restaurantId: string;
  onlyAvailable?: boolean;
  page?: number;
  limit?: number;
}

@Injectable()
export class ListMenuItemsUseCase {
  constructor(
    @Inject(menuItemRepositoryInterface.MENU_ITEM_REPOSITORY)
    private readonly menuItemRepository: menuItemRepositoryInterface.MenuItemRepository,
  ) {}

  async execute(request: ListMenuItemsRequest): Promise<{ items: any[]; total: number }> {
    return await this.menuItemRepository.findByRestaurantId(
      request.restaurantId,
      request.onlyAvailable,
      request.page || 1,
      request.limit || 10,
    );
  }
}