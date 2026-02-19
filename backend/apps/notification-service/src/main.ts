import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join }         from 'path';
import { NotificationServiceModule } from './notification-service.module';

async function bootstrap() {

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    NotificationServiceModule,
    {
      transport: Transport.GRPC,
      options: {
        package: 'notification',
        protoPath: process.env.NODE_ENV === 'production'
          ? join(__dirname, '../../proto/notification.proto')
          : join(process.cwd(), 'proto/notification.proto'),
        url: `0.0.0.0:${process.env.NOTIFICATION_GRPC_PORT || 50055}`,
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
  console.log(`🚀 Notification-Service gRPC escuchando en el puerto ${process.env.NOTIFICATION_GRPC_PORT ?? 50055}`);
}
bootstrap();
