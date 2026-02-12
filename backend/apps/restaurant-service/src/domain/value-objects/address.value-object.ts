import { DomainException } from '../exceptions/domain.exceptions';

export class Address {
  private readonly _street: string;
  private readonly _city: string;
  private readonly _state: string;
  private readonly _zipCode: string;
  private readonly _country: string;

  constructor(addressString: string) {
    const parts = addressString.split(',').map(part => part.trim());
    
    if (parts.length < 4) {
      throw new DomainException('Address must include street, city, state, and country');
    }

    this._street = parts[0];
    this._city = parts[1];
    this._state = parts[2];
    this._country = parts[parts.length - 1];
    this._zipCode = parts.length === 5 ? parts[3] : '';
  }

  get street(): string { return this._street; }
  get city(): string { return this._city; }
  get state(): string { return this._state; }
  get zipCode(): string { return this._zipCode; }
  get country(): string { return this._country; }

  toString(): string {
    let address = `${this._street}, ${this._city}, ${this._state}`;
    if (this._zipCode) {
      address += `, ${this._zipCode}`;
    }
    address += `, ${this._country}`;
    return address;
  }
}