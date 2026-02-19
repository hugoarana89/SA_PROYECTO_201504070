import { Controller } from '@nestjs/common';
import { GrpcMethod, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Role } from '../common/enums/role.enum';
import { FindByRoleDto } from './dto/user.dto';
import { GrpcValidate } from '../common/decorators/grpc-validate.decorator';
import {
  ValidateTokenDto,
  RefreshTokenDto,
  LogoutDto
} from './dto/token.dto';

/*
 Controlador gRPC para el servicio de autenticación
 Aqui no se usa http, sino gRPC
 Se utilizó GrpcValidate que es un decorador para validar los DTOs de entrada,
  ya que solo de esa forma se pueden validar
 */

@Controller()
export class AuthGrpcController {
  constructor(private readonly authService: AuthService) {}

  @GrpcValidate(RegisterDto, 'Register')
  register(@Payload() data: RegisterDto) {
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

  @GrpcValidate(RefreshTokenDto, 'RefreshToken')
  refreshToken(@Payload() data: RefreshTokenDto) {
    return this.authService.refreshToken(data.refreshToken);
  }

  @GrpcValidate(LogoutDto, 'Logout')
  logout(@Payload() data: LogoutDto) {
    return this.authService.logout(data.refreshToken);
  }

  // Obtener todos los usuarios (solo accesible por administradores)
  @GrpcMethod('AuthService', 'GetAllUsers')
  getAllUsers() {
    return this.authService.getAllUsers();
  }

  // Obtener usuarios por rol (solo accesible por administradores)
  @GrpcValidate(FindByRoleDto, 'FindByRole')
  findByRole(@Payload() data: FindByRoleDto) {
    return this.authService.findByRole(data.role as Role);
  }
}
