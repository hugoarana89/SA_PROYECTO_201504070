import { IsString, IsNotEmpty } from 'class-validator';

export class FindByRoleDto {
  @IsString()
  @IsNotEmpty()
  role: string;
}

export class GetAllUsersDto {}

export class GetEmailByUserIdDto {
  @IsString()
  @IsNotEmpty()
  userId: string;
}