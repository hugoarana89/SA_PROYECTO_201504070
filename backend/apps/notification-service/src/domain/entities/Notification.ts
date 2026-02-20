// ─────────────────────────────────────────────────────────────
// Domain Entity: Notification
// SRP: Encapsula las reglas del negocio de una notificación.
// No conoce NestJS, TypeORM ni SendGrid.
// ─────────────────────────────────────────────────────────────

export enum NotificationType {
  ORDEN_CREADA          = 'ORDEN_CREADA',
  CANCELADA_CLIENTE     = 'CANCELADA_CLIENTE',
  CANCELADA_RESTAURANTE = 'CANCELADA_RESTAURANTE',
  CANCELADA_REPARTIDOR  = 'CANCELADA_REPARTIDOR',
  EN_CAMINO             = 'EN_CAMINO',
  RECHAZADA             = 'RECHAZADA',
}

export interface NotificationProps {
  id:             string;
  userId:         string;
  deliveryUserId: string | null;
  orderId:        string | null;
  orderType:      NotificationType;
  content:        string;
  sentAt:         Date;
}

export class Notification {
  readonly id:             string;
  readonly userId:         string;
  readonly deliveryUserId: string | null;
  readonly orderId:        string | null;
  readonly orderType:      NotificationType;
  readonly content:        string;
  readonly sentAt:         Date;

  constructor(props: NotificationProps) {
    this.id             = props.id;
    this.userId         = props.userId;
    this.deliveryUserId = props.deliveryUserId;
    this.orderId        = props.orderId;
    this.orderType      = props.orderType;
    this.content        = props.content;
    this.sentAt         = props.sentAt;
  }

  static create(
    id:             string,
    userId:         string,
    orderType:      NotificationType,
    content:        string,
    orderId:        string | null = null,
    deliveryUserId: string | null = null,
  ): Notification {
    return new Notification({
      id,
      userId,
      deliveryUserId,
      orderId,
      orderType,
      content,
      sentAt: new Date(),
    });
  }
}
