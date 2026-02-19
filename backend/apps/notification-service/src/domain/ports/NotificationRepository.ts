// ─────────────────────────────────────────────────────────────
// Port: NotificationRepository
// DIP: dominio define el contrato; la infraestructura lo implementa.
// ISP: interfaz mínima y cohesiva.
// ─────────────────────────────────────────────────────────────

import { Notification } from '../entities/Notification';

export interface NotificationRepository {
  /** Persiste el registro de una notificación enviada */
  save(notification: Notification): Promise<void>;
}

export const NOTIFICATION_REPOSITORY = 'NOTIFICATION_REPOSITORY';
