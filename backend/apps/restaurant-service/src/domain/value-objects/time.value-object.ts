import { DomainException } from '../exceptions/domain.exceptions';

export class Time {
  private readonly _hours: number;
  private readonly _minutes: number;

  constructor(time?: string | null) {
    // Si es null o undefined, usar valor por defecto
    if (!time) {
      this._hours = 0;
      this._minutes = 0;
      return;
    }

    // Limpiar el string y eliminar segundos si existen
    let cleanTime = time.trim();
    
    // Si viene con segundos (HH:MM:SS), eliminar los segundos
    if (cleanTime.includes(':')) {
      const parts = cleanTime.split(':');
      if (parts.length >= 2) {
        cleanTime = `${parts[0]}:${parts[1]}`;
      }
    }

    // Validar formato HH:MM
    const regex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!regex.test(cleanTime)) {
      console.warn(`⚠️ Formato de hora inválido: "${time}", usando 00:00`);
      this._hours = 0;
      this._minutes = 0;
      return;
    }
    
    const [hours, minutes] = cleanTime.split(':').map(Number);
    this._hours = hours;
    this._minutes = minutes;
  }

  get hours(): number {
    return this._hours;
  }

  get minutes(): number {
    return this._minutes;
  }

  isBefore(other: Time): boolean {
    if (this._hours < other._hours) return true;
    if (this._hours === other._hours && this._minutes < other._minutes) return true;
    return false;
  }

  isAfter(other: Time): boolean {
    if (this._hours > other._hours) return true;
    if (this._hours === other._hours && this._minutes > other._minutes) return true;
    return false;
  }

  equals(other: Time): boolean {
    return this._hours === other._hours && this._minutes === other._minutes;
  }

  toString(): string {
    return `${this._hours.toString().padStart(2, '0')}:${this._minutes.toString().padStart(2, '0')}`;
  }

  toDate(): Date {
    const date = new Date();
    date.setHours(this._hours, this._minutes, 0, 0);
    return date;
  }
}