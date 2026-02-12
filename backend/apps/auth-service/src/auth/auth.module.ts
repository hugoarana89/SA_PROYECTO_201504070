import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGrpcController } from './auth.grpc.controller';
import { UsersModule } from '../users/users.module';

@Module({
  // se tiene que importar UsersModule para usar UsersService dentro de AuthService
  // si se usa solo así no funciona la inyección de dependencias
  imports: [UsersModule],
  providers: [AuthService],
  controllers: [AuthGrpcController],
})
export class AuthModule {}
