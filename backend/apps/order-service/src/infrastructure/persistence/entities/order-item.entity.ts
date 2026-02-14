import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { OrderEntity } from './order.entity';

@Entity('order_items')
export class OrderItemEntity {
  @PrimaryColumn({ length: 36 })
  id: string;

  @Column({ name: 'order_id', length: 36 })
  orderId: string;

  @ManyToOne(() => OrderEntity, order => order.items)
  @JoinColumn({ name: 'order_id' })
  order: OrderEntity;

  @Column({ name: 'menu_item_id', length: 36 })
  @Index()
  menuItemId: string;

  @Column({ name: 'product_name', length: 150 })
  productName: string;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ name: 'unit_price', type: 'decimal', precision: 10, scale: 2 })
  unitPrice: number;

  // ⚠️ ELIMINAR COMPLETAMENTE - NI SIQUIERA COMENTADO
  // subtotal?: number;  ← ❌ BORRAR ESTA LÍNEA

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}