import { Module }  from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join }    from 'path';
import { PaymentController } from './payment.controller';
import { PaymentService }    from './payment.service';
import { AuthModule }        from '../auth/auth.module';

@Module({
  imports: [
    AuthModule,
    ClientsModule.register([
      {
        name: 'PAYMENT_SERVICE',
        transport: Transport.GRPC,
        options: {
          package:  'payment',
          protoPath: process.env.NODE_ENV === 'production'
            ? join(__dirname, '../../proto/payment.proto')
            : join(process.cwd(), 'proto/payment.proto'),
          url: process.env.NODE_ENV === 'production'
            ? process.env.PAYMENT_SERVICE_URL
            : `0.0.0.0:${process.env.PAYMENT_GRPC_PORT || 50056}`,
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
  controllers: [PaymentController],
  providers:   [PaymentService],
  exports:     [PaymentService],
})
export class PaymentModule {}
