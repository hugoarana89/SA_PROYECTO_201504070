import { Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { BaseRpcExceptionFilter, RpcException } from '@nestjs/microservices';
import { throwError } from 'rxjs';
import { ValidationError } from 'class-validator';
import { status as GrpcStatus } from '@grpc/grpc-js';

@Catch()
export class GrpcValidationExceptionFilter extends BaseRpcExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    // Manejar RpcException
    if (exception instanceof RpcException) {
      const error = exception.getError();
      
      // Mapear códigos gRPC a códigos HTTP
      const grpcToHttpStatus = {
        [GrpcStatus.INVALID_ARGUMENT]: HttpStatus.BAD_REQUEST,
        [GrpcStatus.NOT_FOUND]: HttpStatus.NOT_FOUND,
        [GrpcStatus.ALREADY_EXISTS]: HttpStatus.CONFLICT,
        [GrpcStatus.PERMISSION_DENIED]: HttpStatus.FORBIDDEN,
        [GrpcStatus.UNAUTHENTICATED]: HttpStatus.UNAUTHORIZED,
        [GrpcStatus.FAILED_PRECONDITION]: HttpStatus.PRECONDITION_FAILED,
        [GrpcStatus.ABORTED]: HttpStatus.CONFLICT,
        [GrpcStatus.OUT_OF_RANGE]: HttpStatus.BAD_REQUEST,
        [GrpcStatus.UNIMPLEMENTED]: HttpStatus.NOT_IMPLEMENTED,
        [GrpcStatus.INTERNAL]: HttpStatus.INTERNAL_SERVER_ERROR,
        [GrpcStatus.UNAVAILABLE]: HttpStatus.SERVICE_UNAVAILABLE,
        [GrpcStatus.DATA_LOSS]: HttpStatus.INTERNAL_SERVER_ERROR,
      };

      if (typeof error === 'object' && 'code' in error && 'message' in error) {
        const httpStatus = grpcToHttpStatus[error.code as number] || HttpStatus.INTERNAL_SERVER_ERROR;
        
        return throwError(() => ({
          statusCode: httpStatus,
          message: error.message,
          error: HttpStatus[httpStatus],
        }));
      }
      
      return throwError(() => ({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error || 'Internal server error',
        error: 'Internal Server Error',
      }));
    }

    // Manejar errores de validación
    if (Array.isArray(exception) && exception[0] instanceof ValidationError) {
      const validationErrors = exception as ValidationError[];
      const messages = validationErrors
        .map(error => Object.values(error.constraints || {}))
        .flat()
        .join(', ');

      return throwError(() => ({
        statusCode: HttpStatus.BAD_REQUEST,
        message: `Validation failed: ${messages}`,
        error: 'Bad Request',
        details: validationErrors.map(error => ({
          field: error.property,
          errors: Object.values(error.constraints || {})
        }))
      }));
    }

    return super.catch(exception, host);
  }
}