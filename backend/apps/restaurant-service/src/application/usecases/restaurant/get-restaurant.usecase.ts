import { Inject, Injectable } from '@nestjs/common';
import * as restaurantRepositoryInterface from '../../../domain/ports/restaurant.repository.interface';
import { RestaurantNotFoundException } from '../../../domain/exceptions/domain.exceptions';

@Injectable()
export class GetRestaurantUseCase {
  constructor(
    @Inject(restaurantRepositoryInterface.RESTAURANT_REPOSITORY)
    private readonly restaurantRepository: restaurantRepositoryInterface.RestaurantRepository,
  ) {}

  async execute(id: string): Promise<any> {
    const restaurant = await this.restaurantRepository.findById(id);
    
    if (!restaurant) {
      throw new RestaurantNotFoundException(id);
    }

    return restaurant;
  }
}