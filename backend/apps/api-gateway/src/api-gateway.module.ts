import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { RestaurantModule } from './restaurant/restaurant.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // hace que las variables de entorno estén disponibles en toda la aplicación
      envFilePath: '.env',
    }),
    AuthModule,
    RestaurantModule,
  ],

})
export class ApiGatewayModule {}