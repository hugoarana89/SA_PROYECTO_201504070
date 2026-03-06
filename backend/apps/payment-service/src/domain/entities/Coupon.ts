// ─────────────────────────────────────────────────────────────
// Domain Entity: Coupon
// SRP: Encapsula reglas de negocio de cupones de descuento.
// ─────────────────────────────────────────────────────────────

export enum DiscountType {
  PORCENTAJE  = 'PORCENTAJE',
  MONTO_FIJO  = 'MONTO_FIJO',
}

export interface CouponProps {
  id:             string;
  code:           string;
  discountType:   DiscountType;
  discountValue:  number;
  minOrderAmount: number;
  maxUses:        number | null;
  currentUses:    number;
  expiresAt:      Date | null;
  isActive:       boolean;
  createdAt:      Date;
}

export class Coupon {
  readonly id:             string;
  readonly code:           string;
  readonly discountType:   DiscountType;
  readonly discountValue:  number;
  readonly minOrderAmount: number;
  readonly maxUses:        number | null;
  private _currentUses:    number;
  readonly expiresAt:      Date | null;
  private _isActive:       boolean;
  readonly createdAt:      Date;

  constructor(props: CouponProps) {
    this.id             = props.id;
    this.code           = props.code;
    this.discountType   = props.discountType;
    this.discountValue  = props.discountValue;
    this.minOrderAmount = props.minOrderAmount;
    this.maxUses        = props.maxUses;
    this._currentUses   = props.currentUses;
    this.expiresAt      = props.expiresAt;
    this._isActive      = props.isActive;
    this.createdAt      = props.createdAt;
  }

  get currentUses(): number  { return this._currentUses; }
  get isActive():    boolean { return this._isActive; }

  /** Calcula el descuento para un monto de orden dado */
  calculateDiscount(orderAmount: number): number {
    this.validateApplicability(orderAmount);
    if (this.discountType === DiscountType.PORCENTAJE) {
      return parseFloat(((orderAmount * this.discountValue) / 100).toFixed(2));
    }
    return Math.min(this.discountValue, orderAmount);
  }

  /** Valida si el cupón puede aplicarse */
  validateApplicability(orderAmount: number): void {
    if (!this._isActive)
      throw new Error(`El cupón '${this.code}' no está activo.`);
    if (this.expiresAt && this.expiresAt < new Date())
      throw new Error(`El cupón '${this.code}' ha expirado.`);
    if (this.maxUses !== null && this._currentUses >= this.maxUses)
      throw new Error(`El cupón '${this.code}' ha alcanzado el límite de usos.`);
    if (orderAmount < this.minOrderAmount)
      throw new Error(
        `El monto mínimo para usar este cupón es ${this.minOrderAmount}. Monto de orden: ${orderAmount}.`,
      );
  }

  /** Incrementa el contador de usos al redimir el cupón */
  redeem(): void {
    this.validateApplicability(this.minOrderAmount); // validación básica
    this._currentUses += 1;
    if (this.maxUses !== null && this._currentUses >= this.maxUses) {
      this._isActive = false;
    }
  }

  /** Desactiva el cupón manualmente */
  deactivate(): void {
    this._isActive = false;
  }

  /** Reactiva el cupón */
  activate(): void {
    this._isActive = true;
  }

  static create(
    id: string,
    code: string,
    discountType: DiscountType,
    discountValue: number,
    minOrderAmount: number = 0,
    maxUses: number | null = null,
    expiresAt: Date | null = null,
  ): Coupon {
    if (discountValue <= 0)
      throw new Error('El valor del descuento debe ser mayor a 0.');
    if (discountType === DiscountType.PORCENTAJE && discountValue > 100)
      throw new Error('El porcentaje de descuento no puede superar 100.');

    return new Coupon({
      id,
      code: code.toUpperCase().trim(),
      discountType,
      discountValue,
      minOrderAmount,
      maxUses,
      currentUses: 0,
      expiresAt,
      isActive: true,
      createdAt: new Date(),
    });
  }
}
