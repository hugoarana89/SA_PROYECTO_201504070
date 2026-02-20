import { NestFactory }  from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join }         from 'path';
import { DeliveryServiceModule } from './delivery-service.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    DeliveryServiceModule,
    {
      transport: Transport.GRPC,
      options: {
        package: 'delivery',
        protoPath: process.env.NODE_ENV === 'production' 
          ? join(__dirname, '../../proto/delivery.proto')
          : join(process.cwd(), 'proto/delivery.proto'),
        url: `0.0.0.0:${process.env.DELIVERY_GRPC_PORT || 50054}`,
        loader: {
          keepCase: true,
          longs: String,
          enums: String,
          oneofs: true,
        },
      },
    },
  );

  await app.listen();
  console.log(`🚀 Delivery-Service gRPC escuchando en el puerto ${process.env.DELIVERY_GRPC_PORT ?? 50054}`);
}

bootstrap();
