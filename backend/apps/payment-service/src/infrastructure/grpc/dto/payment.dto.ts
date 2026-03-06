// ─────────────────────────────────────────────────────────────
// DTOs gRPC: validaciones de entrada al microservicio
// ─────────────────────────────────────────────────────────────

import {
  IsUUID, IsEnum, IsOptional, IsString, IsNumber,
  IsInt, IsPositive, IsBoolean, Min, Max, IsDateString,
  MinLength, MaxLength, IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod, PaymentStatus } from '../../../domain/entities/Payment';
import { DiscountType }                 from '../../../domain/entities/Coupon';

// ── Wallet ────────────────────────────────────────────────────

export class CreateWalletDto {
  @IsUUID('4')
  user_id: string;
}

export class GetWalletByUserDto {
  @IsUUID('4')
  user_id: string;
}

export class GetWalletByIdDto {
  @IsUUID('4')
  wallet_id: string;
}

export class RechargeWalletDto {
  @IsUUID('4')
  user_id: string;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;
}

export class ListTransactionsDto {
  @IsUUID('4')
  wallet_id: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}

// ── Coupon ────────────────────────────────────────────────────

export class CreateCouponDto {
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  code: string;

  @IsEnum(DiscountType)
  discount_type: DiscountType;

  @IsNumber()
  @IsPositive()
  discount_value: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  min_order_amount?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  max_uses?: number;

  @IsOptional()
  @IsDateString()
  expires_at?: string;
}

export class GetCouponByIdDto {
  @IsUUID('4')
  coupon_id: string;
}

export class GetCouponByCodeDto {
  @IsString()
  @IsNotEmpty()
  code: string;
}

export class ListCouponsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}

export class UpdateCouponDto {
  @IsUUID('4')
  coupon_id: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  discount_value?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  min_order_amount?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  max_uses?: number;

  @IsOptional()
  @IsDateString()
  expires_at?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class DeleteCouponDto {
  @IsUUID('4')
  coupon_id: string;
}

export class ValidateCouponDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsNumber()
  @IsPositive()
  order_amount: number;
}

// ── Payment ───────────────────────────────────────────────────

export class CreatePaymentDto {
  @IsUUID('4')
  order_id: string;

  @IsUUID('4')
  user_id: string;

  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsOptional()
  @IsString()
  coupon_code?: string;
}

export class GetPaymentByIdDto {
  @IsUUID('4')
  payment_id: string;
}

export class GetPaymentByOrderDto {
  @IsUUID('4')
  order_id: string;
}

export class ListPaymentsDto {
  @IsOptional()
  @IsUUID('4')
  user_id?: string;

  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}

export class UpdatePaymentStatusDto {
  @IsUUID('4')
  payment_id: string;

  @IsEnum(['PAGADO', 'FALLIDO', 'REEMBOLSADO'])
  status: 'PAGADO' | 'FALLIDO' | 'REEMBOLSADO';
}
