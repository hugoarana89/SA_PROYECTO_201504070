import {
  Controller, Get, Post, Put, Delete, Body, Param, Query,
  UseGuards, Request, HttpCode, HttpStatus, ParseUUIDPipe,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) { }

  // ==================== CLIENTE ====================

  /**
   * POST /orders - Crear una nueva orden (CLIENTE)
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CLIENTE)
  @HttpCode(HttpStatus.CREATED)
  async createOrder(@Body() body: any, @Request() req) {
    return this.orderService.createOrder(
      req.user.userId,
      body.restaurant_id,
      body.items,
    );
  }

  /**
   * PUT /orders/:id/cancel - Cancelar una orden (CLIENTE)
   */
  @Put(':id/cancel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CLIENTE)
  async cancelOrder(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    return this.orderService.cancelOrder(id, req.user.userId);
  }

  /**
   * GET /orders/client - Listar órdenes del cliente autenticado
   */
  @Get('client')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CLIENTE)
  async getMyOrders(
    @Request() req,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.orderService.listClientOrders(
      req.user.userId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      status,
    );
  }

  // ==================== RESTAURANTE ====================

  /**
   * PUT /orders/:id/reject - Rechazar una orden (RESTAURANTE)
   */
  @Put(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.RESTAURANTE)
  async rejectOrder(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { restaurant_id: string; reason?: string },
  ) {
    return this.orderService.rejectOrder(id, body.restaurant_id, body.reason);
  }

  /**
   * PUT /orders/:id/accept - Aceptar una orden (RESTAURANTE)
   */
  @Put(':id/accept')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.RESTAURANTE)
  async acceptOrder(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('restaurant_id') restaurantId: string,
  ) {
    return this.orderService.acceptOrder(id, restaurantId);
  }

    /**
   * PUT /orders/:id/ready - Marcar una orden como lista (RESTAURANTE)
   */
  @Put(':id/ready')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.RESTAURANTE)
  async readyOrder(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('restaurant_id') restaurantId: string,
  ) {
    return this.orderService.readyOrder(id, restaurantId);
  }

  /**
   * PUT /orders/:id/complete - Completar una orden (RESTAURANTE)
   */
  @Put(':id/complete')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.RESTAURANTE, Role.REPARTIDOR)
  async completeOrder(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('restaurant_id') restaurantId: string,
  ) {
    return this.orderService.completeOrder(id, restaurantId);
  }

  /**
   * GET /orders/restaurant/:restaurantId - Listar órdenes de un restaurante
   */
  @Get('restaurant/:restaurantId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.RESTAURANTE, Role.ADMINISTRADOR)
  async getRestaurantOrders(
    @Param('restaurantId', ParseUUIDPipe) restaurantId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.orderService.listRestaurantOrders(
      restaurantId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      status,
    );
  }

  // ==================== ADMINISTRADOR ====================

  /**
   * GET /orders - Listar todas las órdenes (ADMIN)
   */
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMINISTRADOR, Role.RESTAURANTE, Role.REPARTIDOR)
  async listAllOrders(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.orderService.listOrders(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      status,
    );
  }

  /**
   * GET /orders/:id - Obtener una orden por ID (ADMIN)
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMINISTRADOR, Role.RESTAURANTE, Role.CLIENTE, Role.REPARTIDOR)
  async getOrder(@Param('id', ParseUUIDPipe) id: string) {
    return this.orderService.getOrder(id);
  }

  // ==================== PÚBLICO / COMPARTIDO ====================

  /**
   * GET /orders/client/:clientId - Listar órdenes de un cliente específico (ADMIN)
   */
  @Get('client/:clientId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMINISTRADOR)
  async getClientOrders(
    @Param('clientId') clientId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.orderService.listClientOrders(
      clientId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      status,
    );
  }
}