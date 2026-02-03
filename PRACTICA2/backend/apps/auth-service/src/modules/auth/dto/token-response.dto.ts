import { UserRole } from '../../users/entities/user.entity';

export class TokenResponseDto {
  accessToken: string;
  user: {
    id: string;
    email: string;
    role: UserRole;
    isActive: boolean;
  };
}