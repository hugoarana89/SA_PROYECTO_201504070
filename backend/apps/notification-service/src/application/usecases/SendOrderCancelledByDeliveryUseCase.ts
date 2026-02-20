import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

import { Notification, NotificationType } from '../../domain/entities/Notification';
import type { NotificationRepository } from '../../domain/ports/NotificationRepository';
import { NOTIFICATION_REPOSITORY } from '../../domain/ports/NotificationRepository';
import type { EmailSender } from '../../domain/ports/EmailSender';
import { EMAIL_SENDER } from '../../domain/ports/EmailSender';
import { orderCancelledByDeliveryHtml, ProductItem } from '../../infrastructure/email/EmailTemplates';

export interface SendOrderCancelledByDeliveryInput {
  userId:         string;
  clientEmail:    string;
  orderId:        string;
  deliveryUserId: string;
  deliveryName:   string;
  cancelReason:   string;
  products:       ProductItem[];
}

@Injectable()
export class SendOrderCancelledByDeliveryUseCase {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: NotificationRepository,
    @Inject(EMAIL_SENDER)
    private readonly emailSender: EmailSender,
  ) {}

  async execute(input: SendOrderCancelledByDeliveryInput): Promise<Notification> {
    const html = orderCancelledByDeliveryHtml({
      orderId:      input.orderId,
      deliveryName: input.deliveryName,
      cancelReason: input.cancelReason,
      products:     input.products,
    });

    await this.emailSender.send({
      to:      input.clientEmail,
      subject: `❌ La entrega de tu pedido #${input.orderId} fue cancelada`,
      html,
    });

    const notification = Notification.create(
      uuidv4(),
      input.userId,
      NotificationType.CANCELADA_REPARTIDOR,
      `Orden ${input.orderId} cancelada por repartidor ${input.deliveryName}: ${input.cancelReason}`,
      input.orderId,
      input.deliveryUserId,
    );

    await this.notificationRepository.save(notification);
    return notification;
  }
}
