import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('AUTH_DB_HOST', 'localhost'),
        port: configService.get('AUTH_DB_PORT', 3306),
        username: configService.get('AUTH_DB_USERNAME', 'root'),
        password: configService.get('AUTH_DB_PASSWORD', 'password'),
        database: configService.get('AUTH_DB_DATABASE', 'auth_db'),
        //entities: [__dirname + '/../**/*.entity{.ts,.js}'], //solo usarla cuando hay una aplicación
        autoLoadEntities: true, //usarla cuando el proyecto es monorepo
        synchronize: configService.get('AUTH_DB_SYNCHRONIZE', false), // FALSE en producción
        logging: configService.get('AUTH_DB_LOGGING', true),
      }),
    }),
  ],
})
export class DatabaseModule {}