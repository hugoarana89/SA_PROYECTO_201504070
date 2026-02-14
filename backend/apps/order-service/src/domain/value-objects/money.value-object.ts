import { DomainException } from '../exceptions/domain.exceptions';

export class Money {
  private readonly _value: number;

  constructor(value: number) {
    if (value < 0) {
      throw new DomainException('Dinero no puede ser negativo');
    }
    if (value > 9999999.99) {
      throw new DomainException('El dinero excede el valor máximo permitido');
    }
    
    this._value = Math.round(value * 100) / 100;
  }

  get value(): number {
    return this._value;
  }

  add(other: Money): Money {
    return new Money(this._value + other._value);
  }

  subtract(other: Money): Money {
    return new Money(this._value - other._value);
  }

  multiply(factor: number): Money {
    return new Money(this._value * factor);
  }

  equals(other: Money): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value.toFixed(2);
  }
}