import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NotificationEntity } from './entities/Notificationentity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('NOTIFICATION_DB_HOST', 'localhost'),
        port: configService.get('NOTIFICATION_DB_PORT', 3306),
        username: configService.get('NOTIFICATION_DB_USERNAME', 'root'),
        password: configService.get('NOTIFICATION_DB_PASSWORD', 'password'),
        database: configService.get('NOTIFICATION_DB_DATABASE', 'notification_db'),
        autoLoadEntities: true,
        synchronize: configService.get('NOTIFICATION_DB_SYNCHRONIZE', false),
        logging: configService.get('NOTIFICATION_DB_LOGGING', true),
      }),
    }),
    TypeOrmModule.forFeature([NotificationEntity]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}