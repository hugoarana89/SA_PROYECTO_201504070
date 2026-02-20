// ─────────────────────────────────────────────────────────────
// Module: NotificationServiceModule
// DIP: Aquí se conectan las interfaces con sus implementaciones.
//      Para cambiar SendGrid → otro proveedor: solo cambia useClass
//      en el provider EMAIL_SENDER.
// ─────────────────────────────────────────────────────────────

import { Module }       from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { DatabaseModule }                  from './infrastructure/persistence/DatabaseModule';
import { SendGridEmailSender }             from './infrastructure/email/SendGridEmailSender';
import { TypeOrmNotificationRepository }   from './infrastructure/persistence/repositories/TypeOrmNotificationRepository';
import { NOTIFICATION_REPOSITORY }         from './domain/ports/NotificationRepository';
import { EMAIL_SENDER }                    from './domain/ports/EmailSender';

import { SendOrderCreatedNotificationUseCase }    from './application/usecases/SendOrderCreatedNotificationUseCase';
import { SendOrderCancelledByClientUseCase }      from './application/usecases/SendOrderCancelledByClientUseCase';
import { SendOrderInTransitNotificationUseCase }  from './application/usecases/SendOrderInTransitNotificationUseCase';
import { SendOrderCancelledByRestaurantUseCase }  from './application/usecases/SendOrderCancelledByRestaurantUseCase';
import { SendOrderCancelledByDeliveryUseCase }    from './application/usecases/SendOrderCancelledByDeliveryUseCase';
import { SendOrderRejectedNotificationUseCase }   from './application/usecases/SendOrderRejectedNotificationUseCase';
import { NotificationController }                from './presentation/controllers/NotificationController';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
  ],
  controllers: [NotificationController],
  providers: [
    // ── Casos de uso ─────────────────────────────────────────
    SendOrderCreatedNotificationUseCase,
    SendOrderCancelledByClientUseCase,
    SendOrderInTransitNotificationUseCase,
    SendOrderCancelledByRestaurantUseCase,
    SendOrderCancelledByDeliveryUseCase,
    SendOrderRejectedNotificationUseCase,

    // ── Repositorio (DIP) ─────────────────────────────────────
    {
      provide:  NOTIFICATION_REPOSITORY,
      useClass: TypeOrmNotificationRepository,
    },

    // ── Email sender (DIP) ────────────────────────────────────
    // Para cambiar de SendGrid: reemplaza SendGridEmailSender aquí.
    {
      provide:  EMAIL_SENDER,
      useClass: SendGridEmailSender,
    },
  ],
})
export class NotificationServiceModule {}