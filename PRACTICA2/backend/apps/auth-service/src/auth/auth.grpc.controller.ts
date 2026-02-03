import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { GrpcMethod, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { GrpcValidate } from '../common/decorators/grpc-validate.decorator';
import { ValidateTokenDto } from './dto/token.dto';

@Controller()
export class AuthGrpcController {
  constructor(private readonly authService: AuthService) {}

  @GrpcValidate(RegisterDto, 'Register')
  async register(@Payload() data: RegisterDto) {
    return this.authService.register(
      data.email,
      data.password,
      data.role,
    );
  }

  @GrpcValidate(LoginDto, 'Login')
  login(@Payload() data: LoginDto) {
    return this.authService.login(data.email, data.password);
  }

  @GrpcValidate(ValidateTokenDto, 'ValidateToken')
  validateToken(@Payload() data: ValidateTokenDto) {
    return this.authService.validateToken(data.token);
  }
}
