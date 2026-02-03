import { UserRole } from '../entities/user.entity';

export class UserResponseDto {
  id: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(user: any): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = user.id;
    dto.email = user.email;
    dto.role = user.role;
    dto.isActive = user.isActive;
    dto.createdAt = user.createdAt;
    dto.updatedAt = user.updatedAt;
    return dto;
  }
}