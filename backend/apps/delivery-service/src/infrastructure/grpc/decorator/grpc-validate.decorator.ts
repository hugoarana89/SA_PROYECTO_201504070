// microservicio-delivery/src/infrastructure/grpc/decorators/grpc-validate.decorator.ts
import { applyDecorators, UsePipes } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';

export function GrpcValidate(dtoClass: any, methodName?: string, serviceName: string = 'DeliveryService') {
  return applyDecorators(
    GrpcMethod(serviceName, methodName),
    UsePipes({
      async transform(data: any, metadata: any) {
        // Validar que los datos requeridos existen
        if (!data) {
          throw new RpcException({
            code: status.INVALID_ARGUMENT,
            message: 'No se proporcionaron datos',
          });
        }

        // Transformar y validar
        const dtoInstance = plainToInstance(dtoClass, data);
        const errors = await validate(dtoInstance);
        
        if (errors.length > 0) {
          const errorMessages = errors
            .map(error => {
              if (error.constraints) {
                return Object.values(error.constraints);
              }
              return [`Campo ${error.property} es inválido`];
            })
            .flat()
            .join(', ');
          
          throw new RpcException({
            code: status.INVALID_ARGUMENT, // 3 = INVALID_ARGUMENT
            message: `Error de validación: ${errorMessages}`,
          });
        }
        
        return dtoInstance;
      },
    })
  );
}