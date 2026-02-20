import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan } from 'typeorm';
import { User } from './user.entity';
import { RefreshToken } from './refresh-token.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)

    // Inyecta el repositorio en modo lectura de User que se define user.entity.ts
    private readonly userRepo: Repository<User>,

    // Inyecta el repositorio en modo lectura de RefreshToken que se define refresh-token.entity.ts
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepo: Repository<RefreshToken>,
  ) { }

  // Busca un usuario por su email
  findByEmail(email: string) {
    return this.userRepo.findOne({ where: { email } });
  }

  // Busca un usuario por su id
  findById(id: string) {
    return this.userRepo.findOne({ where: { id } });
  }

  // Crea un nuevo usuario en la base de datos
  create(user: Partial<User>) {
    return this.userRepo.save(user);
  }

  // Devolver solo usuario con un Role específico
  async findByRole(role: string) {
    return this.userRepo.find({ where: { role: role as any } });
  }


  // Guarda un token de refresco en la base de datos
  async saveRefreshToken(user: User, selector: string, tokenHash: string, expiresAt: Date) {
    const token = this.refreshTokenRepo.create({ user, selector, tokenHash, expiresAt });
    return this.refreshTokenRepo.save(token);
  }

  async findRefreshTokenBySelector(selector: string): Promise<RefreshToken | null> {
    return this.refreshTokenRepo.findOne({
      where: {
        selector,
        revoked: false,
        expiresAt: MoreThan(new Date()),
      },
      relations: ['user'],
    });
  }

  // Devolver todos los usuarios registrados
  async findAll() {
    return this.userRepo.find();
  }


  //Trae SOLO tokens válidos (no expirados y no revocados)
  /*async findActiveRefreshTokens() {
    return this.refreshTokenRepo.find({
      where: {
        revoked: false,
        expiresAt: MoreThan(new Date()),
      },
      relations: ['user'],
    });
  }*/

  // Revoca un token de refresco específico
  async revokeRefreshToken(selector: string) {
    await this.refreshTokenRepo.update({ selector }, { revoked: true });
  }

  // Revoca todos los tokens de refresco de un usuario específico, (este no lo estoy usando)
  async revokeAllUserRefreshTokens(userId: string) {
    await this.refreshTokenRepo.update(
      { user: { id: userId } },
      { revoked: true },
    );
  }

  // Elimina los tokens expirados de la base de datos (este no lo estoy usando)
  async cleanExpiredTokens() {
    await this.refreshTokenRepo.delete({
      expiresAt: LessThan(new Date()),
    });
  }
}
