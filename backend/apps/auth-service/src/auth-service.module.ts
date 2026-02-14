import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Esto permite que DatabaseModule vea las variables sin volver a importar el módulo
      envFilePath: '.env',
    }),
    DatabaseModule,
    UsersModule, 
    AuthModule
  ]
})
export class AuthServiceModule {}
