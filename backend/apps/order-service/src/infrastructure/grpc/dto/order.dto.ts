import { IsNotEmpty, IsString, IsOptional, IsNumber, Min, IsArray, ValidateNested, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemRequestDto {
  @IsNotEmpty()
  @IsString()
  menu_item_id: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  price: number;

  @IsNotEmpty()
  @IsString()
  product_name: string;
}

export class CreateOrderRequestDto {
  @IsNotEmpty()
  @IsString()
  client_id: string;

  @IsNotEmpty()
  @IsString()
  restaurant_id: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemRequestDto)
  items: OrderItemRequestDto[];
}

export class CancelOrderRequestDto {
  @IsNotEmpty()
  @IsString()
  order_id: string;

  @IsNotEmpty()
  @IsString()
  client_id: string;
}

export class AcceptOrderRequestDto {
  @IsNotEmpty()
  @IsString()
  order_id: string;

  @IsNotEmpty()
  @IsString()
  restaurant_id: string;
}

export class RejectOrderRequestDto {
  @IsNotEmpty()
  @IsString()
  order_id: string;

  @IsNotEmpty()
  @IsString()
  restaurant_id: string;

  @IsOptional()
  @IsString()
  reason: string;
}

export class CompleteOrderRequestDto {
  @IsNotEmpty()
  @IsString()
  order_id: string;

  @IsNotEmpty()
  @IsString()
  restaurant_id: string;
}

export class GetOrderRequestDto {
  @IsNotEmpty()
  @IsString()
  order_id: string;
}

export class ListOrdersRequestDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  status?: string;
}

export class ListRestaurantOrdersRequestDto {
  @IsNotEmpty()
  @IsString()
  restaurant_id: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  status?: string;
}

export class ListClientOrdersRequestDto {
  @IsNotEmpty()
  @IsString()
  client_id: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  status?: string;
}