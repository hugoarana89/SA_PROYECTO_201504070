import { Inject, Injectable } from '@nestjs/common';
import * as restaurantRepositoryInterface from '../../../domain/ports/restaurant.repository.interface';

export interface ListRestaurantsRequest {
  page: number;
  limit: number;
  is_active?: boolean;
  search?: string;
}

@Injectable()
export class ListRestaurantsUseCase {
  constructor(
    @Inject(restaurantRepositoryInterface.RESTAURANT_REPOSITORY)
    private readonly restaurantRepository: restaurantRepositoryInterface.RestaurantRepository,
  ) {}

  async execute(request: ListRestaurantsRequest): Promise<{ items: any[]; total: number }> {
    return await this.restaurantRepository.findAll(
      request.page,
      request.limit,
      request.is_active,
      request.search,
    );
  }
}