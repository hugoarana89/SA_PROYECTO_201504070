import { 
  Controller, Get, Post, Put, Delete, Body, Param, Query, 
  UseGuards, Request 
} from '@nestjs/common';
import { RestaurantService } from './restaurant.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('restaurants')
export class RestaurantController {
  constructor(private readonly restaurantService: RestaurantService) {}

  // ==================== RESTAURANTES ====================
  
  /**
   * POST /restaurants/:ownerId - Crear un nuevo restaurante (ADMINISTRADOR)
   */
  @Post(':ownerId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMINISTRADOR)
  async createRestaurant(@Body() body: any, /*@Request() req,*/ @Param('ownerId') ownerId: string) {
    return this.restaurantService.createRestaurant(body, ownerId);
  }

  /**
   * PUT /restaurants/:id - Actualizar un restaurante (ADMINISTRADOR)
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMINISTRADOR)
  async updateRestaurant(
    @Param('id') id: string,
    @Body() body: any,
    @Request() req,
  ) {
    return this.restaurantService.updateRestaurant(id, body, req.user.userId);
  }

  /**
   * DELETE /restaurants/:id - Eliminar un restaurante (ADMINISTRADOR)
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMINISTRADOR)
  async deleteRestaurant(@Param('id') id: string, @Request() req) {
    return this.restaurantService.deleteRestaurant(id, req.user.userId);
  }

  /**
   * GET /restaurants/:id - Obtener un restaurante por ID
   */
  @Get('all/:id')
  async getRestaurant(@Param('id') id: string) {
    return this.restaurantService.getRestaurant(id);
  }

  /**
   * GET /restaurants - Listar restaurantes con paginación, búsqueda y filtro por estado
   * Query params: page, limit, onlyActive, search
   */
  @Get()
  async listRestaurants(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('onlyActive') onlyActive?: string,
    @Query('search') search?: string,
  ) {
    return this.restaurantService.listRestaurants(
      parseInt(page),
      parseInt(limit),
      onlyActive === 'true',
      search,
    );
  }

   /**
   * GET /restaurants/owner - Listar restaurantes de un propietario (RESTAURANTE)
   */
  @Get('owner')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.RESTAURANTE)
  async listRestaurantsByOwner(@Request() req) {
    return this.restaurantService.listRestaurantsByOwner(req.user.userId);
  }


  // ==================== MENÚ ====================
  
  /**
   * POST /restaurants/:restaurantId/menu-items - Crear un nuevo ítem de menú para un restaurante (RESTAURANTE, ADMINISTRADOR)
   */
  @Post(':restaurantId/menu-items')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.RESTAURANTE, Role.ADMINISTRADOR)
  async createMenuItem(
    @Param('restaurantId') restaurantId: string,
    @Body() body: any,
  ) {
    return this.restaurantService.createMenuItem({
      restaurant_id: restaurantId,
      ...body,
    });
  }

  /**
   * PUT /restaurants/:restaurantId/menu-items/:id - Actualizar un ítem de menú (RESTAURANTE, ADMINISTRADOR)
   */
  @Put('menu-items/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.RESTAURANTE, Role.ADMINISTRADOR)
  async updateMenuItem(
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.restaurantService.updateMenuItem(id, body);
  }

  /**
   * DELETE /restaurants/:restaurantId/menu-items/:id - Eliminar un ítem de menú (RESTAURANTE, ADMINISTRADOR)
   */ 
  @Delete('menu-items/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.RESTAURANTE, Role.ADMINISTRADOR)
  async deleteMenuItem(
    @Param('id') id: string,
    @Body('restaurantId') restaurantId: string,
  ) {
    return this.restaurantService.deleteMenuItem(id, restaurantId);
  }

  /**
   * GET /restaurants/:restaurantId/menu-items/:id - Obtener un ítem de menú por ID
   */
  @Get(':restaurantId/menu')
  async getRestaurantMenu(@Param('restaurantId') restaurantId: string) {
    return this.restaurantService.getRestaurantMenu(restaurantId);
  }

  /**
   * GET /restaurants/:restaurantId/menu-items - Listar ítems de menú de un restaurante con paginación y filtro por disponibilidad
   * Query params: onlyAvailable, page, limit
   * Si onlyAvailable=true, solo devuelve los ítems que están disponibles (is_available=true)
   * Si no se especifica onlyAvailable, devuelve todos los ítems del menú
   */
  @Get(':restaurantId/menu-items')
  async listMenuItems(
    @Param('restaurantId') restaurantId: string,
    @Query('onlyAvailable') onlyAvailable?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.restaurantService.listMenuItems(
      restaurantId,
      onlyAvailable === 'true',
      page ? parseInt(page) : undefined,
      limit ? parseInt(limit) : undefined,
    );
  }
}