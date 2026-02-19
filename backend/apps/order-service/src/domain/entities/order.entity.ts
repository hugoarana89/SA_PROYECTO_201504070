import { OrderStatus } from '../value-objects/order-status.value-object';
import { Money } from '../value-objects/money.value-object';
import { OrderItem } from './order-item.entity';
import { DomainException } from '../exceptions/domain.exceptions';

export class Order {
  private readonly _id: string;
  private readonly _clientId: string;
  private readonly _restaurantId: string;
  private _status: OrderStatus;
  private _items: OrderItem[];
  private _totalAmount: Money;
  private _rejectionReason: string;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(
    id: string,
    clientId: string,
    restaurantId: string,
    items: OrderItem[],
    status: OrderStatus = OrderStatus.CREATED,
    totalAmount: Money,
    rejectionReason: string = '',
    createdAt: Date = new Date(),
    updatedAt: Date = new Date(),
  ) {
    this._id = id;
    this._clientId = clientId;
    this._restaurantId = restaurantId;
    this._items = items;
    this._status = status;
    this._totalAmount = totalAmount;
    this._rejectionReason = rejectionReason;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;

    this.validate();
  }

  private validate(): void {
    if (!this._clientId) {
      throw new DomainException('El ID del cliente es obligatorio');
    }
    if (!this._restaurantId) {
      throw new DomainException('El ID del restaurante es obligatorio');
    }
    if (this._items.length === 0) {
      throw new DomainException('El pedido debe tener al menos un item');
    }
  }

  // Getters
  get id(): string { return this._id; }
  get clientId(): string { return this._clientId; }
  get restaurantId(): string { return this._restaurantId; }
  get status(): OrderStatus { return this._status; }
  get items(): OrderItem[] { return [...this._items]; }
  get totalAmount(): Money { return this._totalAmount; }
  get rejectionReason(): string { return this._rejectionReason; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }

  // Métodos de negocio
  cancel(clientId: string): void {
    if (clientId !== this._clientId) {
      throw new DomainException('Solo el cliente puede cancelar su propio pedido.');
    }

    if (this._status.value !== OrderStatus.CREATED.value) {
      throw new DomainException(`No se puede cancelar una orden en estado ${this._status.value}`);
    }

    this._status = OrderStatus.CANCELLED;
    this._updatedAt = new Date();
  }

  reject(restaurantId: string, reason: string): void {
    if (restaurantId !== this._restaurantId) {
      throw new DomainException('Solo el restaurante puede rechazar sus pedidos');
    }

    if (this._status.value !== OrderStatus.CREATED.value) {
      throw new DomainException(`No se puede rechazar un pedido en estado ${this._status.value}`);
    }

    this._status = OrderStatus.REJECTED;
    this._rejectionReason = reason || 'Sin razón especificada';
    this._updatedAt = new Date();
  }

  accept(restaurantId: string): void {
    if (restaurantId !== this._restaurantId) {
      throw new DomainException('Solo el restaurante puede aceptar sus pedidos');
    }

    if (this._status.value !== OrderStatus.CREATED.value) {
      throw new DomainException(`No se puede aceptar un pedido en estado ${this._status.value}`);
    }

    this._status = OrderStatus.IN_PROGRESS;
    this._updatedAt = new Date();
  }


  ready(restaurantId: string): void {
    if (restaurantId !== this._restaurantId) {
      throw new DomainException('Solo el restaurante puede marcar sus pedidos como listos');
    }

    if (this._status.value !== OrderStatus.IN_PROGRESS.value) {
      throw new DomainException(`No se puede marcar como listo un pedido en estado ${this._status.value}`);
    }

    this._status = OrderStatus.READY;
    this._updatedAt = new Date();
  }

  complete(restaurantId: string): void {
    if (restaurantId !== this._restaurantId) {
      throw new DomainException('Solo el restaurante puede completar sus pedidos');
    }

    if (this._status.value !== OrderStatus.READY.value) {
      throw new DomainException(`No se puede finalizar un pedido en estado ${this._status.value}`);
    }

    this._status = OrderStatus.COMPLETED;
    this._updatedAt = new Date();
  }

  isClient(clientId: string): boolean {
    return this._clientId === clientId;
  }

  isRestaurant(restaurantId: string): boolean {
    return this._restaurantId === restaurantId;
  }

  toJSON() {
    return {
      id: this._id,
      clientId: this._clientId,
      restaurantId: this._restaurantId,
      status: this._status.value,
      items: this._items.map(item => item.toJSON()),
      totalAmount: this._totalAmount.value,
      rejectionReason: this._rejectionReason,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}