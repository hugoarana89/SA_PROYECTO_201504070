import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UsersService } from './users.service';
import { RefreshToken } from './refresh-token.entity';

@Module({
  // Importa los repositorios de User y RefreshToken para que puedan ser inyectados en UsersService
  imports: [TypeOrmModule.forFeature([User, RefreshToken])],
  providers: [UsersService],
  exports: [UsersService],  // Exporta UsersService para que pueda ser utilizado en otros módulos
})
export class UsersModule {}