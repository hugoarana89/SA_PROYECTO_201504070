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
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 3306),
        username: configService.get('DB_USERNAME', 'root'),
        password: configService.get('DB_PASSWORD', 'password'),
        database: configService.get('DB_DATABASE', 'auth_db'),
        //entities: [__dirname + '/../**/*.entity{.ts,.js}'], //solo usarla cuando hay una aplicación
        autoLoadEntities: true, //usarla cuando el proyecto es monorepo
        synchronize: configService.get('DB_SYNCHRONIZE', false), // FALSE en producción
        logging: configService.get('DB_LOGGING', true),
      }),
    }),
  ],
})
export class DatabaseModule {}