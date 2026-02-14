import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './infrastructure/persistence/database.module';
import { RestaurantCatalogGrpcController } from './infrastructure/grpc/controllers/restaurant-catalog.grpc.controller';

// Use Cases - Restaurant
import { CreateRestaurantUseCase } from './application/usecases/restaurant/create-restaurant.usecase';
import { UpdateRestaurantUseCase } from './application/usecases/restaurant/update-restaurant.usecase';
import { DeleteRestaurantUseCase } from './application/usecases/restaurant/delete-restaurant.usecase';
import { GetRestaurantUseCase } from './application/usecases/restaurant/get-restaurant.usecase';
import { ListRestaurantsUseCase } from './application/usecases/restaurant/list-restaurants.usecase';

// Use Cases - Menu
import { CreateMenuItemUseCase } from './application/usecases/menu/create-menu-item.usecase';
import { UpdateMenuItemUseCase } from './application/usecases/menu/update-menu-item.usecase';
import { DeleteMenuItemUseCase } from './application/usecases/menu/delete-menu-item.usecase';
import { ListMenuItemsUseCase } from './application/usecases/menu/list-menu-items.usecase';

// Use Cases - Validation
import { ValidateOrderItemsUseCase } from './application/usecases/validation/validate-order-items.usecase';

// Repositories
import { TypeOrmRestaurantRepository } from './infrastructure/persistence/repositories/typeorm-restaurant.repository';
import { TypeOrmMenuItemRepository } from './infrastructure/persistence/repositories/typeorm-menu-item.repository';

// Domain Ports
import { RESTAURANT_REPOSITORY } from './domain/ports/restaurant.repository.interface';
import { MENU_ITEM_REPOSITORY } from './domain/ports/menu-item.repository.interface';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
  ],
  controllers: [RestaurantCatalogGrpcController],
  providers: [
    // Repositories
    {
      provide: RESTAURANT_REPOSITORY,
      useClass: TypeOrmRestaurantRepository,
    },
    {
      provide: MENU_ITEM_REPOSITORY,
      useClass: TypeOrmMenuItemRepository,
    },
    
    // Restaurant Use Cases
    CreateRestaurantUseCase,
    UpdateRestaurantUseCase,
    DeleteRestaurantUseCase,
    GetRestaurantUseCase,
    ListRestaurantsUseCase,
    
    // Menu Use Cases
    CreateMenuItemUseCase,
    UpdateMenuItemUseCase,
    DeleteMenuItemUseCase,
    ListMenuItemsUseCase,
    
    // Validation Use Cases
    ValidateOrderItemsUseCase,
  ],
})
export class RestaurantServiceModule {}