import { Injectable, ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserRole } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {

  // Con este constructor se puede usar la entidad user que tiene el modelo de la base de datos y poder hacer operaciones CRUD
  constructor(
    @InjectRepository(User) 
    private readonly usersRepository: Repository<User>, // solo se puede leer no modificar con readonly
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {

    // Verificar si el usuario ya existe
    const existingUser = await this.usersRepository.findOne({ where: { email: createUserDto.email } });
    
    if (existingUser) {
      throw new ConflictException('El usuario ya existe');
    }

    // encriptamos la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

    // Crear el nuevo usuario
    const newUser = this.usersRepository.create({
      ...createUserDto,
      passwordHash: hashedPassword, // guardamos la contraseña encriptada
    });

    return await this.usersRepository.save(newUser);
  }

  async findAll(): Promise<User[]> {
    return await this.usersRepository.find();
  }

  async findOne(id: string):  Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.usersRepository.findOne({ where: { email } });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    
    // ya no hago el codigo porque lo he puesto en el método findOne que esta arriba
    const user = await this.findOne(id); 

    if (updateUserDto.password) {
      // encriptamos la nueva contraseña
      const salt = await bcrypt.genSalt(10);
      updateUserDto['passwordHash'] = await bcrypt.hash(updateUserDto.password, salt);
      delete updateUserDto.password; // eliminamos la propiedad password del DTO
    }

    return await this.usersRepository.save({ ...user, ...updateUserDto });
  }

  async remove(id: string): Promise<void> {

    const result = await this.usersRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException('Usuario no encontrado');
    }
  }

  async validateUser(loginUserDto: LoginUserDto): Promise<User> {

    // Extraer email y password
    const { email, password } = loginUserDto;

    const user = await this.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar la contraseña
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    // Si la contraseña no es válida, lanzar una excepción
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar si el usuario está activo
    if (!user.isActive) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    return user;
  }

  async deactivateUser(id: string): Promise<User> {
    
    // ya no hago el codigo porque lo he puesto en el método findOne que esta arriba
    const user = await this.findOne(id);

    // Desactivar el usuario, no eliminarlo
    user.isActive = false;

    return await this.usersRepository.save(user);
  }

  async activateUser(id: string): Promise<User> {

    // ya no hago el codigo porque lo he puesto en el método findOne que esta arriba
    const user = await this.findOne(id);

    // Activar el usuario
    user.isActive = true;

    return await this.usersRepository.save(user);
  }

  async getUserRole(role: UserRole): Promise<User[]> {
    return await this.usersRepository.find({ where: { role } });
  }
}
