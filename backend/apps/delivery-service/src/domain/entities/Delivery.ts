// ─────────────────────────────────────────────────────────────
// Domain Entity: Delivery
// SRP: Encapsula las reglas de negocio de una entrega.
// No conoce NestJS, MySQL ni gRPC.
// ─────────────────────────────────────────────────────────────

export enum DeliveryStatus {
  ASIGNADA  = 'ASIGNADA',
  EN_CAMINO = 'EN_CAMINO',
  ENTREGADA = 'ENTREGADA',
  CANCELADA = 'CANCELADA',
}

export interface DeliveryProps {
  id:             string;
  orderId:        string;
  deliveryUserId: string;
  status:         DeliveryStatus;
  assignedAt:     Date;
  deliveredAt?:   Date | null;
  cancelReason?:  string | null;
}

export class Delivery {
  readonly id:             string;
  readonly orderId:        string;
  readonly deliveryUserId: string;
  private _status:         DeliveryStatus;
  readonly assignedAt:     Date;
  private _deliveredAt:    Date | null;
  private _cancelReason:   string | null;

  constructor(props: DeliveryProps) {
    this.id             = props.id;
    this.orderId        = props.orderId;
    this.deliveryUserId = props.deliveryUserId;
    this._status        = props.status;
    this.assignedAt     = props.assignedAt;
    this._deliveredAt   = props.deliveredAt ?? null;
    this._cancelReason  = props.cancelReason ?? null;
  }

  // ── Getters ──────────────────────────────────────────────
  get status():       DeliveryStatus { return this._status; }
  get deliveredAt():  Date | null    { return this._deliveredAt; }
  get cancelReason(): string | null  { return this._cancelReason; }

  // ── Reglas de negocio ────────────────────────────────────

  /** Marca la entrega como EN_CAMINO cuando el repartidor acepta el pedido */
  startDelivery(): void {
    if (this._status !== DeliveryStatus.ASIGNADA) {
      throw new Error(
        `No se puede iniciar una entrega con estado '${this._status}'. Estado requerido: ASIGNADA`,
      );
    }
    this._status = DeliveryStatus.EN_CAMINO;
  }

  /** Marca la entrega como ENTREGADA */
  markAsDelivered(): void {
    if (this._status !== DeliveryStatus.EN_CAMINO) {
      throw new Error(
        `No se puede marcar como ENTREGADA una entrega con estado '${this._status}'. Estado requerido: EN_CAMINO`,
      );
    }
    this._status      = DeliveryStatus.ENTREGADA;
    this._deliveredAt = new Date();
  }

  /** Cancela la entrega con un motivo obligatorio */
  cancel(reason: string): void {
    if (!reason?.trim()) {
      throw new Error('Se requiere un motivo para cancelar la entrega.');
    }
    if (this._status === DeliveryStatus.ENTREGADA) {
      throw new Error('No se puede cancelar una entrega ya ENTREGADA.');
    }
    this._status       = DeliveryStatus.CANCELADA;
    this._cancelReason = reason;
  }

  /** Factory para crear una nueva entrega en estado ASIGNADA */
  static create(orderId: string, deliveryUserId: string, id: string): Delivery {
    return new Delivery({
      id,
      orderId,
      deliveryUserId,
      status:     DeliveryStatus.ASIGNADA,
      assignedAt: new Date(),
    });
  }
}
