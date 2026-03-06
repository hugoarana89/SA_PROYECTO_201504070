// ─────────────────────────────────────────────────────────────
// Infrastructure: TypeOrmDeliveryRepository
// LSP: Implementa completamente el contrato DeliveryRepository.
// SRP: Solo traduce entre la entidad TypeORM y el dominio.
// ─────────────────────────────────────────────────────────────

import { Injectable }        from '@nestjs/common';
import { InjectRepository }  from '@nestjs/typeorm';
import { Repository }        from 'typeorm';

import { Delivery, DeliveryProps, DeliveryStatus } from '../../../domain/entities/Delivery';
import {
  DeliveryRepository,
  FindByUserParams,
  PaginatedDeliveries,
} from '../../../domain/ports/DeliveryRepository';
import { DeliveryEntity } from '../entities/Deliveryentity';

@Injectable()
export class TypeOrmDeliveryRepository implements DeliveryRepository {
  constructor(
    @InjectRepository(DeliveryEntity)
    private readonly repo: Repository<DeliveryEntity>,
  ) {}

  // ── Mappers ───────────────────────────────────────────────

  private toDomain(entity: DeliveryEntity): Delivery {
    const props: DeliveryProps = {
      id:             entity.id,
      orderId:        entity.orderId,
      deliveryUserId: entity.deliveryUserId,
      status:         entity.status as DeliveryStatus,
      assignedAt:     entity.assignedAt,
      deliveredAt:    entity.deliveredAt,
      cancelReason:   entity.cancelReason,
      proofImageUrl:  entity.proofImageUrl,
    };
    return new Delivery(props);
  }

  private toEntity(delivery: Delivery): DeliveryEntity {
    const entity           = new DeliveryEntity();
    entity.id              = delivery.id;
    entity.orderId         = delivery.orderId;
    entity.deliveryUserId  = delivery.deliveryUserId;
    entity.status          = delivery.status;
    entity.assignedAt      = delivery.assignedAt;
    entity.deliveredAt     = delivery.deliveredAt;
    entity.cancelReason    = delivery.cancelReason;
    entity.proofImageUrl   = delivery.proofImageUrl;
    return entity;
  }

  // ── Métodos del contrato ──────────────────────────────────

  async save(delivery: Delivery): Promise<void> {
    await this.repo.save(this.toEntity(delivery));
  }

  async update(delivery: Delivery): Promise<void> {
    await this.repo.save(this.toEntity(delivery));
  }

  async findById(id: string): Promise<Delivery | null> {
    const entity = await this.repo.findOneBy({ id });
    return entity ? this.toDomain(entity) : null;
  }

  async findByOrderId(orderId: string): Promise<Delivery | null> {
    const entity = await this.repo.findOneBy({ orderId });
    return entity ? this.toDomain(entity) : null;
  }

  async findByUser(params: FindByUserParams): Promise<PaginatedDeliveries> {
    const { deliveryUserId, statusFilter, page, limit } = params;

    const qb = this.repo
      .createQueryBuilder('delivery')
      .where('delivery.deliveryUserId = :deliveryUserId', { deliveryUserId })
      .orderBy('delivery.assignedAt', 'DESC');

    if (statusFilter) {
      qb.andWhere('delivery.status = :status', { status: statusFilter });
    }

    const safePage  = Math.max(1, page);
    const safeLimit = Math.min(Math.max(1, limit), 100);
    qb.skip((safePage - 1) * safeLimit).take(safeLimit);

    const [entities, total] = await qb.getManyAndCount();

    return {
      deliveries: entities.map((e) => this.toDomain(e)),
      total,
      page:  safePage,
      limit: safeLimit,
    };
  }

  // Método adicional para listar todas las entregas (sin filtrar por usuario)
  async findAll(params: Omit<FindByUserParams, 'deliveryUserId'>): Promise<PaginatedDeliveries> {
    const { statusFilter, page, limit } = params;
    
    const qb = this.repo
      .createQueryBuilder('delivery')
      .orderBy('delivery.assignedAt', 'DESC');

    if (statusFilter) {
      qb.where('delivery.status = :status', { status: statusFilter });
    }

    const safePage  = Math.max(1, page);
    const safeLimit = Math.min(Math.max(1, limit), 100);
    qb.skip((safePage - 1) * safeLimit).take(safeLimit);
    
    const [entities, total] = await qb.getManyAndCount();
    
    return {
      deliveries: entities.map((e) => this.toDomain(e)),
      total,
      page:  safePage,
      limit: safeLimit,
    };
  }
}
