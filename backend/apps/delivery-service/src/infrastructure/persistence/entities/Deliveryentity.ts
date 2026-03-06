// ─────────────────────────────────────────────────────────────
// Infrastructure: DeliveryEntity
// SRP: Solo mapea la tabla deliveries ↔ TypeORM.
//      No contiene lógica de negocio.
// ─────────────────────────────────────────────────────────────

import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
} from 'typeorm';

import { DeliveryStatus } from '../../../domain/entities/Delivery';

@Entity('deliveries')
export class DeliveryEntity {
  @PrimaryColumn({ type: 'varchar', length: 36 })
  id: string;

  @Index('idx_order')
  @Column({ name: 'order_id', type: 'varchar', length: 36 })
  orderId: string;

  @Index('idx_delivery_user_id')
  @Column({ name: 'delivery_user_id', type: 'varchar', length: 36 })
  deliveryUserId: string;

  @Index('idx_status')
  @Column({
    type: 'enum',
    enum: DeliveryStatus,
  })
  status: DeliveryStatus;

  @CreateDateColumn({ name: 'assigned_at' })
  assignedAt: Date;

  @Column({ name: 'delivered_at', type: 'timestamp', nullable: true })
  deliveredAt: Date | null;

  /**
   * URL / datos en base64 de la foto de prueba de entrega.
   * Se usa MEDIUMTEXT en lugar de VARCHAR para soportar imágenes
   * reales (hasta ~16 MB). VARCHAR(10000) solo admite ~7.5 KB de texto.
   */
  @Column({ name: 'proof_image_url', type: 'mediumtext', nullable: true, comment: 'URL en base 64' })
  proofImageUrl: string | null;

  @Column({ name: 'cancel_reason', type: 'varchar', length: 255, nullable: true })
  cancelReason: string | null;
}
