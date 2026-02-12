import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RestaurantController } from './restaurant.controller';
import { RestaurantService } from './restaurant.service';
import { join } from 'path';
import { AuthModule } from '../auth/auth.module'; // ← IMPORTAR AUTH MODULE

@Module({
  imports: [
    AuthModule, // ← AÑADIR AQUÍ
    ClientsModule.register([
      {
        name: 'RESTAURANT_CATALOG_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'restaurant_catalog',
          protoPath: process.env.NODE_ENV === 'production'
            ? join(__dirname, '../../proto/restaurant_catalog.proto')
            : join(process.cwd(), 'proto/restaurant_catalog.proto'),
          url: process.env.NODE_ENV === 'production'
            ? process.env.RESTAURANT_SERVICE_URL
            : `0.0.0.0:${process.env.RESTAURANT_GRPC_PORT || 50052}`,
          loader: {
            keepCase: true,
            longs: String,
            enums: String,
            defaults: true,
            oneofs: true,
          },
        },
      }
    ]),
  ],
  controllers: [RestaurantController],
  providers: [RestaurantService],
  exports: [RestaurantService],
})
export class RestaurantModule {}