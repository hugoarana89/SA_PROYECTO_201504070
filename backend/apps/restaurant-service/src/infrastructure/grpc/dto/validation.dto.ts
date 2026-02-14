import { IsNotEmpty, IsString, IsArray, ValidateNested, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemValidationDto {
  @IsNotEmpty()
  @IsString()
  menu_item_id: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  price: number;
}

export class ValidateOrderItemsRequestDto {
  @IsNotEmpty()
  @IsString()
  restaurant_id: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemValidationDto)
  items: OrderItemValidationDto[];
}