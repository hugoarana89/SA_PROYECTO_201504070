import { authFetch } from "../utils/authFetch";
import { CONFIG } from "../config/config";
import type {
  Restaurant,
  CreateRestaurantDto,
  UpdateRestaurantDto,
  RestaurantsResponse,
  MenuItem,
  CreateMenuItemDto,
  UpdateMenuItemDto,
  MenuResponse,
  UsersByRoleResponse,
  UserByRole
} from "../types/restaurant.types";

const API_URL = CONFIG.API_URL;

// ==================== RESTAURANTES ====================

export const restaurantService = {
  // Obtener usuarios por rol (solo ADMIN)
  async getUsersByRole(role: string): Promise<UserByRole[]> {
    const response = await authFetch(`${API_URL}/auth/users/role`, {
      method: 'POST',
      body: JSON.stringify({ role }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al obtener usuarios');
    }

    const data: UsersByRoleResponse = await response.json();
    return data.users;
  },

  // Crear restaurante (solo ADMIN) - AHORA REQUIERE ownerId EN LA URL
  async createRestaurant(ownerId: string, data: CreateRestaurantDto): Promise<Restaurant> {
    const response = await authFetch(`${API_URL}/restaurants/${ownerId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al crear restaurante');
    }

    return response.json();
  },

  // Actualizar restaurante (solo ADMIN)
  async updateRestaurant(id: string, data: UpdateRestaurantDto): Promise<Restaurant> {
    const response = await authFetch(`${API_URL}/restaurants/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al actualizar restaurante');
    }

    return response.json();
  },

  // Eliminar restaurante (solo ADMIN)
  async deleteRestaurant(id: string): Promise<void> {
    const response = await authFetch(`${API_URL}/restaurants/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al eliminar restaurante');
    }
  },

  // Obtener restaurante por ID (público)
  async getRestaurantById(id: string): Promise<Restaurant> {
    const response = await fetch(`${API_URL}/restaurants/${id}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al obtener restaurante');
    }

    return response.json();
  },

  // Listar restaurantes (público)
  async getRestaurants(params?: {
    page?: number;
    limit?: number;
    onlyActive?: boolean;
    search?: string;
  }): Promise<RestaurantsResponse> {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.onlyActive !== undefined) queryParams.append('onlyActive', params.onlyActive.toString());
    if (params?.search) queryParams.append('search', params.search);

    const url = `${API_URL}/restaurants${queryParams.toString() ? `?${queryParams}` : ''}`;
    const response = await fetch(url);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al listar restaurantes');
    }

    return response.json();
  },

  async getRestaurantsByOwner(): Promise<{ restaurants: Restaurant[] }> {
    const response = await authFetch(`${API_URL}/restaurants/owner`, {
      method: "GET",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Error al obtener restaurantes del propietario");
    }

    return response.json();
  },
};

// ==================== MENÚ ====================

export const menuService = {
  // Crear item de menú (RESTAURANTE/ADMIN)
  async createMenuItem(restaurantId: string, data: CreateMenuItemDto): Promise<MenuItem> {
    const response = await authFetch(`${API_URL}/restaurants/${restaurantId}/menu-items`, {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al crear item de menú');
    }

    return response.json();
  },

  // Actualizar item de menú (RESTAURANTE/ADMIN)
  async updateMenuItem(id: string, data: UpdateMenuItemDto): Promise<MenuItem> {
    const response = await authFetch(`${API_URL}/restaurants/menu-items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });

    console.log('Response from updateMenuItem:', `${API_URL}/restaurants/menu-items/${id}`);
    console.log('Response status:', data);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al actualizar item de menú');
    }

    return response.json();
  },

  // Eliminar item de menú (RESTAURANTE/ADMIN)
  async deleteMenuItem(id: string, restaurantId: string): Promise<void> {
    const response = await authFetch(`${API_URL}/restaurants/menu-items/${id}`, {
      method: 'DELETE',
      body: JSON.stringify({ restaurantId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al eliminar item de menú');
    }
  },

  // Obtener menú completo del restaurante (público)
  async getRestaurantMenu(restaurantId: string): Promise<MenuResponse> {
    const response = await fetch(`${API_URL}/restaurants/${restaurantId}/menu`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al obtener menú');
    }

    return response.json();
  },

  // Listar items de menú con filtros (público)
  async getMenuItems(restaurantId: string, params?: {
    onlyAvailable?: boolean;
    page?: number;
    limit?: number;
  }): Promise<MenuResponse> {
    const queryParams = new URLSearchParams();
    if (params?.onlyAvailable !== undefined) queryParams.append('onlyAvailable', params.onlyAvailable.toString());
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const url = `${API_URL}/restaurants/${restaurantId}/menu-items${queryParams.toString() ? `?${queryParams}` : ''}`;
    const response = await fetch(url);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al listar items de menú');
    }

    return response.json();
  },
};