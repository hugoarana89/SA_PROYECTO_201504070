import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { RestaurantServiceModule } from './restaurant-service.module';
import { join } from 'path';
import { GrpcValidationExceptionFilter } from './common/filters/grpc-exception.filter';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    RestaurantServiceModule,
    {
      transport: Transport.GRPC,
      options: {
        package: 'restaurant_catalog',
        protoPath: process.env.NODE_ENV === 'production' 
          ? join(__dirname, '../../proto/restaurant_catalog.proto')
          : join(process.cwd(), 'proto/restaurant_catalog.proto'),
        url: `0.0.0.0:${process.env.RESTAURANT_GRPC_PORT || 50052}`,
        loader: {
          keepCase: true,
          longs: String,
          enums: String,
          oneofs: true,
        },
      },
    },
  );

  app.useGlobalFilters(new GrpcValidationExceptionFilter());

  await app.listen();
  console.log(`✅ Restaurant-Catalog-Service gRPC running on port ${process.env.RESTAURANT_CATALOG_GRPC_PORT || 50052}`);
}

bootstrap();