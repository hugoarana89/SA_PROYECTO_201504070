import { Inject, Injectable } from '@nestjs/common';
import * as restaurantRepositoryInterface from '../../../domain/ports/restaurant.repository.interface';
import { RestaurantNotFoundException, UnauthorizedRestaurantAccessException } from '../../../domain/exceptions/domain.exceptions';

export interface DeleteRestaurantRequest {
  id: string;
  ownerId: string;
}

@Injectable()
export class DeleteRestaurantUseCase {
  constructor(
    @Inject(restaurantRepositoryInterface.RESTAURANT_REPOSITORY)
    private readonly restaurantRepository: restaurantRepositoryInterface.RestaurantRepository,
  ) {}

  async execute(request: DeleteRestaurantRequest): Promise<void> {
    const restaurant = await this.restaurantRepository.findById(request.id);
    
    if (!restaurant) {
      throw new RestaurantNotFoundException(request.id);
    }

    if (restaurant.ownerId !== request.ownerId) {
      throw new UnauthorizedRestaurantAccessException(request.id, request.ownerId);
    }

    await this.restaurantRepository.delete(request.id);
  }
}