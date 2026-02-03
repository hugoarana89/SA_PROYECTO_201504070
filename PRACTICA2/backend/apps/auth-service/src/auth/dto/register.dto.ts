import {
  IsEmail,
  IsEnum,
  IsString,
  MinLength,
  Matches,
} from 'class-validator';
import { Role } from '../../common/enums/role.enum';

export class RegisterDto {
  @IsEmail()
  @Matches(/\S/, { message: 'email should not be empty' })
  email: string;

  @IsString()
  @MinLength(6)
  @Matches(/\S/, { message: 'password should not be empty' })
  password: string;

  @IsEnum(Role)
  role: Role;
}
