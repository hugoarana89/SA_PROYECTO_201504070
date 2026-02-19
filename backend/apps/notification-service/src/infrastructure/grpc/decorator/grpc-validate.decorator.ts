// ─────────────────────────────────────────────────────────────
// Infrastructure: GrpcValidate decorator
// Reutilizado del patrón del Delivery-Service.
// ─────────────────────────────────────────────────────────────

import { applyDecorators, UsePipes } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

export function GrpcValidate(
  dtoClass:    any,
  methodName?: string,
  serviceName: string = 'NotificationService',
) {
  return applyDecorators(
    GrpcMethod(serviceName, methodName),
    UsePipes({
      async transform(data: any) {
        if (!data) {
          throw new RpcException({
            code:    status.INVALID_ARGUMENT,
            message: 'No se proporcionaron datos',
          });
        }

        const dtoInstance = plainToInstance(dtoClass, data);
        const errors      = await validate(dtoInstance as object, {
          whitelist:           true,
          forbidNonWhitelisted: false,
        });

        if (errors.length > 0) {
          const errorMessages = errors
            .map((e) =>
              e.constraints
                ? Object.values(e.constraints)
                : [`Campo ${e.property} es inválido`],
            )
            .flat()
            .join(', ');

          throw new RpcException({
            code:    status.INVALID_ARGUMENT,
            message: `Error de validación: ${errorMessages}`,
          });
        }

        return dtoInstance;
      },
    }),
  );
}
