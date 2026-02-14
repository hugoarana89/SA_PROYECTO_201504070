export class DomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainException';
  }
}

export class RestaurantNotFoundException extends DomainException {
  constructor(id: string) {
    super(`Restaurante con id ${id} no encontrado`);
    this.name = 'RestaurantNotFoundException';
  }
}

export class MenuItemNotFoundException extends DomainException {
  constructor(id: string) {
    super(`Menu item con id ${id} no encontrado`);
    this.name = 'MenuItemNotFoundException';
  }
}

export class UnauthorizedRestaurantAccessException extends DomainException {
  constructor(restaurantId: string, userId: string) {
    super(`Usuario ${userId} no está autorizado para acceder al restaurante ${restaurantId}`);
    this.name = 'UnauthorizedRestaurantAccessException';
  }
}