import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { DatabaseModule } from './infrastructure/persistence/database.module';
import { OrderGrpcController } from './infrastructure/grpc/controllers/order.grpc.controller';

// Use Cases
import { CreateOrderUseCase } from './application/usecases/create-order.usecase';
import { CancelOrderUseCase } from './application/usecases/cancel-order.usecase';
import { AcceptOrderUseCase } from './application/usecases/accept-order.usecase';
import { RejectOrderUseCase } from './application/usecases/reject-order.usecase';
import { CompleteOrderUseCase } from './application/usecases/complete-order.usecase';
import { GetOrderUseCase } from './application/usecases/get-order.usecase';
import { ListOrdersUseCase } from './application/usecases/list-orders.usecase';

// Repositories
import { TypeOrmOrderRepository } from './infrastructure/persistence/repositories/typeorm-order.repository';

// gRPC Clients
import { RestaurantCatalogGrpcClient } from './infrastructure/grpc/clients/restaurant-catalog.grpc.client';

// Domain Ports
import { ORDER_REPOSITORY } from './domain/ports/order.repository.interface';
import { RESTAURANT_CATALOG_CLIENT } from './domain/ports/restaurant-catalog.client.interface';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    ClientsModule.register([
      {
        name: 'RESTAURANT_CATALOG_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'restaurant_catalog',
          protoPath: process.env.NODE_ENV === 'production' 
            ? join(__dirname, '../../proto/restaurant_catalog.proto')
            : join(process.cwd(), 'proto/restaurant_catalog.proto'),
          url: process.env.RESTAURANT_SERVICE_URL || '0.0.0.0:50052',
          loader: {
            keepCase: true,
            longs: String,
            enums: String,
            oneofs: true,
          },
        },
      },
    ]),
  ],
  controllers: [OrderGrpcController],
  providers: [
    // Repositories
    {
      provide: ORDER_REPOSITORY,
      useClass: TypeOrmOrderRepository,
    },
    
    // gRPC Clients
    {
      provide: RESTAURANT_CATALOG_CLIENT,
      useClass: RestaurantCatalogGrpcClient,
    },
    
    // Use Cases
    CreateOrderUseCase,
    CancelOrderUseCase,
    AcceptOrderUseCase,
    RejectOrderUseCase,
    CompleteOrderUseCase,
    GetOrderUseCase,
    ListOrdersUseCase,
  ],
})
export class OrderServiceModule {}