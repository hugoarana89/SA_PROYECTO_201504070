// ─────────────────────────────────────────────────────────────
// Port: DeliveryRepository
// DIP: el dominio define el contrato; la infraestructura lo implementa.
// ISP: interfaz mínima y cohesiva, sin métodos innecesarios.
// ─────────────────────────────────────────────────────────────

import { Delivery, DeliveryStatus } from '../entities/Delivery';

// ── Parámetros para listado paginado ──────────────────────────
export interface FindByUserParams {
  deliveryUserId: string;
  statusFilter?:  DeliveryStatus; // undefined = todas
  page:           number;
  limit:          number;
}

export interface PaginatedDeliveries {
  deliveries: Delivery[];
  total:      number;
  page:       number;
  limit:      number;
}

export interface DeliveryRepository {
  findAll(arg0: { statusFilter: DeliveryStatus | undefined; page: number; limit: number; }): PaginatedDeliveries | PromiseLike<PaginatedDeliveries>;
  /** Guarda una nueva entrega (INSERT) */
  save(delivery: Delivery): Promise<void>;

  /** Persiste los cambios de una entrega existente (UPDATE) */
  update(delivery: Delivery): Promise<void>;

  /** Busca una entrega por su ID */
  findById(id: string): Promise<Delivery | null>;

  /** Busca una entrega activa por el ID de la orden */
  findByOrderId(orderId: string): Promise<Delivery | null>;

  /** Lista las entregas de un repartidor con paginación y filtro opcional por status */
  findByUser(params: FindByUserParams): Promise<PaginatedDeliveries>;
}

/** Token de inyección de dependencias (DIP) */
export const DELIVERY_REPOSITORY = 'DELIVERY_REPOSITORY';