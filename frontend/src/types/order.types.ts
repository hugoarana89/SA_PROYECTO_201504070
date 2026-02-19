export type OrderStatus = 'CREADA' | 'EN_PROCESO' | 'LISTA' | 'FINALIZADA' | 'CANCELADA' | 'RECHAZADA';

export interface OrderItem {
  id: string;
  menu_item_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Order {
  id: string;
  client_id: string;
  restaurant_id: string;
  restaurant_name?: string; // Para mostrar en UI
  status: OrderStatus;
  total_amount: number;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
  rejection_reason?: string;
}

export interface CreateOrderDto {
  restaurant_id: string;
  items: {
    menu_item_id: string;
    quantity: number;
    price: number;
    product_name: string;
  }[];
}

export interface RejectOrderDto {
  restaurant_id: string;
  reason: string;
}

export interface RestaurantActionDto {
  restaurant_id: string;
}

export interface OrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
}

// Para el carrito de compras
export interface CartItem extends OrderItem {
  menu_item_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Cart {
  restaurant_id: string;
  restaurant_name: string;
  items: CartItem[];
  total: number;
}