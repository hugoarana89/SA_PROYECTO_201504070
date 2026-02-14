export class DomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainException';
  }
}

export class OrderNotFoundException extends DomainException {
  constructor(id: string) {
    super(`Order with id ${id} not found`);
    this.name = 'OrderNotFoundException';
  }
}

export class InvalidOrderStatusException extends DomainException {
  constructor(status: string, expectedStatus: string) {
    super(`Invalid order status: ${status}. Expected: ${expectedStatus}`);
    this.name = 'InvalidOrderStatusException';
  }
}

export class UnauthorizedOrderAccessException extends DomainException {
  constructor(orderId: string, userId: string) {
    super(`User ${userId} is not authorized to access order ${orderId}`);
    this.name = 'UnauthorizedOrderAccessException';
  }
}

export class OrderValidationException extends DomainException {
  constructor(errors: string[]) {
    super(`Order validation failed: ${errors.join(', ')}`);
    this.name = 'OrderValidationException';
  }
}