import { Time } from '../value-objects/time.value-object';
import { Address } from '../value-objects/address.value-object';
import { DomainException } from '../exceptions/domain.exceptions';

export class Restaurant {
  private readonly _id: string;
  private _ownerId: string;
  private _name: string;
  private _description: string;
  private _address: Address;
  private _phone: string;
  private _openingTime: Time;
  private _closingTime: Time;
  private _isActive: boolean;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(
    id: string,
    ownerId: string,
    name: string,
    description: string,
    address: Address,
    phone: string,
    openingTime: Time,
    closingTime: Time,
    isActive: boolean,
    createdAt: Date,
    updatedAt: Date,
  ) {
    this._id = id;
    this._ownerId = ownerId;
    this._name = name;
    this._description = description;
    this._address = address;
    this._phone = phone;
    this._openingTime = openingTime;
    this._closingTime = closingTime;
    this._isActive = isActive;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
    
    this.validate();
  }

  private validate(): void {
    if (!this._name || this._name.trim().length === 0) {
      throw new DomainException('Restaurant name is required');
    }
    if (this._name.length > 255) {
      throw new DomainException('Restaurant name must be less than 255 characters');
    }
    if (this._closingTime.isBefore(this._openingTime)) {
      throw new DomainException('Closing time must be after opening time');
    }
  }

  // Getters
  get id(): string { return this._id; }
  get ownerId(): string { return this._ownerId; }
  get name(): string { return this._name; }
  get description(): string { return this._description; }
  get address(): Address { return this._address; }
  get phone(): string { return this._phone; }
  get openingTime(): Time { return this._openingTime; }
  get closingTime(): Time { return this._closingTime; }
  get isActive(): boolean { return this._isActive; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }

  // Métodos de negocio
  updateDetails(
    name: string,
    description: string,
    address: Address,
    phone: string,
    openingTime: Time,
    closingTime: Time,
  ): void {
    this._name = name;
    this._description = description;
    this._address = address;
    this._phone = phone;
    this._openingTime = openingTime;
    this._closingTime = closingTime;
    this._updatedAt = new Date();
    
    this.validate();
  }

  activate(): void {
    this._isActive = true;
    this._updatedAt = new Date();
  }

  deactivate(): void {
    this._isActive = false;
    this._updatedAt = new Date();
  }

  isOpenAt(time: Time): boolean {
    return !time.isBefore(this._openingTime) && !time.isAfter(this._closingTime);
  }

  toJSON() {
    return {
      id: this._id,
      ownerId: this._ownerId,
      name: this._name,
      description: this._description,
      address: this._address.toString(),
      phone: this._phone,
      openingTime: this._openingTime.toString(),
      closingTime: this._closingTime.toString(),
      isActive: this._isActive,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
    };
  }
}