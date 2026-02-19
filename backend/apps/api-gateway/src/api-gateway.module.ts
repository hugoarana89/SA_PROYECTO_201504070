import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { RestaurantModule } from './restaurant/restaurant.module';
import { OrderModule } from './order/order.module';
import { DeliveryModule } from './delivery/delivery.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // hace que las variables de entorno estén disponibles en toda la aplicación
      envFilePath: '.env',
    }),
    AuthModule,
    RestaurantModule,
    OrderModule,
    DeliveryModule,
  ],

})
export class ApiGatewayModule {}