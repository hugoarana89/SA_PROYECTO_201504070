import { IsEmail, IsString, MinLength, Matches } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @Matches(/\S/, { message: 'email should not be empty' })
  email: string;

  @IsString()
  @MinLength(6)
  @Matches(/\S/, { message: 'password should not be empty' })
  password: string;
}