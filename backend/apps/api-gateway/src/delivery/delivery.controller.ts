// ─────────────────────────────────────────────────────────────
// Presentation: delivery.controller.ts (API Gateway)
// SRP: Solo traduce HTTP ↔ DeliveryService. Sin lógica de negocio.
// Todos los endpoints requieren rol REPARTIDOR.
// ─────────────────────────────────────────────────────────────

import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

import { DeliveryService } from './delivery.service';
import { JwtAuthGuard }    from '../common/guards/jwt-auth.guard';
import { RolesGuard }      from '../common/guards/roles.guard';
import { Roles }           from '../common/decorators/roles.decorator';
import { Role }            from '../common/enums/role.enum';
import * as deliveryGrpcInterface from './grpc/delivery.grpc.interface';

@Controller('delivery')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.REPARTIDOR, Role.ADMINISTRADOR)
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}

  // ── GET /delivery ─────────────────────────────────────────
  /**
   * Lista las entregas del repartidor autenticado.
   * Query params:
   *   status  → "EN_CAMINO" | "ENTREGADA" | "CANCELADA" | (omitir = todas)
   *   page    → número de página (default: 1)
   *   limit   → resultados por página (default: 10)
   */
  @Get()
  async listDeliveries(
    @Request() req,
    @Query('status') statusFilter?: deliveryGrpcInterface.DeliveryStatusFilter,
    @Query('page')   page: string = '1',
    @Query('limit')  limit: string = '10',
  ) {
    return this.deliveryService.listDeliveries(
      req.user.userId,
      statusFilter,
      parseInt(page),
      parseInt(limit),
    );
  }

  // GET todos los pedidos de la tabla deliveries
  @Get('all')
  async listAllDeliveries(
    @Query('status') statusFilter?: deliveryGrpcInterface.DeliveryStatusFilter,
    @Query('page')   page: string = '1',
    @Query('limit')  limit: string = '10',
  ) {
    return this.deliveryService.listAllDeliveries(
      statusFilter,
      parseInt(page),
      parseInt(limit),
    );
  }

  // ── POST /delivery/orders/:orderId/accept ─────────────────
  /**
   * El repartidor acepta una orden marcada como LISTA.
   * El delivery_user_id se extrae del JWT para evitar suplantación.
   */
  @Post('orders/:orderId/accept')
  @HttpCode(HttpStatus.OK)
  async acceptOrder(
    @Param('orderId') orderId: string,
    @Request() req,
  ) {
    return this.deliveryService.acceptOrder({
      order_id:         orderId,
      delivery_user_id: req.user.userId,
    });
  }

  // ── PATCH /delivery/:deliveryId/status ────────────────────
  /**
   * El repartidor actualiza el estado de su entrega.
   * Body: {
   *   status: "ENTREGADA" | "CANCELADA",
   *   cancel_reason?: string,
   *   proof_image_url?: string  ← obligatorio cuando status = "ENTREGADA"
   * }
   */
  @Patch(':deliveryId/status')
  async updateDeliveryStatus(
    @Param('deliveryId') deliveryId: string,
    @Body() body: {
      status:           deliveryGrpcInterface.DeliveryStatus;
      cancel_reason?:   string;
      proof_image_url?: string;
    },
    @Request() req,
  ) {
    console.log("imprimiendo");
    console.log(body.proof_image_url);
    return this.deliveryService.updateDeliveryStatus({
      delivery_id:    deliveryId,
      status:         body.status,
      cancel_reason:  body.cancel_reason  ?? '',
      proof_image_url: body.proof_image_url ?? '',
    });
  }

  // ── GET /delivery/:deliveryId ─────────────────────────────
  /**
   * Consulta el detalle de una entrega por su ID.
   */
  @Get(':deliveryId')
  async getDelivery(@Param('deliveryId') deliveryId: string) {
    return this.deliveryService.getDelivery({ delivery_id: deliveryId });
  }
}
