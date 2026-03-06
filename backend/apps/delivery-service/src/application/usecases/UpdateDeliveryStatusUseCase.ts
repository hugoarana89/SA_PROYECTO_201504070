// ─────────────────────────────────────────────────────────────
// UseCase: UpdateDeliveryStatusUseCase
// SRP: Maneja exclusivamente la actualización de estado de entrega.
// DIP: Depende de la interfaz, no de la implementación concreta.
// OCP: Nuevos estados se agregan en la entidad sin tocar este caso.
// ─────────────────────────────────────────────────────────────

import { Inject, Injectable } from '@nestjs/common';

import { Delivery, DeliveryStatus }   from '../../domain/entities/Delivery';
import * as DeliveryRepository        from '../../domain/ports/DeliveryRepository';

export interface UpdateDeliveryStatusInput {
  deliveryId:     string;
  status:         DeliveryStatus;
  cancelReason?:  string;
  /** Imagen de prueba de entrega en base64. Obligatoria para status ENTREGADA. */
  proofImageUrl?: string;
}

@Injectable()
export class UpdateDeliveryStatusUseCase {
  constructor(
    @Inject(DeliveryRepository.DELIVERY_REPOSITORY)
    private readonly deliveryRepository: DeliveryRepository.DeliveryRepository,
  ) {}

  async execute(input: UpdateDeliveryStatusInput): Promise<Delivery> {

    const delivery = await this.deliveryRepository.findById(input.deliveryId);
    if (!delivery) {
      throw new Error(`Entrega con id '${input.deliveryId}' no encontrada.`);
    }

    switch (input.status) {
      case DeliveryStatus.ENTREGADA:
        // markAsDelivered valida que proofImageUrl no esté vacío
        delivery.markAsDelivered(input.proofImageUrl ?? '');
        break;

      case DeliveryStatus.CANCELADA:
        delivery.cancel(input.cancelReason ?? '');
        break;

      default:
        throw new Error(`Transición de estado '${input.status}' no permitida desde este caso de uso.`);
    }

    await this.deliveryRepository.update(delivery);
    return delivery;
  }
}
