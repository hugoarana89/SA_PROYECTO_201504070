// ─────────────────────────────────────────────────────────────
// Infrastructure: TypeOrmNotificationRepository
// LSP: Implementa completamente el contrato NotificationRepository.
// SRP: Solo traduce entre entidad TypeORM y dominio.
// ─────────────────────────────────────────────────────────────

import { Injectable }       from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository }       from 'typeorm';

import { Notification }           from '../../../domain/entities/Notification';
import { NotificationRepository } from '../../../domain/ports/NotificationRepository';
import { NotificationEntity }     from '../entities/Notificationentity';

@Injectable()
export class TypeOrmNotificationRepository implements NotificationRepository {
  constructor(
    @InjectRepository(NotificationEntity)
    private readonly repo: Repository<NotificationEntity>,
  ) {}

  async save(notification: Notification): Promise<void> {
    const entity          = new NotificationEntity();
    entity.id             = notification.id;
    entity.userId         = notification.userId;
    entity.deliveryUserId = notification.deliveryUserId;
    entity.orderId        = notification.orderId;
    entity.orderType      = notification.orderType;
    entity.content        = notification.content;
    entity.sentAt         = notification.sentAt;

    await this.repo.save(entity);
  }
}
