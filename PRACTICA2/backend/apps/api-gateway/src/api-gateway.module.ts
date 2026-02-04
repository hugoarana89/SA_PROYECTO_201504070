import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // hace que las variables de entorno estén disponibles en toda la aplicación
      envFilePath: '.env',
    }),
    AuthModule,
  ],

})
export class ApiGatewayModule {}