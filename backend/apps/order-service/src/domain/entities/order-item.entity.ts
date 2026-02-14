import { Money } from '../value-objects/money.value-object';
import { DomainException } from '../exceptions/domain.exceptions';

export class OrderItem {
  private readonly _id: string;
  private readonly _menuItemId: string;
  private readonly _productName: string;
  private readonly _quantity: number;
  private readonly _unitPrice: Money;
  private readonly _subtotal: Money;
  private readonly _createdAt: Date;

  constructor(
    id: string,
    menuItemId: string,
    productName: string,
    quantity: number,
    unitPrice: Money,
    createdAt: Date = new Date(),
  ) {
    this._id = id;
    this._menuItemId = menuItemId;
    this._productName = productName;
    this._quantity = quantity;
    this._unitPrice = unitPrice;
    this._subtotal = unitPrice.multiply(quantity);
    this._createdAt = createdAt;
    
    this.validate();
  }

  private validate(): void {
    if (!this._menuItemId) {
      throw new DomainException('Menu item ID is required');
    }
    if (!this._productName || this._productName.trim().length === 0) {
      throw new DomainException('Product name is required');
    }
    if (this._quantity <= 0) {
      throw new DomainException('Quantity must be greater than 0');
    }
  }

  // Getters
  get id(): string { return this._id; }
  get menuItemId(): string { return this._menuItemId; }
  get productName(): string { return this._productName; }
  get quantity(): number { return this._quantity; }
  get unitPrice(): Money { return this._unitPrice; }
  get subtotal(): Money { return this._subtotal; }
  get createdAt(): Date { return this._createdAt; }

  toJSON() {
    return {
      id: this._id,
      menuItemId: this._menuItemId,
      productName: this._productName,
      quantity: this._quantity,
      unitPrice: this._unitPrice.value,
      subtotal: this._subtotal.value,
      createdAt: this._createdAt,
    };
  }
}