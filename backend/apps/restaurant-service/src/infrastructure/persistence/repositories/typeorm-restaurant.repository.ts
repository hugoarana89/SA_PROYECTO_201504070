import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { RestaurantRepository } from '../../../domain/ports/restaurant.repository.interface';
import { Restaurant } from '../../../domain/entities/restaurant.entity';
import { RestaurantEntity } from '../entities/restaurant.entity';
import { Address } from '../../../domain/value-objects/address.value-object';
import { Time } from '../../../domain/value-objects/time.value-object';

@Injectable()
export class TypeOrmRestaurantRepository implements RestaurantRepository {
  private readonly logger = new Logger(TypeOrmRestaurantRepository.name);

  constructor(
    @InjectRepository(RestaurantEntity)
    private readonly repository: Repository<RestaurantEntity>,
  ) { }

  private toDomain(entity: RestaurantEntity): Restaurant {
    // Ya no necesitas try-catch porque Time maneja cualquier formato
    return new Restaurant(
      entity.id,
      entity.ownerId,
      entity.name,
      entity.description || '',
      new Address(entity.address),
      entity.phone || '',
      new Time(entity.openingTime),
      new Time(entity.closingTime),
      entity.isActive,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  private toPersistence(domain: Restaurant): Partial<RestaurantEntity> {
    return {
      id: domain.id,
      ownerId: domain.ownerId,
      name: domain.name,
      description: domain.description,
      address: domain.address.toString(),
      phone: domain.phone,
      openingTime: domain.openingTime.toString(),
      closingTime: domain.closingTime.toString(),
      isActive: domain.isActive,
      createdAt: domain.createdAt,
      updatedAt: domain.updatedAt,
    };
  }

  async save(restaurant: Restaurant): Promise<Restaurant> {
    try {
      const entity = this.toPersistence(restaurant);
      const saved = await this.repository.save(entity as RestaurantEntity);
      this.logger.log(`Restaurante guardado con ID: ${saved.id}`);
      return this.toDomain(saved);
    } catch (error) {
      this.logger.error(`Error al guardar restaurante: ${error.message}`);
      throw error;
    }
  }

  async update(id: string, restaurant: Partial<Restaurant>): Promise<Restaurant> {
    try {
      await this.repository.update(id, this.toPersistence(restaurant as Restaurant));
      const updated = await this.repository.findOne({ where: { id } });

      if (!updated) {
        throw new Error(`Restaurante con id ${id} no encontrado`);
      }

      this.logger.log(`Restaurante actualizado con ID: ${id}`);
      return this.toDomain(updated);
    } catch (error) {
      this.logger.error(`Error al actualizar restaurante ${id}: ${error.message}`);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.repository.delete(id);
      this.logger.log(`Restaurante eliminado con ID: ${id}`);
    } catch (error) {
      this.logger.error(`Error al eliminar restaurante ${id}: ${error.message}`);
      throw error;
    }
  }

  async findById(id: string): Promise<Restaurant | null> {
    try {
      const entity = await this.repository.findOne({ where: { id } });
      return entity ? this.toDomain(entity) : null;
    } catch (error) {
      this.logger.error(`Error al buscar restaurante por ID ${id}: ${error.message}`);
      throw error;
    }
  }

  async findByOwnerId(ownerId: string): Promise<Restaurant[]> {
    try {
      const entities = await this.repository.find({
        where: { ownerId },
        order: { createdAt: 'DESC' }
      });
      return entities.map(entity => this.toDomain(entity));
    } catch (error) {
      this.logger.error(`Error al buscar restaurantes por ownerId ${ownerId}: ${error.message}`);
      throw error;
    }
  }

  async findAll(
    page: number,
    limit: number,
    onlyActive?: boolean,
    search?: string,
  ): Promise<{ items: Restaurant[]; total: number }> {
    try {
      this.logger.debug(`findAll: page=${page}, limit=${limit}, onlyActive=${onlyActive}, search=${search}`);

      // Usar QueryBuilder para más control
      const queryBuilder = this.repository.createQueryBuilder('restaurant');

      // Aplicar filtro de activo
      if (onlyActive !== undefined) {
        queryBuilder.andWhere('restaurant.isActive = :isActive', { isActive: onlyActive });
      }

      // Aplicar búsqueda por nombre
      if (search) {
        queryBuilder.andWhere('restaurant.name LIKE :search', { search: `%${search}%` });
      }

      // Obtener total antes de paginar
      const total = await queryBuilder.getCount();

      // Aplicar paginación y orden
      const entities = await queryBuilder
        .skip((page - 1) * limit)
        .take(limit)
        .orderBy('restaurant.createdAt', 'DESC')
        .getMany();

      this.logger.debug(`Encontrados ${entities.length} de ${total} restaurantes`);

      // Mapeo seguro con manejo individual de errores
      const items: Restaurant[] = [];

      for (const entity of entities) {
        try {
          const restaurant = this.toDomain(entity);
          items.push(restaurant);
        } catch (error) {
          this.logger.error(`Error al mapear restaurante ${entity.id}: ${error.message}`);
          // Intentar crear con valores por defecto
          items.push(this.createDefaultRestaurant(entity));
        }
      }

      return { items, total };
    } catch (error) {
      this.logger.error(`Error en findAll: ${error.message}`);
      // En caso de error, devolver array vacío pero no fallar
      return { items: [], total: 0 };
    }
  }

  async exists(id: string): Promise<boolean> {
    try {
      const count = await this.repository.count({ where: { id } });
      return count > 0;
    } catch (error) {
      this.logger.error(`Error al verificar existencia de restaurante ${id}: ${error.message}`);
      throw error;
    }
  }

  // Método auxiliar para crear restaurante con valores por defecto cuando hay errores
  private createDefaultRestaurant(entity: RestaurantEntity): Restaurant {
    try {
      return new Restaurant(
        entity.id,
        entity.ownerId,
        entity.name,
        entity.description || '',
        new Address(entity.address),
        entity.phone || '',
        new Time('08:00'), // Horario por defecto
        new Time('22:00'), // Horario por defecto
        entity.isActive,
        entity.createdAt,
        entity.updatedAt,
      );
    } catch (error) {
      this.logger.error(`Error crítico al crear restaurante por defecto ${entity.id}: ${error.message}`);
      // Último recurso - crear con valores hardcodeados
      throw error;
    }
  }
}