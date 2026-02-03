import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { TokenResponseDto } from './dto/token-response.dto';
import { UserResponseDto } from '../users/dto/user-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService, // Inyectar UsersService en modo solo lectura
    private readonly jwtService: JwtService, // Inyectar JwtService en modo solo lectura
  ) {}

  // Método de registro
  async register(registerDto: RegisterDto): Promise<UserResponseDto> {
    return await this.usersService.create(registerDto);
  }

  // Método de login
  async login(loginDto: LoginDto): Promise<TokenResponseDto> {
    // Usar el método del UsersService para validar credenciales
    const user = await this.usersService.validateCredentials(
      loginDto.email,
      loginDto.password,
    );

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas o usuario inactivo');
    }

    // Generar payload del JWT
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    // Generar token de acceso
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    };
  }

  // Método para validar usuario desde el JWT Strategy
  async validateUser(payload: any): Promise<User | null> {
    return await this.usersService.findByEmail(payload.email);
  }

  // Método para validar token (usado por API Gateway)
  async validateToken(token: string): Promise<any> {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      return null;
    }
  }
}