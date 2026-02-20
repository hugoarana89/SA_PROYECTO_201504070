import { Module }       from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { DatabaseModule }              from './infrastructure/persistence/DatabaseModule';
import { TypeOrmDeliveryRepository }   from './infrastructure/persistence/repositories/Typeormdeliveryrepository';
import { DELIVERY_REPOSITORY }         from './domain/ports/DeliveryRepository';
import { AcceptOrderUseCase }          from './application/usecases/AcceptOrderUseCase';
import { UpdateDeliveryStatusUseCase } from './application/usecases/UpdateDeliveryStatusUseCase';
import { DeliveryController }          from './presentation/controllers/DeliveryController';
import { ListDeliveriesUseCase } from './application/usecases/ListDeliveriesUsecase';

@Module({
  imports: [
    // Variables de entorno disponibles en toda la app
    ConfigModule.forRoot({ isGlobal: true }),

    // Conexión a MySQL + registro de DeliveryEntity
    DatabaseModule,
  ],
  controllers: [DeliveryController],
  providers: [
    // ── Casos de uso ────────────────────────────────────────
    AcceptOrderUseCase,
    UpdateDeliveryStatusUseCase,
    ListDeliveriesUseCase,
    

    // ── Inyección de dependencia (DIP) ───────────────────────
    // Cambia `useClass` aquí para cambiar de implementación.
    {
      provide:  DELIVERY_REPOSITORY,
      useClass: TypeOrmDeliveryRepository,
    },
  ],
})
export class DeliveryServiceModule {}