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
        if (!data) {
          throw new RpcException({
            code: status.INVALID_ARGUMENT,
            message: 'No se proporcionaron datos',
          });
        }

        // Crear una copia limpiando valores vacíos que deberían ser opcionales
        const cleanedData = { ...data };
        
        // Convertir strings vacíos a undefined para propiedades opcionales
        Object.keys(cleanedData).forEach(key => {
          if (cleanedData[key] === '') {
            cleanedData[key] = undefined;
          }
        });

        const dtoInstance = plainToInstance(dtoClass, cleanedData);
        const errors = await validate(dtoInstance, {
          skipMissingProperties: false,
          whitelist: true,
          forbidNonWhitelisted: false,
        });
        
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
            code: status.INVALID_ARGUMENT,
            message: `Error de validación: ${errorMessages}`,
          });
        }
        
        return dtoInstance;
      },
    })
  );
}