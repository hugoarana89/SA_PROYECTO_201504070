// ─────────────────────────────────────────────────────────────
// DTOs gRPC del Notification-Service
// ─────────────────────────────────────────────────────────────

import {
  IsUUID,
  IsEmail,
  IsString,
  IsNotEmpty,
  IsArray,
  IsNumber,
  IsPositive,
  IsInt,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

// ── Sub-DTO: producto de orden ────────────────────────────────
export class OrderProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsNumber()
  @IsPositive()
  price: number;
}

// ── NotifyOrderCreated ────────────────────────────────────────
export class NotifyOrderCreatedRequestDto {
  @IsUUID('4')
  user_id: string;

  @IsString()
  @IsNotEmpty()
  client_name: string;

  @IsEmail()
  client_email: string;

  @IsString()
  @IsNotEmpty()
  order_id: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderProductDto)
  products: OrderProductDto[];

  @IsNumber()
  @IsPositive()
  total_amount: number;

  @IsString()
  @IsNotEmpty()
  created_at: string;
}

// ── NotifyOrderCancelledByClient ──────────────────────────────
export class NotifyOrderCancelledByClientRequestDto {
  @IsUUID('4')
  user_id: string;

  @IsString()
  @IsNotEmpty()
  client_name: string;

  @IsEmail()
  client_email: string;

  @IsString()
  @IsNotEmpty()
  order_id: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderProductDto)
  products: OrderProductDto[];

  @IsString()
  @IsNotEmpty()
  cancelled_at: string;
}

// ── NotifyOrderInTransit ──────────────────────────────────────
export class NotifyOrderInTransitRequestDto {
  @IsUUID('4')
  user_id: string;

  @IsEmail()
  client_email: string;

  @IsString()
  @IsNotEmpty()
  order_id: string;

  @IsUUID('4')
  delivery_user_id: string;

  @IsString()
  @IsNotEmpty()
  delivery_name: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderProductDto)
  products: OrderProductDto[];
}

// ── NotifyOrderCancelledByRestaurant ──────────────────────────
export class NotifyOrderCancelledByRestaurantRequestDto {
  @IsUUID('4')
  user_id: string;

  @IsEmail()
  client_email: string;

  @IsString()
  @IsNotEmpty()
  order_id: string;

  @IsString()
  @IsNotEmpty()
  restaurant_name: string;

  @IsString()
  @IsNotEmpty()
  cancel_reason: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderProductDto)
  products: OrderProductDto[];
}

// ── NotifyOrderCancelledByDelivery ────────────────────────────
export class NotifyOrderCancelledByDeliveryRequestDto {
  @IsUUID('4')
  user_id: string;

  @IsEmail()
  client_email: string;

  @IsString()
  @IsNotEmpty()
  order_id: string;

  @IsUUID('4')
  delivery_user_id: string;

  @IsString()
  @IsNotEmpty()
  delivery_name: string;

  @IsString()
  @IsNotEmpty()
  cancel_reason: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderProductDto)
  products: OrderProductDto[];
}

// ── NotifyOrderRejected ───────────────────────────────────────
export class NotifyOrderRejectedRequestDto {
  @IsUUID('4')
  user_id: string;

  @IsEmail()
  client_email: string;

  @IsString()
  @IsNotEmpty()
  order_id: string;

  @IsString()
  @IsNotEmpty()
  restaurant_name: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderProductDto)
  products: OrderProductDto[];
}
