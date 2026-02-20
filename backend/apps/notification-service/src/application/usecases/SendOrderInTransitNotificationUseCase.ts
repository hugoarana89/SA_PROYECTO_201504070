import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Notification, NotificationType } from '../../domain/entities/Notification';
import type { NotificationRepository } from '../../domain/ports/NotificationRepository';
import { NOTIFICATION_REPOSITORY } from '../../domain/ports/NotificationRepository';
import type { EmailSender } from '../../domain/ports/EmailSender';
import { EMAIL_SENDER } from '../../domain/ports/EmailSender';
import { orderInTransitHtml, ProductItem } from '../../infrastructure/email/EmailTemplates';

export interface SendOrderInTransitInput {
  userId:         string;
  clientEmail:    string;
  orderId:        string;
  deliveryUserId: string;
  deliveryName:   string;
  products:       ProductItem[];
}

@Injectable()
export class SendOrderInTransitNotificationUseCase {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: NotificationRepository,
    @Inject(EMAIL_SENDER)
    private readonly emailSender: EmailSender,
  ) {}

  async execute(input: SendOrderInTransitInput): Promise<Notification> {
    const html = orderInTransitHtml({
      orderId:      input.orderId,
      deliveryName: input.deliveryName,
      products:     input.products,
    });

    await this.emailSender.send({
      to:      input.clientEmail,
      subject: `🛵 Tu pedido #${input.orderId} está en camino`,
      html,
    });

    const notification = Notification.create(
      uuidv4(),
      input.userId,
      NotificationType.EN_CAMINO,
      `Orden ${input.orderId} en camino con repartidor ${input.deliveryName}`,
      input.orderId,
      input.deliveryUserId,
    );

    await this.notificationRepository.save(notification);
    return notification;
  }
}
