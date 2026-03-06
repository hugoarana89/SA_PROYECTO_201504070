// ─────────────────────────────────────────────────────────────
// DTOs gRPC del Delivery-Service
// ─────────────────────────────────────────────────────────────

import {
  IsUUID,
  IsEnum,
  IsOptional,
  IsString,
  IsInt,
  IsPositive,
  IsNotEmpty,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum DeliveryStatusGrpc {
  ASIGNADA  = 'ASIGNADA',
  EN_CAMINO = 'EN_CAMINO',
  ENTREGADA = 'ENTREGADA',
  CANCELADA = 'CANCELADA',
}

// ── AcceptOrder ───────────────────────────────────────────────
export class AcceptOrderRequestDto {
  @IsUUID('4')
  order_id: string;

  @IsUUID('4')
  delivery_user_id: string;
}

// ── UpdateDeliveryStatus ──────────────────────────────────────
export class UpdateDeliveryStatusRequestDto {
  @IsUUID('4')
  delivery_id: string;

  @IsEnum(DeliveryStatusGrpc)
  status: DeliveryStatusGrpc;

  @IsOptional()
  @IsString()
  cancel_reason?: string;

  /**
   * Foto de prueba de entrega en base64.
   * Obligatoria cuando status = ENTREGADA.
   * La validación de presencia se hace en el UseCase para mantener la lógica en el dominio.
   */
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'proof_image_url no puede ser una cadena vacía si se proporciona' })
  proof_image_url?: string;
}

// ── ListDeliveries ────────────────────────────────────────────
// ASIGNADA no es filtrable: solo aplica a EN_CAMINO, ENTREGADA, CANCELADA
const FILTERABLE_STATUSES = [
  DeliveryStatusGrpc.EN_CAMINO,
  DeliveryStatusGrpc.ENTREGADA,
  DeliveryStatusGrpc.CANCELADA,
] as const;

export class ListDeliveriesRequestDto {
  @IsOptional()
  //@IsUUID('4')
  delivery_user_id?: string;

  @IsOptional()
  @IsEnum(FILTERABLE_STATUSES, {
    message: `status_filter debe ser uno de: ${FILTERABLE_STATUSES.join(', ')}`,
  })
  status_filter?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}
