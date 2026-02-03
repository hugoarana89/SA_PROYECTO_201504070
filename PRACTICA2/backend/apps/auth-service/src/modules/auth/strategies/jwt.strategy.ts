import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService, // esto es para el archivo .env
    private readonly authService: AuthService, // Este es el que hace la validacion del usuario
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET', 'secret-key'),
    });
  }

  // Este metodo se llama automaticamente por passport para validar el token
  async validate(payload: any) {
    return this.authService.validateUser(payload);
  }
}