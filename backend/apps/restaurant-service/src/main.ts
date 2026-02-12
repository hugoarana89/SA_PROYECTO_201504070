import { NestFactory } from '@nestjs/core';
import { RestaurantServiceModule } from './restaurant-service.module';

async function bootstrap() {
  const app = await NestFactory.create(RestaurantServiceModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
