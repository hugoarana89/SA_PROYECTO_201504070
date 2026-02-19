import { IsString, IsNotEmpty } from 'class-validator';

export class FindByRoleDto {
  @IsString()
  @IsNotEmpty()
  role: string;
}