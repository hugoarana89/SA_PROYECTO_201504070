import { UserRole } from '../../users/entities/user.entity';

// DTO para la respuesta del token JWT
// esto es para devolver al frontend cuando se loguea o registra un usuario
export class TokenResponseDto {
  accessToken: string;
  user: {
    id: string;
    email: string;
    role: UserRole;
    isActive: boolean;
  };
}