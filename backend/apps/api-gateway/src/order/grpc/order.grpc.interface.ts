import { Observable } from 'rxjs';

export interface OrderGrpcService {
  // Órdenes
  CreateOrder(data: CreateOrderRequest): Observable<OrderResponse>;
  CancelOrder(data: CancelOrderRequest): Observable<OrderResponse>;
  RejectOrder(data: RejectOrderRequest): Observable<OrderResponse>;
  AcceptOrder(data: AcceptOrderRequest): Observable<OrderResponse>;
  ReadyOrder(data: ReadyOrderRequest): Observable<OrderResponse>;
  CompleteOrder(data: CompleteOrderRequest): Observable<OrderResponse>;
  GetOrder(data: GetOrderRequest): Observable<OrderResponse>;
  ListOrders(data: ListOrdersRequest): Observable<ListOrdersResponse>;
  ListRestaurantOrders(data: ListRestaurantOrdersRequest): Observable<ListOrdersResponse>;
  ListClientOrders(data: ListClientOrdersRequest): Observable<ListOrdersResponse>;
}

// Requests
export interface CreateOrderRequest {
  client_id: string;
  restaurant_id: string;
  items: OrderItemRequest[];
}

export interface OrderItemRequest {
  menu_item_id: string;
  quantity: number;
  price: number;
  product_name: string;
}

export interface CancelOrderRequest {
  order_id: string;
  client_id: string;
}

export interface RejectOrderRequest {
  order_id: string;
  restaurant_id: string;
  reason?: string;
}

export interface AcceptOrderRequest {
  order_id: string;
  restaurant_id: string;
}

export interface ReadyOrderRequest {
  order_id: string;
  restaurant_id: string;
}

export interface CompleteOrderRequest {
  order_id: string;
  restaurant_id: string;
}

export interface GetOrderRequest {
  order_id: string;
}

export interface ListOrdersRequest {
  page?: number;
  limit?: number;
  status?: string;
}

export interface ListRestaurantOrdersRequest {
  restaurant_id: string;
  page?: number;
  limit?: number;
  status?: string;
}

export interface ListClientOrdersRequest {
  client_id: string;
  page?: number;
  limit?: number;
  status?: string;
}

// Responses
export interface OrderResponse {
  id: string;
  client_id: string;
  restaurant_id: string;
  status: string;
  total_amount: number;
  items: OrderItemResponse[];
  created_at: string;
  updated_at: string;
  rejection_reason?: string;
}

export interface OrderItemResponse {
  id: string;
  menu_item_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface ListOrdersResponse {
  orders: OrderResponse[];
  total: number;
  page: number;
  limit: number;
}