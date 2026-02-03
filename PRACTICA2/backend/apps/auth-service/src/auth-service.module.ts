import { Module } from '@nestjs/common';
import { AuthServiceController } from './auth-service.controller';
import { AuthServiceService } from './auth-service.service';
import { UsersModule } from './modules/users/users.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Esto permite que DatabaseModule vea las variables sin volver a importar el módulo
      envFilePath: '.env',
    }),
    UsersModule, 
    DatabaseModule, 
    AuthModule
  ],
  controllers: [AuthServiceController],
  providers: [AuthServiceService],
})
export class AuthServiceModule {}
