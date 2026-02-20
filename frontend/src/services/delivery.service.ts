import { authFetch } from "../utils/authFetch";
import { CONFIG } from "../config/config";

const API_URL = CONFIG.API_URL;

export type DeliveryStatus = 'EN_CAMINO' | 'ENTREGADA' | 'CANCELADA';

export interface DeliveryItem {
  id: string;
  order_id: string;
  delivery_user_id: string;
  status: DeliveryStatus;
  assigned_at: string;
  delivered_at: string;
  cancel_reason: string;
}

export interface DeliveriesResponse {
  deliveries: DeliveryItem[];
  total: number;
  page: number;
  limit: number;
}

export interface AcceptOrderResponse {
  delivery: DeliveryItem;
}

export interface UpdateStatusDto {
  status: 2 | 3; // 2 = Entregada, 3 = Cancelada
  cancel_reason?: string;
}

export const deliveryService = {
  // Aceptar una orden como repartidor
  async acceptOrder(orderId: string): Promise<AcceptOrderResponse> {
    const response = await authFetch(`${API_URL}/delivery/orders/${orderId}/accept`, {
      method: 'POST',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al aceptar la orden');
    }
    return response.json();
  },

  // Actualizar estado de entrega (2=Entregada, 3=Cancelada)
  async updateStatus(deliveryId: string, data: UpdateStatusDto): Promise<{ delivery: DeliveryItem }> {
    const response = await authFetch(`${API_URL}/delivery/${deliveryId}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al actualizar estado');
    }
    return response.json();
  },

  // Obtener entregas del repartidor autenticado
  async getDeliveries(params?: {
    page?: number;
    limit?: number;
    status?: DeliveryStatus;
  }): Promise<DeliveriesResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);

    const url = `${API_URL}/delivery${queryParams.toString() ? `?${queryParams}` : ''}`;
    console.log('Fetching deliveries with URL:', url);
    const response = await authFetch(url);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al obtener entregas');
    }
    return response.json();
  },

  // Obtener email de usuario por ID
  async getUserEmail(userId: string): Promise<string> {
    const response = await authFetch(`${API_URL}/auth/users/email`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
    if (!response.ok) return '';
    const data = await response.json();
    return data.email || '';
  },

  // Notificar orden en camino
  async notifyOrderInTransit(payload: {
    user_id: string;
    client_email: string;
    order_id: string;
    delivery_user_id: string;
    delivery_name: string;
    products: { name: string; quantity: number; price: number }[];
  }): Promise<void> {
    await authFetch(`${API_URL}/notifications/order-in-transit`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Notificar orden cancelada por repartidor
  async notifyOrderCancelled(payload: {
    user_id: string;
    client_email: string;
    order_id: string;
    delivery_user_id: string;
    delivery_name: string;
    cancel_reason: string;
    products: { name: string; quantity: number; price: number }[];
  }): Promise<void> {
    await authFetch(`${API_URL}/notifications/order-cancelled-by-delivery`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
