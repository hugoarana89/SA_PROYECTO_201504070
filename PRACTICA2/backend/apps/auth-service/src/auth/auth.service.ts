// auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { Role } from '../common/enums/role.enum';
import { status } from '@grpc/grpc-js';

@Injectable()
export class AuthService {
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'super-secret';

  constructor(private readonly usersService: UsersService) { }

  async register(email: string, password: string, role: Role) {
    const exists = await this.usersService.findByEmail(email);
    if (exists) {
      throw new RpcException({
        code: status.ALREADY_EXISTS,
        message: 'Email ya existe',
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await this.usersService.create({
      email,
      passwordHash,
      role,
    });

    return user;
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException();

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException();

    const token = jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      this.JWT_SECRET,
      { expiresIn: '1h' },
    );

    return { accessToken: token };
  }

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
}
