import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsNumber, Min } from 'class-validator';

export class CreateRestaurantDto {
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  owner_id?: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsNotEmpty()
  @IsString()
  opening_time: string;

  @IsNotEmpty()
  @IsString()
  closing_time: string;
}

export class UpdateRestaurantDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  opening_time?: string;

  @IsOptional()
  @IsString()
  closing_time?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class DeleteRestaurantDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsString()
  owner_id: string;
}

export class GetRestaurantDto {
  @IsNotEmpty()
  @IsString()
  id: string;
}

export class ListRestaurantsDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsString()
  search?: string;
}

export class ListRestaurantsByOwnerDto {
  @IsNotEmpty()
  @IsString()
  owner_id: string;
}

export class GetRestaurantMenuRequestDto {
  @IsNotEmpty()
  @IsString()
  restaurant_id: string;

  @IsOptional()
  @IsBoolean()
  only_available?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number;
}