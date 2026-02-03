import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum UserRole {
  CLIENTE = 'CLIENTE',
  RESTAURANTE = 'RESTAURANTE',
  REPARTIDOR = 'REPARTIDOR',
  ADMINISTRADOR = 'ADMINISTRADOR'
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  @Index('idx_email')
  email: string;

  @Column({ type: 'varchar', length: 255, name: 'password_hash' })
  passwordHash: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CLIENTE
  })
  @Index('idx_role')
  role: UserRole;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}