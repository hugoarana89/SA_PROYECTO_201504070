import { Module }         from '@nestjs/common';
import { TypeOrmModule }  from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WalletEntity, WalletTransactionEntity, CouponEntity, PaymentEntity } from './entities/entities';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports:    [ConfigModule],
      inject:     [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        type:        'mysql',
        host:        cfg.get('PAYMENT_DB_HOST',     'localhost'),
        port:        cfg.get<number>('PAYMENT_DB_PORT', 3306),
        username:    cfg.get('PAYMENT_DB_USERNAME',     'root'),
        password:    cfg.get('PAYMENT_DB_PASSWORD', ''),
        database:    cfg.get('PAYMENT_DB_DATABASE',     'payment_db'),
        entities:    [WalletEntity, WalletTransactionEntity, CouponEntity, PaymentEntity],
        synchronize: false, // La DB ya está creada con el SQL proporcionado
        logging:     cfg.get('PAYMENT_DB_LOGGING', 'false') === 'true',
      }),
    }),
    TypeOrmModule.forFeature([WalletEntity, WalletTransactionEntity, CouponEntity, PaymentEntity]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
