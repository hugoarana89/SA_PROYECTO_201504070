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
    @Inject('AUTH_SERVICE') private readonly client: ClientGrpc, // inyecta el cliente gRPC que trae @nestjs/microservices
  ) {}

  // se ejecuta cuando el módulo se inicializa
  onModuleInit() {
    this.authGrpc = this.client.getService<AuthGrpcService>('AuthService');
  }

  // llama al método Login del servicio gRPC
  async login(email: string, password: string) {
    try {
      return await lastValueFrom(
        from(this.authGrpc.Login({ email, password })),
      );
    } catch (error: any) {
      this.handleGrpcError(error);
    }
  }

  // llama al método RefreshToken del servicio gRPC
  async refreshToken(refreshToken: string) {
    try {
      return await lastValueFrom(
        from(this.authGrpc.RefreshToken({ refreshToken })),
      );
    } catch (error: any) {
      this.handleGrpcError(error);
    }
  }

  // llama al método Register del servicio gRPC
  async register(email: string, password: string, role: string) {
    try {
      return await lastValueFrom(
        from(this.authGrpc.Register({ email, password, role })),
      );
    } catch (error: any) {
      this.handleGrpcError(error);
    }
  }

  // valida si un token es valido llamando al método ValidateToken del servicio gRPC
  async validateToken(token: string) {
    try {
      return await lastValueFrom(
        from(this.authGrpc.ValidateToken({ token })),
      );
    } catch (error: any) {
      this.handleGrpcError(error);
    }
  }

  // llama al método Logout del servicio gRPC
  async logout(refreshToken: string) {
    try {
      return await lastValueFrom(
        from(this.authGrpc.Logout({ refreshToken })),
      );
    } catch (error: any) {
      this.handleGrpcError(error);
    }
  }

  // llama al método GetAllUsers del servicio gRPC
  async getAllUsers() {
    try {
      return await lastValueFrom(from(this.authGrpc.GetAllUsers({})));
    } catch (error: any) {
      this.handleGrpcError(error);
    }
  }

  // llama al método FindByRole del servicio gRPC
  async findByRole(role: string) {
    try {
      return await lastValueFrom(
        from(this.authGrpc.FindByRole({ role })),
      );
    } catch (error: any) {
      this.handleGrpcError(error);
    }
  }

  // Obtener el email de usuario a partir de su id
  async getEmailByUserId(id: string) {
    try {
      return await lastValueFrom(
        from(this.authGrpc.GetEmailByUserId({ userId: id })),
      );
    } catch (error: any) {
      this.handleGrpcError(error);
    }
  }

  // maneja los errores gRPC y los convierte en excepciones HTTP
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
