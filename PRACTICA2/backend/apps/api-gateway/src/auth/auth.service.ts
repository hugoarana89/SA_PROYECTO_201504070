import {
  Inject,
  Injectable,
  OnModuleInit,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { lastValueFrom, from } from 'rxjs';
import { AuthGrpcService } from './grpc/auth.grpc.interface';

@Injectable()
export class AuthService implements OnModuleInit {
  private authGrpc: AuthGrpcService;

  constructor(
    @Inject('AUTH_SERVICE') private readonly client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.authGrpc = this.client.getService<AuthGrpcService>('AuthService');
  }

  async login(email: string, password: string) {
    try {
      return await lastValueFrom(
        from(this.authGrpc.Login({ email, password })),
      );
    } catch (error: any) {
      this.handleGrpcError(error);
    }
  }

  async register(email: string, password: string, role: string) {
    try {
      return await lastValueFrom(
        from(this.authGrpc.Register({ email, password, role })),
      );
    } catch (error: any) {
      this.handleGrpcError(error);
    }
  }

  async validateToken(token: string) {
    try {
      return await lastValueFrom(
        from(this.authGrpc.ValidateToken({ token })),
      );
    } catch (error: any) {
      this.handleGrpcError(error);
    }
  }

  /**
   * Traduce errores gRPC a HTTP
   */
  private handleGrpcError(error: any): never {
    switch (error.code) {
      case status.ALREADY_EXISTS:
        throw new HttpException(error.details, HttpStatus.CONFLICT);

      case status.UNAUTHENTICATED:
        throw new HttpException(error.details, HttpStatus.UNAUTHORIZED);

      case status.PERMISSION_DENIED:
        throw new HttpException(error.details, HttpStatus.FORBIDDEN);

      case status.NOT_FOUND:
        throw new HttpException(error.details, HttpStatus.NOT_FOUND);

      default:
        throw new HttpException(
          error.details || 'Internal server error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
    }
  }
}
