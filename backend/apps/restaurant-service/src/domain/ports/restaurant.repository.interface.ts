import { Restaurant } from '../entities/restaurant.entity';

export const RESTAURANT_REPOSITORY = 'RESTAURANT_REPOSITORY';

export interface RestaurantRepository {
  save(restaurant: Restaurant): Promise<Restaurant>;
  update(id: string, restaurant: Partial<Restaurant>): Promise<Restaurant>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<Restaurant | null>;
  findByOwnerId(ownerId: string): Promise<Restaurant[]>;
  findAll(
    page: number,
    limit: number,
    onlyActive?: boolean,
    search?: string,
  ): Promise<{ items: Restaurant[]; total: number }>;
  exists(id: string): Promise<boolean>;
}