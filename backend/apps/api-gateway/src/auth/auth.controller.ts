import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  // Endpoint http para login
  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  // Endpoint http para refrescar el token, genera un nuevo access token y refresh token
  @Post('refresh')
  refresh(@Body() body: { refreshToken: string }) {
    return this.authService.refreshToken(body.refreshToken);
  }

  // Endpoint http para registrar solo clientes (los demas roles no se registran por este endpoint)
  @Post('register/client')
  registerClient(@Body() body: { email: string; password: string }) {
    return this.authService.register(body.email, body.password, Role.CLIENTE);
  }

  // Endpoint http para logout (elimina el refresh token) y coloca el campo isRevoked en true
  @Post('logout')
  logout(@Body() body: { refreshToken: string }) {
    return this.authService.logout(body.refreshToken);
  }

  // Endpoint http para registrar administradores (solo accesible por otros administradores)
  // usa guards para proteger el endpoint
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMINISTRADOR)
  @Post('register/admin')
  registerAdmin(@Body() body: { email: string; password: string; role: Role }) {
    return this.authService.register(body.email, body.password, body.role);
  }
}
