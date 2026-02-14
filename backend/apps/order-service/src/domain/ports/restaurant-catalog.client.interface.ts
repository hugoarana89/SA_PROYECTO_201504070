export const RESTAURANT_CATALOG_CLIENT = 'RESTAURANT_CATALOG_CLIENT';

export interface OrderItemValidationRequest {
  menuItemId: string;
  quantity: number;
  price: number;
}

export interface ValidationError {
  code: string;
  message: string;
  menuItemId: string;
}

export interface ValidatedItem {
  menuItemId: string;
  name: string;
  currentPrice: number;
  isAvailable: boolean;
  requestedQuantity: number;
  subtotal: number;
}

export interface ValidateOrderItemsResult {
  valid: boolean;
  errors: ValidationError[];
  validatedItems: ValidatedItem[];
  totalAmount: number;
}

export interface RestaurantCatalogClient {
  validateOrderItems(
    restaurantId: string,
    items: OrderItemValidationRequest[],
  ): Promise<ValidateOrderItemsResult>;
  
  getRestaurantMenu(restaurantId: string): Promise<any>;
  
  getRestaurant(restaurantId: string): Promise<any>;
}