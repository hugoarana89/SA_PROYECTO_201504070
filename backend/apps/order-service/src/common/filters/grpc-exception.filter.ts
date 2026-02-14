import { Catch, ArgumentsHost, Logger } from '@nestjs/common';
import { BaseRpcExceptionFilter, RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { throwError } from 'rxjs';
import { 
  DomainException, 
  OrderNotFoundException, 
  InvalidOrderStatusException,
  UnauthorizedOrderAccessException,
  OrderValidationException 
} from '../../domain/exceptions/domain.exceptions';

@Catch()
export class GrpcValidationExceptionFilter extends BaseRpcExceptionFilter {
  private readonly logger = new Logger(GrpcValidationExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    this.logger.error('Error capturado en gRPC:', {
      name: exception.name,
      message: exception.message,
      stack: exception.stack,
    });

    // Domain Exceptions
    if (exception instanceof OrderNotFoundException) {
      return throwError(() => new RpcException({
        code: status.NOT_FOUND,
        message: exception.message,
      }));
    }

    if (exception instanceof InvalidOrderStatusException) {
      return throwError(() => new RpcException({
        code: status.FAILED_PRECONDITION,
        message: exception.message,
      }));
    }

    if (exception instanceof UnauthorizedOrderAccessException) {
      return throwError(() => new RpcException({
        code: status.PERMISSION_DENIED,
        message: exception.message,
      }));
    }

    if (exception instanceof OrderValidationException) {
      return throwError(() => new RpcException({
        code: status.INVALID_ARGUMENT,
        message: exception.message,
      }));
    }

    if (exception instanceof DomainException) {
      return throwError(() => new RpcException({
        code: status.INVALID_ARGUMENT,
        message: exception.message,
      }));
    }

    // Errores de validación
    if (exception.code === 3) {
      return throwError(() => exception);
    }

    // Errores de base de datos
    if (exception.code === 'ER_ACCESS_DENIED_ERROR' || exception.code === 'ECONNREFUSED') {
      this.logger.error('Error de conexión a base de datos:', exception.message);
      return throwError(() => new RpcException({
        code: status.UNAVAILABLE,
        message: 'Database not available',
      }));
    }

    // Error por defecto
    this.logger.error('Error interno no manejado:', exception);
    return throwError(() => new RpcException({
      code: status.INTERNAL,
      message: `Internal server error: ${exception.message || 'Unknown error'}`,
    }));
  }
}