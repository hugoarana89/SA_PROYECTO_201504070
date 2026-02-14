import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OrderEntity } from './entities/order.entity';
import { OrderItemEntity } from './entities/order-item.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          type: 'mysql',
          host: configService.get('ORDER_DB_HOST', 'localhost'),
          port: configService.get('ORDER_DB_PORT', 3306),
          username: configService.get('ORDER_DB_USERNAME', 'root'),
          password: configService.get('ORDER_DB_PASSWORD', 'password'),
          database: configService.get('ORDER_DB_DATABASE', 'order_db'),
          entities: [OrderEntity, OrderItemEntity],
          autoLoadEntities: true,
          synchronize: configService.get('ORDER_DB_SYNCHRONIZE', false),
          logging: configService.get('ORDER_DB_LOGGING', true),
        };
      },
    }),
    TypeOrmModule.forFeature([OrderEntity, OrderItemEntity]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}