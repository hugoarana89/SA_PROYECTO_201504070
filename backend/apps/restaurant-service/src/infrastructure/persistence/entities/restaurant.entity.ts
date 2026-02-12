import { Entity, Column, PrimaryColumn, Index } from 'typeorm';

@Entity('restaurants')
export class RestaurantEntity {
  @PrimaryColumn({ length: 36 })
  id: string;

  @Column({ name: 'owner_id', length: 36 })
  @Index()
  ownerId: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 500 })
  address: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ name: 'opening_time', type: 'time', nullable: true })
  openingTime: string;

  @Column({ name: 'closing_time', type: 'time', nullable: true })
  closingTime: string;

  @Column({ name: 'is_active', default: true })
  @Index()
  isActive: boolean;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}