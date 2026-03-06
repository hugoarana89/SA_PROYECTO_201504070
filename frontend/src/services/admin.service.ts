// services/admin.service.ts
import { authFetch } from "../utils/authFetch";
import { CONFIG } from "../config/config";

const API_URL = CONFIG.API_URL;

export type DeliveryStatus = 'EN_CAMINO' | 'ENTREGADA' | 'CANCELADA';

export interface AdminDeliveryItem {
  id: string;
  order_id: string;
  delivery_user_id: string;
  status: DeliveryStatus;
  assigned_at: string;
  delivered_at: string;
  cancel_reason: string;
  proof_image_url: string;
}

export interface AdminDeliveriesResponse {
  deliveries: AdminDeliveryItem[];
  total: number;
  page: number;
  limit: number;
}

export interface AdminUserInfo {
  id: string;
  email: string;
  name?: string;
}

export const adminService = {
  // Obtener todos los deliveries con filtros y paginación
  async getAllDeliveries(params?: {
    status?: DeliveryStatus;
    page?: number;
    limit?: number;
  }): Promise<AdminDeliveriesResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.status) queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const url = `${API_URL}/delivery/all${queryParams.toString() ? `?${queryParams}` : ''}`;
    console.log('Fetching admin deliveries with URL:', url);
    
    const response = await authFetch(url);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al obtener los deliveries');
    }
    return response.json();
  },

  // Obtener información del usuario (repartidor) por ID
  async getUserInfo(userId: string): Promise<AdminUserInfo> {
    const response = await authFetch(`${API_URL}/auth/users/email`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
    if (!response.ok) {
      return { id: userId, email: 'Usuario no encontrado' };
    }
    return response.json();
  },

  // Método auxiliar para formatear fechas
  formatDate(dateString: string): string {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('es-GT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  },

  // Método auxiliar para obtener el color según el estado
  getStatusConfig(status: DeliveryStatus) {
    const config = {
      EN_CAMINO: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'En camino' },
      ENTREGADA: { bg: 'bg-green-100', text: 'text-green-800', label: 'Entregada' },
      CANCELADA: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelada' },
    };
    return config[status] || config.ENTREGADA;
  }
};