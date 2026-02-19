import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { DeliveryController } from './delivery.controller';
import { DeliveryService } from './delivery.service';
import { join } from 'path';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    AuthModule,
    ClientsModule.register([
      {
        name: 'DELIVERY_SERVICE',
        transport: Transport.GRPC,
        options: {
            package: 'delivery',
            protoPath: process.env.NODE_ENV === 'production'
              ? join(__dirname, '../../proto/delivery.proto')
              : join(process.cwd(), 'proto/delivery.proto'),
            url: process.env.NODE_ENV === 'production'
              ? process.env.DELIVERY_SERVICE_URL
              : `0.0.0.0:${process.env.DELIVERY_GRPC_PORT || 50054}`,
            loader: {
              keepCase: true,
              longs: String,
              enums: String,
              defaults: true,
              oneofs: true,
            },
          },
        },
    ]),
    ],
    controllers: [DeliveryController],
    providers: [DeliveryService],
    exports: [DeliveryService],
})
export class DeliveryModule { }