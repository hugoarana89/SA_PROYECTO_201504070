// ─────────────────────────────────────────────────────────────
// Domain Entity: Wallet
// SRP: Encapsula las reglas de negocio de la cartera digital.
// Sin dependencias de NestJS, MySQL ni gRPC.
// ─────────────────────────────────────────────────────────────

export interface WalletProps {
  id:        string;
  userId:    string;
  balance:   number;
  createdAt: Date;
  updatedAt: Date;
}

export class Wallet {
  readonly id:        string;
  readonly userId:    string;
  private _balance:   number;
  readonly createdAt: Date;
  private _updatedAt: Date;

  constructor(props: WalletProps) {
    this.id        = props.id;
    this.userId    = props.userId;
    this._balance  = props.balance;
    this.createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  get balance():   number { return this._balance; }
  get updatedAt(): Date   { return this._updatedAt; }

  /** Recarga saldo — el monto debe ser positivo */
  recharge(amount: number): void {
    if (amount <= 0) throw new Error('El monto de recarga debe ser mayor a 0.');
    this._balance   = parseFloat((this._balance + amount).toFixed(2));
    this._updatedAt = new Date();
  }

  /** Descuenta saldo — valida fondos suficientes */
  debit(amount: number): void {
    if (amount <= 0) throw new Error('El monto a debitar debe ser mayor a 0.');
    if (this._balance < amount)
      throw new Error(`Saldo insuficiente. Saldo actual: ${this._balance}, requerido: ${amount}.`);
    this._balance   = parseFloat((this._balance - amount).toFixed(2));
    this._updatedAt = new Date();
  }

  /** Reembolso: devuelve saldo a la cartera */
  refund(amount: number): void {
    if (amount <= 0) throw new Error('El monto de reembolso debe ser mayor a 0.');
    this._balance   = parseFloat((this._balance + amount).toFixed(2));
    this._updatedAt = new Date();
  }

  static create(userId: string, id: string): Wallet {
    const now = new Date();
    return new Wallet({ id, userId, balance: 0, createdAt: now, updatedAt: now });
  }
}
