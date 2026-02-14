import { Catch, ArgumentsHost, Logger } from '@nestjs/common';
import { BaseRpcExceptionFilter, RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { throwError } from 'rxjs';
import { DomainException } from '../../domain/exceptions/domain.exceptions';

@Catch()
export class GrpcValidationExceptionFilter extends BaseRpcExceptionFilter {
  private readonly logger = new Logger(GrpcValidationExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    this.logger.error('Error capturado en gRPC:', {
      name: exception.name,
      message: exception.message,
      stack: exception.stack,
    });

    if (exception instanceof DomainException) {
      return throwError(
        () => new RpcException({
          code: status.INVALID_ARGUMENT,
          message: exception.message,
        }),
      );
    }

    if (exception.name === 'RestaurantNotFoundException') {
      return throwError(
        () => new RpcException({
          code: status.NOT_FOUND,
          message: exception.message,
        }),
      );
    }

    if (exception.name === 'MenuItemNotFoundException') {
      return throwError(
        () => new RpcException({
          code: status.NOT_FOUND,
          message: exception.message,
        }),
      );
    }

    if (exception.name === 'UnauthorizedRestaurantAccessException') {
      return throwError(
        () => new RpcException({
          code: status.PERMISSION_DENIED,
          message: exception.message,
        }),
      );
    }

    // Errores de TypeORM / Base de datos
    if (exception.code === 'ER_ACCESS_DENIED_ERROR' || exception.code === 'ECONNREFUSED') {
      this.logger.error('Error de conexión a base de datos:', exception.message);
      return throwError(
        () => new RpcException({
          code: status.UNAVAILABLE,
          message: 'Base de datos no disponible',
        }),
      );
    }

    if (exception.code === 'ER_BAD_DB_ERROR') {
      return throwError(
        () => new RpcException({
          code: status.NOT_FOUND,
          message: 'Base de datos no encontrada, ejecute las migraciones',
        }),
      );
    }

    // Errores de validación
    if (exception.code === 3) {
      return throwError(() => exception);
    }

    // Error por defecto con más información
    this.logger.error('Error interno no manejado:', exception);
    return throwError(
      () => new RpcException({
        code: status.INTERNAL,
        message: `Internal server error: ${exception.message || 'Unknown error'}`,
      }),
    );
  }
}