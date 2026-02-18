export enum OrderStatusEnum {
  CREATED = 'CREADA',
  CANCELLED = 'CANCELADA',
  REJECTED = 'RECHAZADA',
  IN_PROGRESS = 'EN_PROCESO',
  READY = 'LISTA',
  COMPLETED = 'FINALIZADA',
}

export class OrderStatus {
  private readonly _value: OrderStatusEnum;

  constructor(value: string) {
    if (!Object.values(OrderStatusEnum).includes(value as OrderStatusEnum)) {
      throw new Error(`Invalid order status: ${value}`);
    }
    this._value = value as OrderStatusEnum;
  }

  static get CREATED(): OrderStatus {
    return new OrderStatus(OrderStatusEnum.CREATED);
  }

  static get CANCELLED(): OrderStatus {
    return new OrderStatus(OrderStatusEnum.CANCELLED);
  }

  static get IN_PROGRESS(): OrderStatus {
    return new OrderStatus(OrderStatusEnum.IN_PROGRESS);
  }

  static get COMPLETED(): OrderStatus {
    return new OrderStatus(OrderStatusEnum.COMPLETED);
  }

  static get REJECTED(): OrderStatus {
    return new OrderStatus(OrderStatusEnum.REJECTED);
  }

  get value(): string {
    return this._value;
  }

  equals(other: OrderStatus): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}