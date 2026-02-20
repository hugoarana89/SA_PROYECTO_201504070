// ─────────────────────────────────────────────────────────────
// Module: NotificationModule (API Gateway)
// Registra el cliente gRPC y exporta NotificationService
// para que otros módulos del Gateway puedan inyectarlo.
// ─────────────────────────────────────────────────────────────

import { Module }                   from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join }                     from 'path';

import { NotificationController } from './notification.controller';
import { NotificationService }    from './notification.service';
import { AuthModule }             from '../auth/auth.module';

@Module({
  imports: [
    AuthModule,
    ClientsModule.register([
      {
        name:      'NOTIFICATION_SERVICE',
        transport: Transport.GRPC,
        options: {
          package:   'notification',
          protoPath: process.env.NODE_ENV === 'production'
            ? join(__dirname, '../../proto/notification.proto')
            : join(process.cwd(), 'proto/notification.proto'),
          url: process.env.NODE_ENV === 'production'
            ? process.env.NOTIFICATION_SERVICE_URL
            : `0.0.0.0:${process.env.NOTIFICATION_GRPC_PORT || 50055}`,
          loader: {
            keepCase: true,
            longs:    String,
            enums:    String,
            defaults: true,
            oneofs:   true,
          },
        },
      },
    ]),
  ],
  controllers: [NotificationController],
  providers:   [NotificationService],
  exports:     [NotificationService],   // ← clave: otros módulos pueden inyectarlo
})
export class NotificationModule {}