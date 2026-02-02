import { NestFactory } from '@nestjs/core';
import { AuthServiceModule } from './auth-service.module';
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AuthServiceModule);

  app.setGlobalPrefix('api/v2');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,        // Elimina propiedades que no estén en el DTO
      forbidNonWhitelisted: true, // Lanza error si envían propiedades extra
      transform: true,        // Convierte los tipos automáticamente
    }),
  );

  await app.listen(process.env.port2 ?? 4002);
}
bootstrap();
