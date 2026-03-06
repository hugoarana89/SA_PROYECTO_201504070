// ─────────────────────────────────────────────────────────────
// Domain Entity: Payment
// SRP: Encapsula el ciclo de vida y las reglas de un pago.
// ─────────────────────────────────────────────────────────────

export enum PaymentMethod {
  TARJETA_CREDITO  = 'TARJETA_CREDITO',
  TARJETA_DEBITO   = 'TARJETA_DEBITO',
  CARTERA_DIGITAL  = 'CARTERA_DIGITAL',
}

export enum PaymentStatus {
  PENDIENTE   = 'PENDIENTE',
  PAGADO      = 'PAGADO',
  FALLIDO     = 'FALLIDO',
  REEMBOLSADO = 'REEMBOLSADO',
}

export interface PaymentProps {
  id:              string;
  orderId:         string;
  userId:          string;
  method:          PaymentMethod;
  status:          PaymentStatus;
  amount:          number;
  couponId:        string | null;
  discountApplied: number;
  finalAmount:     number;
  createdAt:       Date;
  updatedAt:       Date;
}

export class Payment {
  readonly id:              string;
  readonly orderId:         string;
  readonly userId:          string;
  readonly method:          PaymentMethod;
  private _status:          PaymentStatus;
  readonly amount:          number;
  readonly couponId:        string | null;
  readonly discountApplied: number;
  readonly finalAmount:     number;
  readonly createdAt:       Date;
  private _updatedAt:       Date;

  constructor(props: PaymentProps) {
    this.id              = props.id;
    this.orderId         = props.orderId;
    this.userId          = props.userId;
    this.method          = props.method;
    this._status         = props.status;
    this.amount          = props.amount;
    this.couponId        = props.couponId;
    this.discountApplied = props.discountApplied;
    this.finalAmount     = props.finalAmount;
    this.createdAt       = props.createdAt;
    this._updatedAt      = props.updatedAt;
  }

  get status():    PaymentStatus { return this._status; }
  get updatedAt(): Date          { return this._updatedAt; }

  /** Marca el pago como exitoso */
  markAsPaid(): void {
    if (this._status !== PaymentStatus.PENDIENTE)
      throw new Error(`Solo se puede confirmar un pago en estado PENDIENTE. Estado actual: ${this._status}.`);
    this._status    = PaymentStatus.PAGADO;
    this._updatedAt = new Date();
  }

  /** Marca el pago como fallido */
  markAsFailed(): void {
    if (this._status !== PaymentStatus.PENDIENTE)
      throw new Error(`Solo se puede marcar como fallido un pago en estado PENDIENTE. Estado actual: ${this._status}.`);
    this._status    = PaymentStatus.FALLIDO;
    this._updatedAt = new Date();
  }

  /** Emite un reembolso */
  refund(): void {
    if (this._status !== PaymentStatus.PAGADO)
      throw new Error(`Solo se puede reembolsar un pago en estado PAGADO. Estado actual: ${this._status}.`);
    this._status    = PaymentStatus.REEMBOLSADO;
    this._updatedAt = new Date();
  }

  static create(
    id:              string,
    orderId:         string,
    userId:          string,
    method:          PaymentMethod,
    amount:          number,
    discountApplied: number = 0,
    couponId:        string | null = null,
  ): Payment {
    if (amount <= 0) throw new Error('El monto del pago debe ser mayor a 0.');
    if (discountApplied < 0) throw new Error('El descuento no puede ser negativo.');
    const finalAmount = parseFloat(Math.max(0, amount - discountApplied).toFixed(2));
    const now = new Date();
    return new Payment({
      id, orderId, userId, method,
      status:          PaymentStatus.PENDIENTE,
      amount,
      couponId,
      discountApplied,
      finalAmount,
      createdAt: now,
      updatedAt: now,
    });
  }
}
