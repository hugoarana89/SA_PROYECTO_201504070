import { Module }  from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { DatabaseModule } from './infrastructure/persistence/DatabaseModule';
import {
  TypeOrmWalletRepository,
  TypeOrmWalletTransactionRepository,
  TypeOrmCouponRepository,
  TypeOrmPaymentRepository,
} from './infrastructure/persistence/repositories/repositories';
import {
  WALLET_REPOSITORY, WALLET_TRANSACTION_REPOSITORY,
  COUPON_REPOSITORY, PAYMENT_REPOSITORY,
} from './domain/ports/repositories';
import { WalletUseCase }  from './application/usecases/WalletUseCase';
import { CouponUseCase }  from './application/usecases/CouponUseCase';
import { PaymentUseCase } from './application/usecases/PaymentUseCase';
import { PaymentController } from './presentation/controllers/PaymentController';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    DatabaseModule,
  ],
  controllers: [PaymentController],
  providers: [
    // Repositorios (DIP: token → implementación)
    { provide: WALLET_REPOSITORY,             useClass: TypeOrmWalletRepository },
    { provide: WALLET_TRANSACTION_REPOSITORY, useClass: TypeOrmWalletTransactionRepository },
    { provide: COUPON_REPOSITORY,             useClass: TypeOrmCouponRepository },
    { provide: PAYMENT_REPOSITORY,            useClass: TypeOrmPaymentRepository },

    // Casos de uso
    WalletUseCase,
    CouponUseCase,
    PaymentUseCase,
  ],
})
export class PaymentServiceModule {}
