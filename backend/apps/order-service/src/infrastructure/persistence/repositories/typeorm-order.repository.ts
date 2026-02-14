import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderRepository } from '../../../domain/ports/order.repository.interface';
import { Order } from '../../../domain/entities/order.entity';
import { OrderItem } from '../../../domain/entities/order-item.entity';
import { OrderEntity } from '../../../infrastructure/persistence/entities/order.entity';
import { OrderItemEntity } from '../../../infrastructure/persistence/entities/order-item.entity';
import { OrderStatus } from '../../../domain/value-objects/order-status.value-object';
import { Money } from '../../../domain/value-objects/money.value-object';
import { OrderNotFoundException } from '../../../domain/exceptions/domain.exceptions';

@Injectable()
export class TypeOrmOrderRepository implements OrderRepository {
  private readonly logger = new Logger(TypeOrmOrderRepository.name);

  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    @InjectRepository(OrderItemEntity)
    private readonly orderItemRepository: Repository<OrderItemEntity>,
  ) {}

  private toDomain(entity: OrderEntity): Order {
    const items = entity.items?.map(item => 
      new OrderItem(
        item.id,
        item.menuItemId,
        item.productName,
        item.quantity,
        new Money(Number(item.unitPrice)),
        item.createdAt
      )
    ) || [];

    return new Order(
      entity.id,
      entity.clientId,
      entity.restaurantId,
      items,
      new OrderStatus(entity.status),
      new Money(Number(entity.totalAmount)),
      entity.rejectionReason || '',
      entity.createdAt,
      entity.updatedAt,
    );
  }

  private toPersistence(domain: Order): {
    order: Partial<OrderEntity>;
    items: Partial<OrderItemEntity>[];
  } {
    const order: Partial<OrderEntity> = {
      id: domain.id,
      clientId: domain.clientId,
      restaurantId: domain.restaurantId,
      status: domain.status.value,
      totalAmount: domain.totalAmount.value,
      rejectionReason: domain.rejectionReason,
      createdAt: domain.createdAt,
      updatedAt: domain.updatedAt,
    };

    const items = domain.items.map(item => ({
      id: item.id,
      orderId: domain.id,
      menuItemId: item.menuItemId,
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice.value,
      createdAt: item.createdAt || new Date(),
    }));

    return { order, items };
  }

  async save(order: Order): Promise<Order> {
    try {
      const { order: orderData, items } = this.toPersistence(order);
      
      const savedOrder = await this.orderRepository.save(orderData as OrderEntity);
      
      if (items.length > 0) {
        const itemsToSave = items.map(item => ({
          ...item,
          orderId: savedOrder.id,
        }));
        await this.orderItemRepository.save(itemsToSave as OrderItemEntity[]);
      }
      
      const loadedOrder = await this.orderRepository.findOne({
        where: { id: savedOrder.id },
        relations: ['items'],
      });
      
      if (!loadedOrder) {
        throw new OrderNotFoundException(order.id);
      }
      
      this.logger.log(`Orden guardada con ID: ${savedOrder.id}`);
      return this.toDomain(loadedOrder);
    } catch (error) {
      this.logger.error(`Error al guardar orden: ${error.message}`);
      throw error;
    }
  }

  async update(id: string, order: Partial<Order>): Promise<Order> {
    try {
      await this.orderRepository.update(id, {
        status: order.status?.value,
        totalAmount: order.totalAmount?.value,
        rejectionReason: order.rejectionReason,
        updatedAt: new Date(),
      });

      const updated = await this.orderRepository.findOne({
        where: { id },
        relations: ['items'],
      });

      if (!updated) {
        throw new OrderNotFoundException(id);
      }

      this.logger.log(`Orden actualizada con ID: ${id}`);
      return this.toDomain(updated);
    } catch (error) {
      this.logger.error(`Error al actualizar orden ${id}: ${error.message}`);
      throw error;
    }
  }

  async findById(id: string): Promise<Order | null> {
    try {
      const entity = await this.orderRepository.findOne({
        where: { id },
        relations: ['items'],
      });
      return entity ? this.toDomain(entity) : null;
    } catch (error) {
      this.logger.error(`Error al buscar orden por ID ${id}: ${error.message}`);
      throw error;
    }
  }

  async findAll(
    page: number,
    limit: number,
    status?: string,
  ): Promise<{ items: Order[]; total: number }> {
    try {
      const queryBuilder = this.orderRepository
        .createQueryBuilder('order')
        .leftJoinAndSelect('order.items', 'items');

      if (status) {
        queryBuilder.andWhere('order.status = :status', { status });
      }

      const total = await queryBuilder.getCount();
      const entities = await queryBuilder
        .skip((page - 1) * limit)
        .take(limit)
        .orderBy('order.createdAt', 'DESC')
        .getMany();

      return {
        items: entities.map(entity => this.toDomain(entity)),
        total,
      };
    } catch (error) {
      this.logger.error(`Error en findAll: ${error.message}`);
      return { items: [], total: 0 };
    }
  }

  async findByRestaurantId(
    restaurantId: string,
    page: number,
    limit: number,
    status?: string,
  ): Promise<{ items: Order[]; total: number }> {
    try {
      const queryBuilder = this.orderRepository
        .createQueryBuilder('order')
        .leftJoinAndSelect('order.items', 'items')
        .where('order.restaurantId = :restaurantId', { restaurantId });

      if (status) {
        queryBuilder.andWhere('order.status = :status', { status });
      }

      const total = await queryBuilder.getCount();
      const entities = await queryBuilder
        .skip((page - 1) * limit)
        .take(limit)
        .orderBy('order.createdAt', 'DESC')
        .getMany();

      return {
        items: entities.map(entity => this.toDomain(entity)),
        total,
      };
    } catch (error) {
      this.logger.error(`Error en findByRestaurantId: ${error.message}`);
      return { items: [], total: 0 };
    }
  }

  async findByClientId(
    clientId: string,
    page: number,
    limit: number,
    status?: string,
  ): Promise<{ items: Order[]; total: number }> {
    try {
      const queryBuilder = this.orderRepository
        .createQueryBuilder('order')
        .leftJoinAndSelect('order.items', 'items')
        .where('order.clientId = :clientId', { clientId });

      if (status) {
        queryBuilder.andWhere('order.status = :status', { status });
      }

      const total = await queryBuilder.getCount();
      const entities = await queryBuilder
        .skip((page - 1) * limit)
        .take(limit)
        .orderBy('order.createdAt', 'DESC')
        .getMany();

      return {
        items: entities.map(entity => this.toDomain(entity)),
        total,
      };
    } catch (error) {
      this.logger.error(`Error en findByClientId: ${error.message}`);
      return { items: [], total: 0 };
    }
  }

  async exists(id: string): Promise<boolean> {
    try {
      const count = await this.orderRepository.count({ where: { id } });
      return count > 0;
    } catch (error) {
      this.logger.error(`Error al verificar existencia de orden ${id}: ${error.message}`);
      throw error;
    }
  }
}