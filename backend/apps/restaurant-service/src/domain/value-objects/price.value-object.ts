import { DomainException } from '../exceptions/domain.exceptions';

export class Price {
  private readonly _value: number;

  constructor(value: number) {
    if (value < 0) {
      throw new DomainException('Price cannot be negative');
    }
    if (value > 999999.99) {
      throw new DomainException('Price exceeds maximum allowed value');
    }
    
    // Redondear a 2 decimales
    this._value = Math.round(value * 100) / 100;
  }

  get value(): number {
    return this._value;
  }

  add(other: Price): Price {
    return new Price(this._value + other._value);
  }

  subtract(other: Price): Price {
    return new Price(this._value - other._value);
  }

  multiply(factor: number): Price {
    return new Price(this._value * factor);
  }

  equals(other: Price): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value.toFixed(2);
  }
}