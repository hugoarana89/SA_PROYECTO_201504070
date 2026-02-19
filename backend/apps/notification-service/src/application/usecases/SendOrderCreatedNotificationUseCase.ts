// ─────────────────────────────────────────────────────────────
// UseCase: SendOrderCreatedNotificationUseCase
// SRP: Solo orquesta el envío de notificación de orden creada.
// DIP: Depende de ports (interfaces), no de implementaciones.
// ─────────────────────────────────────────────────────────────

import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 }       from 'uuid';
import { Notification, NotificationType } from '../../domain/entities/Notification';
import type { NotificationRepository } from '../../domain/ports/NotificationRepository';
import { NOTIFICATION_REPOSITORY } from '../../domain/ports/NotificationRepository';
import type { EmailSender } from '../../domain/ports/EmailSender';
import { EMAIL_SENDER } from '../../domain/ports/EmailSender';
import { orderCreatedHtml, ProductItem } from '../../infrastructure/email/EmailTemplates';

export interface SendOrderCreatedInput {
  userId:      string;
  clientName:  string;
  clientEmail: string;
  orderId:     string;
  products:    ProductItem[];
  totalAmount: number;
  createdAt:   string;
}

@Injectable()
export class SendOrderCreatedNotificationUseCase {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: NotificationRepository,
    @Inject(EMAIL_SENDER)
    private readonly emailSender: EmailSender,
  ) {}

  async execute(input: SendOrderCreatedInput): Promise<Notification> {
    const html = orderCreatedHtml({
      clientName:  input.clientName,
      orderId:     input.orderId,
      products:    input.products,
      totalAmount: input.totalAmount,
      createdAt:   input.createdAt,
    });

    await this.emailSender.send({
      to:      input.clientEmail,
      subject: `✅ Pedido #${input.orderId} recibido`,
      html,
    });

    const notification = Notification.create(
      uuidv4(),
      input.userId,
      NotificationType.ORDEN_CREADA,
      `Orden ${input.orderId} creada por ${input.clientName}`,
      input.orderId,
    );

    await this.notificationRepository.save(notification);
    return notification;
  }
}
