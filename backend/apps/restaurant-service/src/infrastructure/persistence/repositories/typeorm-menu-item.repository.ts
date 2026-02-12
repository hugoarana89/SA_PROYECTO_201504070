import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { MenuItemRepository } from '../../../domain/ports/menu-item.repository.interface';
import { MenuItem } from '../../../domain/entities/menu-item.entity';
import { MenuItemEntity } from '../entities/menu-item.entity';
import { Price } from '../../../domain/value-objects/price.value-object';

@Injectable()
export class TypeOrmMenuItemRepository implements MenuItemRepository {
  constructor(
    @InjectRepository(MenuItemEntity)
    private readonly repository: Repository<MenuItemEntity>,
  ) {}

  private toDomain(entity: MenuItemEntity): MenuItem {
    return new MenuItem(
      entity.id,
      entity.restaurantId,
      entity.name,
      entity.description || '',
      new Price(Number(entity.price)),
      entity.imageUrl || '',
      entity.isAvailable,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  private toPersistence(domain: MenuItem): Partial<MenuItemEntity> {
    return {
      id: domain.id,
      restaurantId: domain.restaurantId,
      name: domain.name,
      description: domain.description,
      price: domain.price.value,
      imageUrl: domain.imageUrl,
      isAvailable: domain.isAvailable,
      createdAt: domain.createdAt,
      updatedAt: domain.updatedAt,
    };
  }

  async save(menuItem: MenuItem): Promise<MenuItem> {
    const entity = this.toPersistence(menuItem);
    const saved = await this.repository.save(entity as MenuItemEntity);
    return this.toDomain(saved);
  }

  async update(id: string, menuItem: Partial<MenuItem>): Promise<MenuItem> {
    await this.repository.update(id, this.toPersistence(menuItem as MenuItem));
    const updated = await this.repository.findOne({ where: { id } });
    if (!updated) {
      throw new Error(`MenuItem with id ${id} not found after update`);
    }
    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async findById(id: string): Promise<MenuItem | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByRestaurantId(
    restaurantId: string,
    onlyAvailable?: boolean,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ items: MenuItem[]; total: number }> {
    const where: any = { restaurantId };
    
    if (onlyAvailable !== undefined) {
      where.isAvailable = onlyAvailable;
    }

    const [entities, total] = await this.repository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { name: 'ASC' },
    });

    return {
      items: entities.map(entity => this.toDomain(entity)),
      total,
    };
  }

  async findByIdsAndRestaurant(ids: string[], restaurantId: string): Promise<MenuItem[]> {
    const entities = await this.repository.find({
      where: {
        id: In(ids),
        restaurantId,
      },
    });
    return entities.map(entity => this.toDomain(entity));
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.repository.count({ where: { id } });
    return count > 0;
  }
}