import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RestaurantEntity } from './entities/restaurant.entity';
import { MenuItemEntity } from './entities/menu-item.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('RESTAURANT_DB_HOST', 'localhost'),
        port: configService.get('RESTAURANT_DB_PORT', 3306),
        username: configService.get('RESTAURANT_DB_USERNAME', 'root'),
        password: configService.get('RESTAURANT_DB_PASSWORD', 'password'),
        database: configService.get('RESTAURANT_DB_DATABASE', 'restaurant_db'),
        autoLoadEntities: true,
        synchronize: configService.get('RESTAURANT_DB_SYNCHRONIZE', false),
        logging: configService.get('RESTAURANT_DB_LOGGING', true),
      }),
    }),
    TypeOrmModule.forFeature([RestaurantEntity, MenuItemEntity]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}