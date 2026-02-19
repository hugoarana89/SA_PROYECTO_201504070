// ─────────────────────────────────────────────────────────────
// UseCase: AcceptOrderUseCase
// SRP: Un caso de uso = una acción del sistema.
// DIP: Depende de la interfaz DeliveryRepository, no de MySQL.
// ─────────────────────────────────────────────────────────────

import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 }       from 'uuid';

import { Delivery } from '../../domain/entities/Delivery';
import * as deliveryRepository from '../../domain/ports/DeliveryRepository';

export interface AcceptOrderInput {
  orderId:        string;
  deliveryUserId: string;
}

@Injectable()
export class AcceptOrderUseCase {
  constructor(
    @Inject(deliveryRepository.DELIVERY_REPOSITORY)
    private readonly deliveryRepository: deliveryRepository.DeliveryRepository,
  ) {}

  async execute(input: AcceptOrderInput): Promise<Delivery> {
    // Validación: una orden no puede ser aceptada dos veces
    const existing = await this.deliveryRepository.findByOrderId(input.orderId);
    if (existing) {
      throw new Error(`La orden '${input.orderId}' ya fue aceptada por un repartidor.`);
    }

    // Crear la entrega en estado ASIGNADA y pasar inmediatamente a EN_CAMINO
    const delivery = Delivery.create(input.orderId, input.deliveryUserId, uuidv4());
    delivery.startDelivery();

    await this.deliveryRepository.save(delivery);
    return delivery;
  }
}
