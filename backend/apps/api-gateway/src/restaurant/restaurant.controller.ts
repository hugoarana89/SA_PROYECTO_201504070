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
  
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMINISTRADOR)
  async createRestaurant(@Body() body: any, @Request() req) {
    return this.restaurantService.createRestaurant(body, req.user.userId);
  }

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

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMINISTRADOR)
  async deleteRestaurant(@Param('id') id: string, @Request() req) {
    return this.restaurantService.deleteRestaurant(id, req.user.userId);
  }

  @Get(':id')
  async getRestaurant(@Param('id') id: string) {
    return this.restaurantService.getRestaurant(id);
  }

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

  // ==================== MENÚ ====================
  
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

  @Put('menu-items/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.RESTAURANTE, Role.ADMINISTRADOR)
  async updateMenuItem(
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.restaurantService.updateMenuItem(id, body);
  }

  @Delete('menu-items/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.RESTAURANTE, Role.ADMINISTRADOR)
  async deleteMenuItem(
    @Param('id') id: string,
    @Body('restaurantId') restaurantId: string,
  ) {
    return this.restaurantService.deleteMenuItem(id, restaurantId);
  }

  @Get(':restaurantId/menu')
  async getRestaurantMenu(@Param('restaurantId') restaurantId: string) {
    return this.restaurantService.getRestaurantMenu(restaurantId);
  }

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