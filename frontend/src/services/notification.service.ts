import { authFetch } from "../utils/authFetch";
import { CONFIG } from "../config/config";

const API_URL = CONFIG.API_URL;

export interface NotificationProduct {
  name: string;
  quantity: number;
  price: number;
}

export const notificationService = {
  // ==================== CLIENTE ====================

  async notifyOrderCreated(payload: {
    client_name: string;
    client_email: string;
    order_id: string;
    products: NotificationProduct[];
    total_amount: number;
    created_at: string;
  }): Promise<void> {
    try {
      await authFetch(`${API_URL}/notifications/order-created`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error('Error al enviar notificación de orden creada:', error);
    }
  },

  async notifyOrderCancelledByClient(payload: {
    client_name: string;
    client_email: string;
    order_id: string;
    products: NotificationProduct[];
    cancelled_at: string;
  }): Promise<void> {
    try {
      await authFetch(`${API_URL}/notifications/order-cancelled-by-client`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error('Error al enviar notificación de cancelación por cliente:', error);
    }
  },

  // ==================== RESTAURANTE ====================

  async notifyOrderCancelledByRestaurant(payload: {
    user_id: string;
    client_email: string;
    order_id: string;
    restaurant_name: string;
    cancel_reason: string;
    products: NotificationProduct[];
  }): Promise<void> {
    try {
      await authFetch(`${API_URL}/notifications/order-cancelled-by-restaurant`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error('Error al enviar notificación de cancelación por restaurante:', error);
    }
  },

  async notifyOrderRejected(payload: {
    user_id: string;
    client_email: string;
    order_id: string;
    restaurant_name: string;
    products: NotificationProduct[];
  }): Promise<void> {
    try {
      await authFetch(`${API_URL}/notifications/order-rejected`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error('Error al enviar notificación de orden rechazada:', error);
    }
  },

  // ==================== UTIL ====================

  // Obtiene el email de un usuario por su ID (para restaurante y repartidor)
  async getUserEmail(userId: string): Promise<string> {
    try {
      const response = await authFetch(`${API_URL}/auth/users/email`, {
        method: 'POST',
        body: JSON.stringify({ userId }),
      });
      if (!response.ok) return '';
      const data = await response.json();
      return data.email || '';
    } catch {
      return '';
    }
  },
};