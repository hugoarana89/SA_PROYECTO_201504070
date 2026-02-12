import { Price } from '../value-objects/price.value-object';
import { DomainException } from '../exceptions/domain.exceptions';

export class MenuItem {
  private readonly _id: string;
  private readonly _restaurantId: string;
  private _name: string;
  private _description: string;
  private _price: Price;
  private _imageUrl: string;
  private _isAvailable: boolean;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(
    id: string,
    restaurantId: string,
    name: string,
    description: string,
    price: Price,
    imageUrl: string,
    isAvailable: boolean,
    createdAt: Date,
    updatedAt: Date,
  ) {
    this._id = id;
    this._restaurantId = restaurantId;
    this._name = name;
    this._description = description;
    this._price = price;
    this._imageUrl = imageUrl;
    this._isAvailable = isAvailable;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
    
    this.validate();
  }

  private validate(): void {
    if (!this._name || this._name.trim().length === 0) {
      throw new DomainException('Menu item name is required');
    }
    if (this._name.length > 255) {
      throw new DomainException('Menu item name must be less than 255 characters');
    }
    if (!this._restaurantId) {
      throw new DomainException('Restaurant ID is required');
    }
  }

  // Getters
  get id(): string { return this._id; }
  get restaurantId(): string { return this._restaurantId; }
  get name(): string { return this._name; }
  get description(): string { return this._description; }
  get price(): Price { return this._price; }
  get imageUrl(): string { return this._imageUrl; }
  get isAvailable(): boolean { return this._isAvailable; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }

  // Métodos de negocio
  updateDetails(
    name: string,
    description: string,
    price: Price,
    imageUrl: string,
    isAvailable: boolean,
  ): void {
    this._name = name;
    this._description = description;
    this._price = price;
    this._imageUrl = imageUrl;
    this._isAvailable = isAvailable;
    this._updatedAt = new Date();
    
    this.validate();
  }

  makeAvailable(): void {
    this._isAvailable = true;
    this._updatedAt = new Date();
  }

  makeUnavailable(): void {
    this._isAvailable = false;
    this._updatedAt = new Date();
  }

  canBeOrdered(quantity: number): boolean {
    return this._isAvailable && quantity > 0;
  }

  calculateSubtotal(quantity: number): Price {
    return this._price.multiply(quantity);
  }

  toJSON() {
    return {
      id: this._id,
      restaurantId: this._restaurantId,
      name: this._name,
      description: this._description,
      price: this._price.value,
      imageUrl: this._imageUrl,
      isAvailable: this._isAvailable,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}