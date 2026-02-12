import { MenuItem } from '../entities/menu-item.entity';

export const MENU_ITEM_REPOSITORY = 'MENU_ITEM_REPOSITORY';

export interface MenuItemRepository {
  save(menuItem: MenuItem): Promise<MenuItem>;
  update(id: string, menuItem: Partial<MenuItem>): Promise<MenuItem>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<MenuItem | null>;
  findByRestaurantId(
    restaurantId: string,
    onlyAvailable?: boolean,
    page?: number,
    limit?: number,
  ): Promise<{ items: MenuItem[]; total: number }>;
  findByIdsAndRestaurant(ids: string[], restaurantId: string): Promise<MenuItem[]>;
  exists(id: string): Promise<boolean>;
}