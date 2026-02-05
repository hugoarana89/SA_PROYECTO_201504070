import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AuthServiceModule } from './auth-service.module';
import { join } from 'path';
import { GrpcValidationExceptionFilter } from './common/filters/grpc-exception.filter';

async function bootstrap() {
  
  // esto e par desarrollo protoPath: join(process.cwd(), 'proto/auth.proto'),
  // esto es par proucción protoPath: join(__dirname, '../../proto/auth.proto'),

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AuthServiceModule,
    {
      transport: Transport.GRPC,
      options: {
        package: 'auth',
        // busca el archivo proto en la carpeta proto en la raiz del proyectp
        protoPath: process.env.NODE_ENV === 'production' ? join(__dirname, '../../proto/auth.proto') : join(process.cwd(), 'proto/auth.proto'),
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