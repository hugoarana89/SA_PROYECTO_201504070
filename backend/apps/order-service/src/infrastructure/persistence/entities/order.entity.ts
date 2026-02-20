import { Entity, Column, PrimaryColumn, Index, OneToMany } from 'typeorm';
import { OrderItemEntity } from './order-item.entity';

@Entity('orders')
export class OrderEntity {
  @PrimaryColumn({ length: 36 })
  id: string;

  @Column({ name: 'client_user_id', length: 36 })
  @Index()
  clientId: string;

  @Column({ name: 'restaurant_id', length: 36 })
  @Index()
  restaurantId: string;

  @Column({
    type: 'enum',
    enum: [
      'CREADA',
      'CANCELADA',
      'RECHAZADA',
      'EN_PROCESO',
      'LISTA',
      'FINALIZADA',
    ],
    default: 'CREADA'
  })
  @Index()
  status: string;

  @Column({ name: 'total_amount', type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason: string;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @OneToMany(() => OrderItemEntity, item => item.order, { cascade: true })
  items: OrderItemEntity[];
}