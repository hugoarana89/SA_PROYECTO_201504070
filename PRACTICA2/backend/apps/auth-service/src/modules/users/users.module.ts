import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserRepository } from './repositories/user.repository';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [
    {
      provide: 'IUserRepository',
      useClass: UserRepository,
    },
    UsersService
  ],
  exports: [UsersService, 'IUserRepository'], // Exportar el servicio para usarlo en AuthService
})
export class UsersModule {}
