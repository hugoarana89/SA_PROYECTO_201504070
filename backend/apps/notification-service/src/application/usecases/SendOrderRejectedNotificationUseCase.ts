import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Notification, NotificationType } from '../../domain/entities/Notification';
import type { NotificationRepository } from '../../domain/ports/NotificationRepository';
import { NOTIFICATION_REPOSITORY } from '../../domain/ports/NotificationRepository';
import type { EmailSender } from '../../domain/ports/EmailSender';
import { EMAIL_SENDER } from '../../domain/ports/EmailSender';
import { orderRejectedHtml, ProductItem } from '../../infrastructure/email/EmailTemplates';

export interface SendOrderRejectedInput {
  userId:         string;
  clientEmail:    string;
  orderId:        string;
  restaurantName: string;
  products:       ProductItem[];
}

@Injectable()
export class SendOrderRejectedNotificationUseCase {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: NotificationRepository,
    @Inject(EMAIL_SENDER)
    private readonly emailSender: EmailSender,
  ) {}

  async execute(input: SendOrderRejectedInput): Promise<Notification> {
    const html = orderRejectedHtml({
      orderId:        input.orderId,
      restaurantName: input.restaurantName,
      products:       input.products,
    });

    await this.emailSender.send({
      to:      input.clientEmail,
      subject: `🚫 Tu pedido #${input.orderId} fue rechazado`,
      html,
    });

    const notification = Notification.create(
      uuidv4(),
      input.userId,
      NotificationType.RECHAZADA,
      `Orden ${input.orderId} rechazada por ${input.restaurantName}`,
      input.orderId,
    );

    await this.notificationRepository.save(notification);
    return notification;
  }
}
