import { Order } from '../entities/order.entity';


export const ORDER_REPOSITORY = 'ORDER_REPOSITORY';

export interface OrderRepository {
  save(order: Order): Promise<Order>;
  update(id: string, order: Partial<Order>): Promise<Order>;
  findById(id: string): Promise<Order | null>;
  findAll(
    page: number,
    limit: number,
    status?: string,
  ): Promise<{ items: Order[]; total: number }>;
  findByRestaurantId(
    restaurantId: string,
    page: number,
    limit: number,
    status?: string,
  ): Promise<{ items: Order[]; total: number }>;
  findByClientId(
    clientId: string,
    page: number,
    limit: number,
    status?: string,
  ): Promise<{ items: Order[]; total: number }>;
  exists(id: string): Promise<boolean>;
}