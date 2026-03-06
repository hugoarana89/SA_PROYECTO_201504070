import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { RestaurantServiceModule } from './restaurant-service.module';
import { join } from 'path';
import { GrpcValidationExceptionFilter } from './common/filters/grpc-exception.filter';

async function bootstrap() {
  // 1. Creamos la aplicación base (Hybrid Application)
  // Usamos create en lugar de createMicroservice para permitir múltiples estrategias
  const app = await NestFactory.create(RestaurantServiceModule);

  // 2. Conectamos el Microservicio gRPC
  app.connectMicroservice<MicroserviceOptions>({
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
  });

  /*
  // 3. Conectamos el Microservicio RabbitMQ
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
      queue: 'cola_pedidos',
      noAck: false, // Importante: Requiere ack manual en el controlador
      queueOptions: {
        durable: true, // Recomendado para que la cola sobreviva a reinicios de RabbitMQ
      },
    },
  });*/

  // Filtros globales
  app.useGlobalFilters(new GrpcValidationExceptionFilter());

  // 4. Iniciamos todos los microservicios conectados
  await app.startAllMicroservices();
  
  // Si además quieres que escuche peticiones HTTP (opcional)
  // await app.listen(3000); 

  console.log(`✅ Restaurant-Catalog-Service gRPC & RabbitMQ están corriendo`);
}

bootstrap();