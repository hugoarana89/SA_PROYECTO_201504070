// ─────────────────────────────────────────────────────────────
// GrpcInterface: delivery.grpc.interface.ts
// ISP: Define solo los métodos que el Gateway consume.
//      Espejo tipado del delivery.proto.
// ─────────────────────────────────────────────────────────────

import { Observable } from 'rxjs';

// ── Enums ─────────────────────────────────────────────────────
export enum DeliveryStatus {
  ASIGNADA  = 0,
  EN_CAMINO = 1,
  ENTREGADA = 2,
  CANCELADA = 3,
}

// Valores string válidos para el filtro de listado
export type DeliveryStatusFilter = 'EN_CAMINO' | 'ENTREGADA' | 'CANCELADA';

// ── Mensaje compartido ────────────────────────────────────────
export interface Delivery {
  id:               string;
  order_id:         string;
  delivery_user_id: string;
  status:           DeliveryStatus;
  assigned_at:      string;
  delivered_at:     string;
  cancel_reason:    string;
}

// ── AcceptOrder ───────────────────────────────────────────────
export interface AcceptOrderRequest {
  order_id:         string;
  delivery_user_id: string;
}

export interface AcceptOrderResponse {
  delivery: Delivery;
}

// ── UpdateDeliveryStatus ──────────────────────────────────────
export interface UpdateDeliveryStatusRequest {
  delivery_id:   string;
  status:        DeliveryStatus;
  cancel_reason?: string; // solo si status = CANCELADA
}

export interface UpdateDeliveryStatusResponse {
  delivery: Delivery;
}

// ── GetDelivery ───────────────────────────────────────────────
export interface GetDeliveryRequest {
  delivery_id: string;
}

export interface GetDeliveryResponse {
  delivery: Delivery;
}

// ── ListDeliveries ────────────────────────────────────────────
export interface ListDeliveriesRequest {
  delivery_user_id: string;             // ID del repartidor autenticado
  status_filter:    string;             // "" = todas | "EN_CAMINO" | "ENTREGADA" | "CANCELADA"
  page:             number;
  limit:            number;
}

export interface ListDeliveriesResponse {
  deliveries: Delivery[];
  total:      number;
  page:       number;
  limit:      number;
}

// ── Contrato del cliente gRPC ─────────────────────────────────
export interface DeliveryGrpcService {
  acceptOrder(data: AcceptOrderRequest):                   Observable<AcceptOrderResponse>;
  updateDeliveryStatus(data: UpdateDeliveryStatusRequest): Observable<UpdateDeliveryStatusResponse>;
  getDelivery(data: GetDeliveryRequest):                   Observable<GetDeliveryResponse>;
  listDeliveries(data: ListDeliveriesRequest):             Observable<ListDeliveriesResponse>;
}