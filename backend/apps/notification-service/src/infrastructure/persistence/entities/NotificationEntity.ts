// ─────────────────────────────────────────────────────────────
// Infrastructure: NotificationEntity
// SRP: Solo mapea la tabla notifications ↔ TypeORM.
// ─────────────────────────────────────────────────────────────

import { Column, CreateDateColumn, Entity, Index, PrimaryColumn } from 'typeorm';
import { NotificationType } from '../../../domain/entities/Notification';

@Entity('notifications')
export class NotificationEntity {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string;

  @Index('idx_user_id')
  @Column({ name: 'user_id', type: 'varchar', length: 36 })
  userId: string;

  @Index('idx_delivery_user_id')
  @Column({ name: 'delivery_user_id', type: 'varchar', length: 36, nullable: true })
  deliveryUserId: string | null;

  @Index('idx_order_id')
  @Column({ name: 'order_id', type: 'varchar', length: 36, nullable: true })
  orderId: string | null;

  @Index('idx_order_type')
  @Column({
    name:    'order_type',
    type:    'enum',
    enum:    NotificationType,
  })
  orderType: NotificationType;

  @Column({ type: 'text' })
  content: string;

  @Index('idx_sent_at')
  @CreateDateColumn({ name: 'sent_at' })
  sentAt: Date;
}
