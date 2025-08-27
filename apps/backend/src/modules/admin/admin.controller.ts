import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  DashboardMetricsDto,
  SalesChartDataDto,
  CreateProductDto,
  UpdateProductDto,
  UpdateOrderStatusDto,
  UpdateUserStatusDto,
  CreateCategoryDto,
  UpdateCategoryDto,
  CreateBrandDto,
  UpdateBrandDto,
  AdminProductsQueryDto,
  AdminOrdersQueryDto,
  AdminUsersQueryDto,
} from './dto/admin.dto';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // Dashboard Endpoints
  @Get('dashboard/metrics')
  @ApiOperation({ summary: 'Obtener métricas del dashboard' })
  @ApiResponse({
    status: 200,
    description: 'Métricas obtenidas exitosamente',
    type: DashboardMetricsDto,
  })
  async getDashboardMetrics(): Promise<DashboardMetricsDto> {
    return this.adminService.getDashboardMetrics();
  }

  @Get('dashboard/sales-chart')
  @ApiOperation({ summary: 'Obtener datos del gráfico de ventas' })
  @ApiResponse({
    status: 200,
    description: 'Datos del gráfico obtenidos exitosamente',
    type: [SalesChartDataDto],
  })
  async getSalesChartData(
    @Query('days') days?: string,
  ): Promise<SalesChartDataDto[]> {
    const daysNumber = days ? parseInt(days, 10) : 30;
    return this.adminService.getSalesChartData(daysNumber);
  }

  // Product Management Endpoints
  @Get('products')
  @ApiOperation({ summary: 'Obtener lista de productos para administración' })
  @ApiResponse({
    status: 200,
    description: 'Lista de productos obtenida exitosamente',
  })
  async getProducts(@Query() query: AdminProductsQueryDto) {
    return this.adminService.getProducts(query);
  }

  @Post('products')
  @ApiOperation({ summary: 'Crear nuevo producto' })
  @ApiResponse({
    status: 201,
    description: 'Producto creado exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o SKU/slug duplicado',
  })
  async createProduct(@Body() createProductDto: CreateProductDto) {
    return this.adminService.createProduct(createProductDto);
  }

  @Put('products/:id')
  @ApiOperation({ summary: 'Actualizar producto existente' })
  @ApiResponse({
    status: 200,
    description: 'Producto actualizado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Producto no encontrado',
  })
  async updateProduct(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.adminService.updateProduct(id, updateProductDto);
  }

  @Delete('products/:id')
  @ApiOperation({ summary: 'Eliminar producto' })
  @ApiResponse({
    status: 200,
    description: 'Producto eliminado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Producto no encontrado',
  })
  @ApiResponse({
    status: 400,
    description:
      'No se puede eliminar el producto porque tiene órdenes asociadas',
  })
  @HttpCode(HttpStatus.OK)
  async deleteProduct(@Param('id') id: string) {
    return this.adminService.deleteProduct(id);
  }

  // Order Management Endpoints
  @Get('orders')
  @ApiOperation({ summary: 'Obtener lista de órdenes para administración' })
  @ApiResponse({
    status: 200,
    description: 'Lista de órdenes obtenida exitosamente',
  })
  async getOrders(@Query() query: AdminOrdersQueryDto) {
    return this.adminService.getOrders(query);
  }

  @Get('orders/:id')
  @ApiOperation({ summary: 'Obtener detalles de una orden específica' })
  @ApiResponse({
    status: 200,
    description: 'Detalles de la orden obtenidos exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Orden no encontrada',
  })
  async getOrder(@Param('id') id: string) {
    return this.adminService.getOrder(id);
  }

  @Put('orders/:id/status')
  @ApiOperation({ summary: 'Actualizar estado de una orden' })
  @ApiResponse({
    status: 200,
    description: 'Estado de la orden actualizado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Orden no encontrada',
  })
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    return this.adminService.updateOrderStatus(id, updateOrderStatusDto);
  }

  // User Management Endpoints
  @Get('users')
  @ApiOperation({ summary: 'Obtener lista de usuarios para administración' })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuarios obtenida exitosamente',
  })
  async getUsers(@Query() query: AdminUsersQueryDto) {
    return this.adminService.getUsers(query);
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Obtener detalles de un usuario específico' })
  @ApiResponse({
    status: 200,
    description: 'Detalles del usuario obtenidos exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })
  async getUser(@Param('id') id: string) {
    return this.adminService.getUser(id);
  }

  @Put('users/:id/status')
  @ApiOperation({ summary: 'Activar o desactivar usuario' })
  @ApiResponse({
    status: 200,
    description: 'Estado del usuario actualizado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })
  async updateUserStatus(
    @Param('id') id: string,
    @Body() updateUserStatusDto: UpdateUserStatusDto,
  ) {
    return this.adminService.updateUserStatus(id, updateUserStatusDto);
  }

  // Category Management Endpoints
  @Get('categories')
  @ApiOperation({ summary: 'Obtener lista de categorías para administración' })
  @ApiResponse({
    status: 200,
    description: 'Lista de categorías obtenida exitosamente',
  })
  async getCategories() {
    return this.adminService.getCategories();
  }

  @Post('categories')
  @ApiOperation({ summary: 'Crear nueva categoría' })
  @ApiResponse({
    status: 201,
    description: 'Categoría creada exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o slug duplicado',
  })
  async createCategory(@Body() createCategoryDto: CreateCategoryDto) {
    return this.adminService.createCategory(createCategoryDto);
  }

  @Put('categories/:id')
  @ApiOperation({ summary: 'Actualizar categoría existente' })
  @ApiResponse({
    status: 200,
    description: 'Categoría actualizada exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Categoría no encontrada',
  })
  async updateCategory(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.adminService.updateCategory(id, updateCategoryDto);
  }

  @Delete('categories/:id')
  @ApiOperation({ summary: 'Eliminar categoría' })
  @ApiResponse({
    status: 200,
    description: 'Categoría eliminada exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Categoría no encontrada',
  })
  @ApiResponse({
    status: 400,
    description:
      'No se puede eliminar la categoría porque tiene productos o subcategorías',
  })
  @HttpCode(HttpStatus.OK)
  async deleteCategory(@Param('id') id: string) {
    return this.adminService.deleteCategory(id);
  }

  // Brand Management Endpoints
  @Get('brands')
  @ApiOperation({ summary: 'Obtener lista de marcas para administración' })
  @ApiResponse({
    status: 200,
    description: 'Lista de marcas obtenida exitosamente',
  })
  async getBrands() {
    return this.adminService.getBrands();
  }

  @Post('brands')
  @ApiOperation({ summary: 'Crear nueva marca' })
  @ApiResponse({
    status: 201,
    description: 'Marca creada exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o nombre/slug duplicado',
  })
  async createBrand(@Body() createBrandDto: CreateBrandDto) {
    return this.adminService.createBrand(createBrandDto);
  }

  @Put('brands/:id')
  @ApiOperation({ summary: 'Actualizar marca existente' })
  @ApiResponse({
    status: 200,
    description: 'Marca actualizada exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Marca no encontrada',
  })
  async updateBrand(
    @Param('id') id: string,
    @Body() updateBrandDto: UpdateBrandDto,
  ) {
    return this.adminService.updateBrand(id, updateBrandDto);
  }

  @Delete('brands/:id')
  @ApiOperation({ summary: 'Eliminar marca' })
  @ApiResponse({
    status: 200,
    description: 'Marca eliminada exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Marca no encontrada',
  })
  @ApiResponse({
    status: 400,
    description:
      'No se puede eliminar la marca porque tiene productos asociados',
  })
  @HttpCode(HttpStatus.OK)
  async deleteBrand(@Param('id') id: string) {
    return this.adminService.deleteBrand(id);
  }
}
