export class DomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainException';
  }
}

export class RestaurantNotFoundException extends DomainException {
  constructor(id: string) {
    super(`Restaurant with id ${id} not found`);
    this.name = 'RestaurantNotFoundException';
  }
}

export class MenuItemNotFoundException extends DomainException {
  constructor(id: string) {
    super(`Menu item with id ${id} not found`);
    this.name = 'MenuItemNotFoundException';
  }
}

export class UnauthorizedRestaurantAccessException extends DomainException {
  constructor(restaurantId: string, userId: string) {
    super(`User ${userId} is not authorized to access restaurant ${restaurantId}`);
    this.name = 'UnauthorizedRestaurantAccessException';
  }
}