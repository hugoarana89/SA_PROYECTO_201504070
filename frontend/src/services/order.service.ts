import { authFetch } from "../utils/authFetch";
import { CONFIG } from "../config/config";
import type { 
  Order, 
  CreateOrderDto, 
  RejectOrderDto,
  RestaurantActionDto,
  OrdersResponse,
  OrderStatus
} from "../types/order.types";

const API_URL = CONFIG.API_URL;

export const orderService = {
  // ==================== CLIENTE ====================

  // Realizar orden
  async createOrder(data: CreateOrderDto): Promise<Order> {
    const response = await authFetch(`${API_URL}/orders`, {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al crear la orden');
    }

    return response.json();
  },

  // Cancelar orden
  async cancelOrder(orderId: string): Promise<Order> {
    const response = await authFetch(`${API_URL}/orders/${orderId}/cancel`, {
      method: 'PUT',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al cancelar la orden');
    }

    return response.json();
  },

  // Listar órdenes del cliente
  async getClientOrders(params?: {
    page?: number;
    limit?: number;
    status?: OrderStatus;
  }): Promise<OrdersResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);

    const url = `${API_URL}/orders/client${queryParams.toString() ? `?${queryParams}` : ''}`;
    const response = await authFetch(url);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al listar órdenes');
    }

    return response.json();
  },

  // ==================== RESTAURANTE ====================

  // Aceptar orden
  async acceptOrder(orderId: string, restaurantId: string): Promise<Order> {
    const response = await authFetch(`${API_URL}/orders/${orderId}/accept`, {
      method: 'PUT',
      body: JSON.stringify({ restaurant_id: restaurantId } as RestaurantActionDto),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al aceptar la orden');
    }

    return response.json();
  },

  // Rechazar orden
  async rejectOrder(orderId: string, data: RejectOrderDto): Promise<Order> {
    const response = await authFetch(`${API_URL}/orders/${orderId}/reject`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al rechazar la orden');
    }

    return response.json();
  },

  // Completar orden
  async completeOrder(orderId: string, restaurantId: string): Promise<Order> {
    const response = await authFetch(`${API_URL}/orders/${orderId}/ready`, {
      method: 'PUT',
      body: JSON.stringify({ restaurant_id: restaurantId } as RestaurantActionDto),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al completar la orden');
    }

    return response.json();
  },

  // Listar órdenes del restaurante
  async getRestaurantOrders(
    restaurantId: string,
    params?: {
      page?: number;
      limit?: number;
      status?: OrderStatus;
    }
  ): Promise<OrdersResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);

    const url = `${API_URL}/orders/restaurant/${restaurantId}${queryParams.toString() ? `?${queryParams}` : ''}`;

    console.log('Fetching restaurant orders with URL:', url); // Debug log
    const response = await authFetch(url);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al listar órdenes del restaurante');
    }

    return response.json();
  },

  // ==================== ADMIN ====================

  // Listar todas las órdenes (admin)
  async getAllOrders(params?: {
    page?: number;
    limit?: number;
    status?: OrderStatus;
  }): Promise<OrdersResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);

    const url = `${API_URL}/orders${queryParams.toString() ? `?${queryParams}` : ''}`;
    const response = await authFetch(url);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al listar órdenes');
    }

    return response.json();
  },

  // Obtener orden por ID
  async getOrderById(orderId: string): Promise<Order> {
    const response = await authFetch(`${API_URL}/orders/${orderId}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al obtener la orden');
    }

    return response.json();
  },
};