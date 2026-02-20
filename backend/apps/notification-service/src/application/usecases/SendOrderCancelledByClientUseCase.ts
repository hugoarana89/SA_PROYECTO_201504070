import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Notification, NotificationType } from '../../domain/entities/Notification';
import type { NotificationRepository } from '../../domain/ports/NotificationRepository';
import { NOTIFICATION_REPOSITORY } from '../../domain/ports/NotificationRepository';
import type { EmailSender } from '../../domain/ports/EmailSender';
import { EMAIL_SENDER } from '../../domain/ports/EmailSender';
import { orderCancelledByClientHtml, ProductItem } from '../../infrastructure/email/EmailTemplates';

export interface SendOrderCancelledByClientInput {
  userId:      string;
  clientName:  string;
  clientEmail: string;
  orderId:     string;
  products:    ProductItem[];
  cancelledAt: string;
}

@Injectable()
export class SendOrderCancelledByClientUseCase {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: NotificationRepository,
    @Inject(EMAIL_SENDER)
    private readonly emailSender: EmailSender,
  ) {}

  async execute(input: SendOrderCancelledByClientInput): Promise<Notification> {
    const html = orderCancelledByClientHtml({
      clientName:  input.clientName,
      orderId:     input.orderId,
      products:    input.products,
      cancelledAt: input.cancelledAt,
    });

    await this.emailSender.send({
      to:      input.clientEmail,
      subject: `❌ Tu pedido #${input.orderId} fue cancelado`,
      html,
    });

    const notification = Notification.create(
      uuidv4(),
      input.userId,
      NotificationType.CANCELADA_CLIENTE,
      `Orden ${input.orderId} cancelada por el cliente`,
      input.orderId,
    );

    await this.notificationRepository.save(notification);
    return notification;
  }
}
