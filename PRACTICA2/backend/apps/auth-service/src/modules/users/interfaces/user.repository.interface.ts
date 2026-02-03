import { User, UserRole } from '../entities/user.entity';

export interface IUserRepository {
  create(user: Partial<User>): Promise<User>;
  findAll(): Promise<User[]>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  update(id: string, data: Partial<User>): Promise<User | null>;
  delete(id: string): Promise<void>;
  findByRole(role: UserRole): Promise<User[]>;
}