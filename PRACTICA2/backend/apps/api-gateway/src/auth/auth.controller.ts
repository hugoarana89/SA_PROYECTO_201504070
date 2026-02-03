import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  @Post('register/client')
  registerClient(@Body() body: { email: string; password: string }) {
    return this.authService.register(body.email, body.password, Role.CLIENTE);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMINISTRADOR)
  @Post('register/admin')
  registerAdmin(@Body() body: { email: string; password: string; role: Role }) {
    return this.authService.register(body.email, body.password, body.role);
  }
}
