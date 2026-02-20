import { Inject, Injectable } from '@nestjs/common';
import * as restaurantRepositoryInterface from '../../../domain/ports/restaurant.repository.interface';
import { RestaurantNotFoundException } from '../../../domain/exceptions/domain.exceptions';

@Injectable()
export class ListRestaurantsByOwnerUseCase {
  constructor(
    @Inject(restaurantRepositoryInterface.RESTAURANT_REPOSITORY)
    private readonly restaurantRepository: restaurantRepositoryInterface.RestaurantRepository,
  ) {}

  async execute(ownerId: string): Promise<any> {
    const restaurant = await this.restaurantRepository.findByOwnerId(ownerId);
    
    if (!restaurant) {
      throw new RestaurantNotFoundException(ownerId);
    }

    return restaurant;
  }
}