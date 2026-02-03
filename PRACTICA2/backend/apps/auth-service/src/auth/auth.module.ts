import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGrpcController } from './auth.grpc.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  providers: [AuthService],
  controllers: [AuthGrpcController],
})
export class AuthModule {}
