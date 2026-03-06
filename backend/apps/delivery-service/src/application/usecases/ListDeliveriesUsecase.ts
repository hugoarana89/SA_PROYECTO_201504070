// ─────────────────────────────────────────────────────────────
// UseCase: ListDeliveriesUseCase
// SRP: Un caso de uso = una acción: listar entregas de un repartidor.
// DIP: Depende del port DeliveryRepository, no de TypeORM.
// ─────────────────────────────────────────────────────────────

import { Inject, Injectable } from '@nestjs/common';

import { DeliveryStatus }    from '../../domain/entities/Delivery';
import * as DeliveryRepositoryPort from '../../domain/ports/DeliveryRepository';

export interface ListDeliveriesInput {
  deliveryUserId: string;
  statusFilter?:  DeliveryStatus; // undefined = traer todas
  page:           number;
  limit:          number;
}

@Injectable()
export class ListDeliveriesUseCase {
  constructor(
    @Inject(DeliveryRepositoryPort.DELIVERY_REPOSITORY)
    private readonly deliveryRepository: DeliveryRepositoryPort.DeliveryRepository,
  ) {}

  async execute(input: ListDeliveriesInput): Promise<DeliveryRepositoryPort.PaginatedDeliveries> {
    return this.deliveryRepository.findByUser({
      deliveryUserId: input.deliveryUserId,
      statusFilter:   input.statusFilter,
      page:           input.page,
      limit:          input.limit,
    });
  }

  async executeAll(input: Omit<ListDeliveriesInput, 'deliveryUserId'>): Promise<DeliveryRepositoryPort.PaginatedDeliveries> {
    return this.deliveryRepository.findAll({
      statusFilter: input.statusFilter,
      page:        input.page,
      limit:       input.limit,
    });
  }
}