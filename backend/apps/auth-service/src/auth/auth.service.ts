import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { Role } from '../common/enums/role.enum';
import { status } from '@grpc/grpc-js';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'super-secret';

  // intyecta UsersService, para usar sus métodos
  // hay que importar UsersModule en AuthModule para que funcione la inyección
  constructor(private readonly usersService: UsersService) { }

  // Estos metodos usan UsersService que se trae desde la carpeta users

  // Registro de usuario, se valida y se guarda usando el user.service.ts
  async register(email: string, password: string, role: Role) {
    const exists = await this.usersService.findByEmail(email);
    if (exists) {
      throw new RpcException({
        code: status.ALREADY_EXISTS,
        message: 'Email ya existe',
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    return this.usersService.create({
      email,
      passwordHash,
      role,
    });
  }

  // Login de usuario
  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new RpcException({
        code: status.UNAUTHENTICATED,
        message: 'Credenciales inválidas',
      });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new RpcException({
        code: status.UNAUTHENTICATED,
        message: 'Credenciales inválidas',
      });
    }

    const accessToken = jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      this.JWT_SECRET,
      { expiresIn: '15m' },
    );

    const refreshToken = randomBytes(64).toString('hex');
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Guarda el token de refresco en la base de datos
    // usando el método de users.service.ts
    await this.usersService.saveRefreshToken(
      user,
      refreshTokenHash,
      expiresAt,
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  // sirve para refrescar tokens

  async refreshToken(refreshToken: string) {
    const tokens = await this.usersService.findActiveRefreshTokens();

    for (const token of tokens) {
      const match = await bcrypt.compare(
        refreshToken,
        token.tokenHash,
      );

      if (!match) continue;

      // 🔁 ROTACIÓN: invalidamos el token actual
      await this.usersService.revokeRefreshToken(token.tokenHash);

      const newAccessToken = jwt.sign(
        {
          sub: token.user.id,
          email: token.user.email,
          role: token.user.role,
        },
        this.JWT_SECRET,
        { expiresIn: '15m' },
      );

      const newRefreshToken = randomBytes(64).toString('hex');
      const newRefreshTokenHash = await bcrypt.hash(newRefreshToken, 10);

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await this.usersService.saveRefreshToken(
        token.user,
        newRefreshTokenHash,
        expiresAt,
      );

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    }

    throw new RpcException({
      code: status.UNAUTHENTICATED,
      message: 'Refresh token inválido o expirado',
    });
  }

  // Valida un token JWT
  validateToken(token: string) {
    try {
      const payload = jwt.verify(token, this.JWT_SECRET) as any;
      return {
        userId: payload.sub,
        email: payload.email,
        role: payload.role,
        valid: true,
      };
    } catch {
      return { valid: false };
    }
  }

  // logout de usuario
  async logout(refreshToken: string) {
    const tokens = await this.usersService.findActiveRefreshTokens();
    for (const token of tokens) {
      const match = await bcrypt.compare(
        refreshToken,
        token.tokenHash,
      );
      if (match) {
        // se llama al método para revocar el token que esta en users.service.ts
        await this.usersService.revokeRefreshToken(token.tokenHash);
        return { success: true };
      }
    }
    throw new RpcException({
      code: status.UNAUTHENTICATED,
      message: 'Refresh token inválido o expirado',
    });
  }

  // Obtiene todos los usuarios (solo para administradores)
  async getAllUsers() {
    const users = await this.usersService.findAll();
    if (!users) {
      throw new RpcException({
        code: status.INTERNAL,
        message: 'Error al obtener usuarios',
      });
    }
    return {
      users: users.map((u) => ({
        id: u.id,
        email: u.email,
        role: u.role,
      })),
    };
  }

  async findByRole(role: Role) {
    const users = await this.usersService.findByRole(role);

    if (!users) {
      throw new RpcException({
        code: status.INTERNAL,
        message: 'Error al obtener usuarios por rol',
      });
    }

    return {
      users: users.map((u) => ({
        id: u.id,
        email: u.email,
        role: u.role,
      })),
    };
  }

  // Obtiene el email de usuario a partir de su id
  async getEmailByUserId(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: 'Usuario no encontrado',
      });
    }
    return { email: user.email };
  }
}
