import { NestFactory } from '@nestjs/core';
import { ApiGatewayModule } from './api-gateway.module';
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe';

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule);
  
  app.setGlobalPrefix('api'); // prefijo global para todas las rutas

  // Configuración del pipe de validación global
  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // elimina las propiedades que no están en el DTO
      forbidNonWhitelisted: true, // lanza un error si hay propiedades no permitidas
      transform: true, // transforma los payloads a los tipos definidos en los DTOs
    }),
  );
  
  // Configuración CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  const port = process.env.GATEWAY_PORT || 4000;
  await app.listen(port);
  console.log(`🚀 API Gateway running on port ${port}`);
  console.log(`📚 Swagger docs available at http://localhost:${port}/api-docs`);
}
bootstrap();
