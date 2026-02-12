import { applyDecorators, UsePipes } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { RpcException } from '@nestjs/microservices';

export function GrpcValidate(dtoClass: any, methodName?: string) {
  return applyDecorators(
    GrpcMethod('RestaurantCatalogService', methodName),
    UsePipes({
      async transform(data: any, metadata: any) {
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