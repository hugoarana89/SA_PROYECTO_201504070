import { Observable } from 'rxjs';

export interface RestaurantGrpcService {
  // Restaurantes
  CreateRestaurant(data: any): Observable<any>;
  UpdateRestaurant(data: any): Observable<any>;
  DeleteRestaurant(data: any): Observable<any>;
  GetRestaurant(data: any): Observable<any>;
  ListRestaurants(data: any): Observable<any>;
  
  // Menú
  CreateMenuItem(data: any): Observable<any>;
  UpdateMenuItem(data: any): Observable<any>;
  DeleteMenuItem(data: any): Observable<any>;
  ListMenuItems(data: any): Observable<any>;
  GetRestaurantMenu(data: any): Observable<any>;
  
  // Validación
  ValidateOrderItems(data: any): Observable<any>;
}