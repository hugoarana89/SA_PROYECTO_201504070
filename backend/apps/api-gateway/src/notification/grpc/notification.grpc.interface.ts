// ─────────────────────────────────────────────────────────────
// GrpcInterface: notification.grpc.interface.ts
// ISP: Define solo los métodos que el Gateway consume.
//      Espejo tipado del notification.proto.
// ─────────────────────────────────────────────────────────────

import { Observable } from 'rxjs';

// ── Sub-interface: producto ───────────────────────────────────
export interface OrderProduct {
  name:     string;
  quantity: number;
  price:    number;
}

// ── Respuesta compartida ──────────────────────────────────────
export interface NotificationResponse {
  success:         boolean;
  notification_id: string;
  message:         string;
}

// ── NotifyOrderCreated ────────────────────────────────────────
export interface NotifyOrderCreatedRequest {
  user_id:      string;
  client_name:  string;
  client_email: string;
  order_id:     string;
  products:     OrderProduct[];
  total_amount: number;
  created_at:   string;
}

// ── NotifyOrderCancelledByClient ──────────────────────────────
export interface NotifyOrderCancelledByClientRequest {
  user_id:      string;
  client_name:  string;
  client_email: string;
  order_id:     string;
  products:     OrderProduct[];
  cancelled_at: string;
}

// ── NotifyOrderInTransit ──────────────────────────────────────
export interface NotifyOrderInTransitRequest {
  user_id:          string;
  client_email:     string;
  order_id:         string;
  delivery_user_id: string;
  delivery_name:    string;
  products:         OrderProduct[];
}

// ── NotifyOrderCancelledByRestaurant ──────────────────────────
export interface NotifyOrderCancelledByRestaurantRequest {
  user_id:         string;
  client_email:    string;
  order_id:        string;
  restaurant_name: string;
  cancel_reason:   string;
  products:        OrderProduct[];
}

// ── NotifyOrderCancelledByDelivery ────────────────────────────
export interface NotifyOrderCancelledByDeliveryRequest {
  user_id:          string;
  client_email:     string;
  order_id:         string;
  delivery_user_id: string;
  delivery_name:    string;
  cancel_reason:    string;
  products:         OrderProduct[];
}

// ── NotifyOrderRejected ───────────────────────────────────────
export interface NotifyOrderRejectedRequest {
  user_id:         string;
  client_email:    string;
  order_id:        string;
  restaurant_name: string;
  products:        OrderProduct[];
}

// ── Contrato del cliente gRPC ─────────────────────────────────
export interface NotificationGrpcService {
  notifyOrderCreated(data: NotifyOrderCreatedRequest):                         Observable<NotificationResponse>;
  notifyOrderCancelledByClient(data: NotifyOrderCancelledByClientRequest):     Observable<NotificationResponse>;
  notifyOrderInTransit(data: NotifyOrderInTransitRequest):                     Observable<NotificationResponse>;
  notifyOrderCancelledByRestaurant(data: NotifyOrderCancelledByRestaurantRequest): Observable<NotificationResponse>;
  notifyOrderCancelledByDelivery(data: NotifyOrderCancelledByDeliveryRequest): Observable<NotificationResponse>;
  notifyOrderRejected(data: NotifyOrderRejectedRequest):                       Observable<NotificationResponse>;
}