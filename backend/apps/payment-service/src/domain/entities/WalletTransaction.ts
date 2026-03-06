// ─────────────────────────────────────────────────────────────
// Domain Entity: WalletTransaction
// Inmutable por diseño — las transacciones no se modifican.
// ─────────────────────────────────────────────────────────────

export enum TransactionType {
  RECARGA   = 'RECARGA',
  PAGO      = 'PAGO',
  REEMBOLSO = 'REEMBOLSO',
}

export interface WalletTransactionProps {
  id:          string;
  walletId:    string;
  type:        TransactionType;
  amount:      number;
  description: string | null;
  createdAt:   Date;
}

export class WalletTransaction {
  readonly id:          string;
  readonly walletId:    string;
  readonly type:        TransactionType;
  readonly amount:      number;
  readonly description: string | null;
  readonly createdAt:   Date;

  constructor(props: WalletTransactionProps) {
    this.id          = props.id;
    this.walletId    = props.walletId;
    this.type        = props.type;
    this.amount      = props.amount;
    this.description = props.description;
    this.createdAt   = props.createdAt;
  }

  static create(
    walletId:    string,
    type:        TransactionType,
    amount:      number,
    id:          string,
    description: string | null = null,
  ): WalletTransaction {
    return new WalletTransaction({ id, walletId, type, amount, description, createdAt: new Date() });
  }
}
