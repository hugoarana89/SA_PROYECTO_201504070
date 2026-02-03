import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AuthServiceModule } from './auth-service.module';
import { join } from 'path';
import { GrpcValidationExceptionFilter } from './common/filters/grpc-exception.filter';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AuthServiceModule,
    {
      transport: Transport.GRPC,
      options: {
        package: 'auth',
        protoPath: join(process.cwd(), 'proto/auth.proto'),
        url: `0.0.0.0:${process.env.AUTH_GRPC_PORT || 50051}`,
        loader: {
          keepCase: true,
          longs: String,
          enums: String,
          oneofs: true,
        },
      },
    },
  );

  // Remover el ValidationPipe global
  app.useGlobalFilters(new GrpcValidationExceptionFilter());

  await app.listen();
  console.log(`✅ Auth-Service gRPC running on port ${process.env.AUTH_GRPC_PORT || 50051}`);
}

bootstrap();