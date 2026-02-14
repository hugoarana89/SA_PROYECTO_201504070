import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { join } from 'path';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    AuthModule,
    ClientsModule.register([
      {
        name: 'ORDER_SERVICE',
        transport: Transport.GRPC,
        options: {
            package: 'order',
            protoPath: process.env.NODE_ENV === 'production'
              ? join(__dirname, '../../proto/order.proto')
              : join(process.cwd(), 'proto/order.proto'),
            url: process.env.NODE_ENV === 'production'
              ? process.env.ORDER_SERVICE_URL
              : `0.0.0.0:${process.env.ORDER_GRPC_PORT || 50053}`,
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
    controllers: [OrderController],
    providers: [OrderService],
    exports: [OrderService],
})
export class OrderModule { }