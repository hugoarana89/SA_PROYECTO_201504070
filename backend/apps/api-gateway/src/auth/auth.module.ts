import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'AUTH_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'auth',
          // busca el archivo proto en la carpeta proto en la raiz del proyecto
          protoPath: process.env.NODE_ENV === 'production'
            ? join(__dirname, '../../proto/auth.proto')
            : join(process.cwd(), 'proto/auth.proto'),
          url: process.env.NODE_ENV === 'production'
            ? process.env.AUTH_SERVICE_URL
            : `0.0.0.0:${process.env.AUTH_GRPC_PORT || 50051}`,
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
  controllers: [AuthController], // Agrega el AuthController al módulo
  providers: [AuthService], // Agrega el AuthService al módulo
  exports: [AuthService], // Exporta el AuthService para que pueda ser utilizado en otros módulos
})
export class AuthModule { }
