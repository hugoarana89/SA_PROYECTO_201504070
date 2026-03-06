import { NestFactory }     from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join }            from 'path';
import { PaymentServiceModule } from './payment-service.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    PaymentServiceModule,
    {
      transport: Transport.GRPC,
      options: {
        package:  'payment',
        protoPath: process.env.NODE_ENV === 'production'
          ? join(__dirname, '../proto/payment.proto')
          : join(process.cwd(), 'proto/payment.proto'),
        url: `0.0.0.0:${process.env.PAYMENT_GRPC_PORT || 50056}`,
        loader: {
          keepCase: true,
          longs:    String,
          enums:    String,
          oneofs:   true,
        },
      },
    },
  );

  await app.listen();
  console.log(`🚀 Payment Service gRPC running on port ${process.env.PAYMENT_GRPC_PORT || 50056}`);
}
bootstrap();
