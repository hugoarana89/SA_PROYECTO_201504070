import { Module } from '@nestjs/common';
import { RestaurantServiceController } from './restaurant-service.controller';
import { RestaurantServiceService } from './restaurant-service.service';

@Module({
  imports: [],
  controllers: [RestaurantServiceController],
  providers: [RestaurantServiceService],
})
export class RestaurantServiceModule {}
