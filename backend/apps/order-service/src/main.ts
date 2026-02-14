import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { OrderServiceModule } from './order-service.module';
import { join } from 'path';
import { GrpcValidationExceptionFilter } from './common/filters/grpc-exception.filter';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    OrderServiceModule,
    {
      transport: Transport.GRPC,
      options: {
        package: 'order',
        protoPath: process.env.NODE_ENV === 'production' 
          ? join(__dirname, '../../proto/order.proto')
          : join(process.cwd(), 'proto/order.proto'),
        url: `0.0.0.0:${process.env.ORDER_GRPC_PORT || 50053}`,
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
  console.log(`✅ Order-Service gRPC running on port ${process.env.ORDER_GRPC_PORT || 50053}`);
}

bootstrap();