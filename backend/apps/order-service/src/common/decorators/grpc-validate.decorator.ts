import { applyDecorators, UsePipes } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { RpcException } from '@nestjs/microservices';

export function GrpcValidate(dtoClass: any, methodName?: string) {
  return applyDecorators(
    GrpcMethod('OrderService', methodName),
    UsePipes({
      async transform(data: any, metadata: any) {
        // Ignorar metadata de gRPC
        if (!data || data.call || data.metadata || data._events) {
          return data;
        }

        const dtoInstance = plainToInstance(dtoClass, data);
        
        const errors = await validate(dtoInstance);
        if (errors.length > 0) {
          const errorMessages = errors
            .map(error => Object.values(error.constraints || {}))
            .flat()
            .join(', ');
          
          throw new RpcException({
            code: 3,
            message: `Validation failed: ${errorMessages}`,
          });
        }
        
        return dtoInstance;
      },
    })
  );
}