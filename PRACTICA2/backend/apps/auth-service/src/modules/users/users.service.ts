import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import type { IUserRepository } from './interfaces/user.repository.interface';

@Injectable()
export class UsersService {
  private readonly SALT_ROUNDS = 10;

  constructor(private readonly userRepository: IUserRepository) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    // Validar que el email no exista
    const existingUser = await this.userRepository.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('El usuario con este email ya existe');
    }

    // Hashear la contraseña
    const passwordHash = await bcrypt.hash(createUserDto.password, this.SALT_ROUNDS);

    // Crear usuario
    const user = await this.userRepository.create({
      email: createUserDto.email,
      passwordHash,
      role: createUserDto.role,
      isActive: true,
    });

    return UserResponseDto.fromEntity(user);
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.userRepository.findAll();
    return users.map(UserResponseDto.fromEntity);
  }

  async findById(id: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return UserResponseDto.fromEntity(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findByEmail(email);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Si se actualiza la contraseña, hashearla
    const updateData: Partial<User> = { ...updateUserDto };
    if (updateUserDto.password) {
      updateData.passwordHash = await bcrypt.hash(updateUserDto.password, this.SALT_ROUNDS);
      delete updateData['password'];
    }

    const updatedUser = await this.userRepository.update(id, updateData);
    if (!updatedUser) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return UserResponseDto.fromEntity(updatedUser);
  }

  async remove(id: string): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    await this.userRepository.delete(id);
  }

  async deactivateUser(id: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const updatedUser = await this.userRepository.update(id, { isActive: false });
    if (!updatedUser) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return UserResponseDto.fromEntity(updatedUser);
  }

  async activateUser(id: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const updatedUser = await this.userRepository.update(id, { isActive: true });
    if (!updatedUser) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return UserResponseDto.fromEntity(updatedUser);
  }

  async getUsersByRole(role: UserRole): Promise<UserResponseDto[]> {
    const users = await this.userRepository.findByRole(role);
    return users.map(UserResponseDto.fromEntity);
  }

  // Método interno para validación de credenciales (será usado por AuthService)
  async validateCredentials(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return null;
    }

    if (!user.isActive) {
      return null;
    }

    return user;
  }
}