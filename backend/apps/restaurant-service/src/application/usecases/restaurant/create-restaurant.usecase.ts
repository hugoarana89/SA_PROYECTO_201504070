import { Inject, Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import * as restaurantRepositoryInterface from '../../../domain/ports/restaurant.repository.interface';
import { Restaurant } from '../../../domain/entities/restaurant.entity';
import { Address } from '../../../domain/value-objects/address.value-object';
import { Time } from '../../../domain/value-objects/time.value-object';

export interface CreateRestaurantRequest {
  ownerId: string;
  name: string;
  description: string;
  address: Address;
  phone: string;
  openingTime: Time;
  closingTime: Time;
}

@Injectable()
export class CreateRestaurantUseCase {
  private readonly logger = new Logger(CreateRestaurantUseCase.name);

  constructor(
    @Inject(restaurantRepositoryInterface.RESTAURANT_REPOSITORY)
    private readonly restaurantRepository: restaurantRepositoryInterface.RestaurantRepository,
  ) {}

  async execute(request: CreateRestaurantRequest): Promise<Restaurant> {
    try {
      const restaurant = new Restaurant(
        uuidv4(),
        request.ownerId,
        request.name,
        request.description,
        request.address,
        request.phone,
        request.openingTime,
        request.closingTime,
        true,
        new Date(),
        new Date(),
      );

      this.logger.log(`Creando restaurante: ${request.name} para owner: ${request.ownerId}`);
      const saved = await this.restaurantRepository.save(restaurant);
      this.logger.log(`Restaurante creado con ID: ${saved.id}`);
      return saved;
    } catch (error) {
      this.logger.error('Error al crear restaurante:', error);
      throw error;
    }
  }
}