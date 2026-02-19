import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DeliveryEntity } from './entities/Deliveryentity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DELIVERY_DB_HOST', 'localhost'),
        port: configService.get('DELIVERY_DB_PORT', 3306),
        username: configService.get('DELIVERY_DB_USERNAME', 'root'),
        password: configService.get('DELIVERY_DB_PASSWORD', 'password'),
        database: configService.get('DELIVERY_DB_DATABASE', 'delivery_db'),
        autoLoadEntities: true,
        synchronize: configService.get('DELIVERY_DB_SYNCHRONIZE', false),
        logging: configService.get('DELIVERY_DB_LOGGING', true),
      }),
    }),
    TypeOrmModule.forFeature([DeliveryEntity]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}