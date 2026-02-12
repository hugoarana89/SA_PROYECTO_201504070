import { Inject, Injectable } from '@nestjs/common';
import * as restaurantRepositoryInterface from '../../../domain/ports/restaurant.repository.interface';
import { Address } from '../../../domain/value-objects/address.value-object';
import { Time } from '../../../domain/value-objects/time.value-object';
import { RestaurantNotFoundException, UnauthorizedRestaurantAccessException } from '../../../domain/exceptions/domain.exceptions';

export interface UpdateRestaurantRequest {
  id: string;
  name?: string;
  description?: string;
  address?: Address;
  phone?: string;
  openingTime?: Time;
  closingTime?: Time;
  isActive?: boolean;
}

@Injectable()
export class UpdateRestaurantUseCase {
  constructor(
    @Inject(restaurantRepositoryInterface.RESTAURANT_REPOSITORY)
    private readonly restaurantRepository: restaurantRepositoryInterface.RestaurantRepository,
  ) {}

  async execute(request: UpdateRestaurantRequest): Promise<any> {
    const restaurant = await this.restaurantRepository.findById(request.id);
    
    if (!restaurant) {
      throw new RestaurantNotFoundException(request.id);
    }

    // Actualizar solo los campos proporcionados
    restaurant.updateDetails(
      request.name ?? restaurant.name,
      request.description ?? restaurant.description,
      request.address ?? restaurant.address,
      request.phone ?? restaurant.phone,
      request.openingTime ?? restaurant.openingTime,
      request.closingTime ?? restaurant.closingTime,
    );

    if (request.isActive !== undefined) {
      if (request.isActive) {
        restaurant.activate();
      } else {
        restaurant.deactivate();
      }
    }

    return await this.restaurantRepository.update(request.id, restaurant);
  }
}