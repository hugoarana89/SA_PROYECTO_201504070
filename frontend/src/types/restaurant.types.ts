export interface Restaurant {
  id: string;
  owner_id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  opening_time: string;
  closing_time: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateRestaurantDto {
  name: string;
  description: string;
  address: string;
  phone: string;
  opening_time: string;
  closing_time: string;
}

export interface UpdateRestaurantDto extends Partial<CreateRestaurantDto> {
  is_active?: boolean;
}

export interface MenuItem {
  id: string;
  restaurant_id: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateMenuItemDto {
  name: string;
  description: string;
  price: number;
  image_url?: string;
  is_available: boolean;
}

export interface UpdateMenuItemDto extends Partial<CreateMenuItemDto> {
  restaurant_id?: string;
}

export interface RestaurantsResponse {
  restaurants: Restaurant[];
  total: number;
  page: number;
  limit: number;
}

export interface MenuResponse {
  items: MenuItem[];
  total: number;
  page: number;
  limit: number;
}