import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Notification, NotificationType } from '../../domain/entities/Notification';
import type { NotificationRepository } from '../../domain/ports/NotificationRepository';
import { NOTIFICATION_REPOSITORY } from '../../domain/ports/NotificationRepository';
import type { EmailSender } from '../../domain/ports/EmailSender';
import { EMAIL_SENDER } from '../../domain/ports/EmailSender';
import { orderCancelledByRestaurantHtml, ProductItem } from '../../infrastructure/email/EmailTemplates';

export interface SendOrderCancelledByRestaurantInput {
  userId:         string;
  clientEmail:    string;
  orderId:        string;
  restaurantName: string;
  cancelReason:   string;
  products:       ProductItem[];
}

@Injectable()
export class SendOrderCancelledByRestaurantUseCase {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: NotificationRepository,
    @Inject(EMAIL_SENDER)
    private readonly emailSender: EmailSender,
  ) {}

  async execute(input: SendOrderCancelledByRestaurantInput): Promise<Notification> {
    const html = orderCancelledByRestaurantHtml({
      orderId:        input.orderId,
      restaurantName: input.restaurantName,
      cancelReason:   input.cancelReason,
      products:       input.products,
    });

    await this.emailSender.send({
      to:      input.clientEmail,
      subject: `❌ Tu pedido #${input.orderId} fue cancelado por el restaurante`,
      html,
    });

    const notification = Notification.create(
      uuidv4(),
      input.userId,
      NotificationType.CANCELADA_RESTAURANTE,
      `Orden ${input.orderId} cancelada por ${input.restaurantName}: ${input.cancelReason}`,
      input.orderId,
    );

    await this.notificationRepository.save(notification);
    return notification;
  }
}
