import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiBody,
  ApiQuery,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderDto } from './dto/order.dto';
import {
  CreateTransactionDto,
  UpdateTransactionDto,
} from './dto/transaction.dto';
import { CheckoutDto, OrderSummaryDto } from './dto/checkout.dto';
import { PaginationOptions } from '../../common/utils/pagination.util';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('14. Órdenes')
@ApiBearerAuth()
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // ============= CHECKOUT ENDPOINTS =============

  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Procesar checkout y crear orden',
    description:
      'Crea una nueva orden desde el carrito del usuario con validación de stock y procesamiento de pago simulado.',
  })
  @ApiBody({ type: CheckoutDto })
  @ApiResponse({
    status: 201,
    description: 'Orden creada exitosamente',
    type: OrderSummaryDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de checkout inválidos o carrito vacío',
  })
  @ApiResponse({ status: 401, description: 'Usuario no autenticado' })
  async checkout(@CurrentUser() user: any, @Body() checkoutDto: CheckoutDto) {
    return this.ordersService.processCheckout(user.id, checkoutDto);
  }

  @Get('my-orders')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Obtener historial de órdenes del usuario',
    description: 'Devuelve todas las órdenes del usuario autenticado.',
  })
  @ApiQuery({ name: 'page', required: false, description: 'Número de página' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Elementos por página',
  })
  @ApiResponse({
    status: 200,
    description: 'Historial de órdenes obtenido exitosamente',
  })
  async getMyOrders(
    @CurrentUser() user: any,
    @Query() paginationOptions: PaginationOptions,
  ) {
    return this.ordersService.findOrdersByUser(user.id, paginationOptions);
  }

  @Get('my-orders/:id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Obtener detalles de una orden del usuario',
    description:
      'Devuelve los detalles completos de una orden específica del usuario.',
  })
  @ApiParam({ name: 'id', description: 'ID de la orden' })
  @ApiResponse({ status: 200, description: 'Detalles de la orden' })
  @ApiResponse({ status: 404, description: 'Orden no encontrada' })
  @ApiResponse({
    status: 403,
    description: 'No tienes permisos para ver esta orden',
  })
  async getMyOrder(@CurrentUser() user: any, @Param('id') id: string) {
    return this.ordersService.findUserOrder(user.id, id);
  }

  // ============= ADMIN ENDPOINTS =============

  @Post('add-order')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear una nueva orden',
    description: 'Crea una nueva orden para un usuario.',
  })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({ status: 201, description: 'Orden creada exitosamente' })
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @Get('get-all-orders')
  @ApiOperation({
    summary: 'Obtener lista de órdenes',
    description: 'Devuelve una lista paginada de órdenes.',
  })
  @ApiQuery({ name: 'page', required: false, description: 'Número de página' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Elementos por página',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de órdenes obtenida exitosamente',
  })
  findAll(@Query() paginationOptions: PaginationOptions) {
    return this.ordersService.findAll(paginationOptions);
  }

  @Get('get-order-stats')
  @ApiOperation({
    summary: 'Obtener estadísticas de órdenes',
    description: 'Devuelve estadísticas generales de órdenes.',
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas obtenidas exitosamente',
  })
  getOrderStats() {
    return this.ordersService.getOrderStats();
  }

  @Get('get-all-orders-by-status/:status')
  @ApiOperation({
    summary: 'Obtener órdenes por estado',
    description: 'Devuelve una lista de órdenes filtradas por estado.',
  })
  @ApiParam({ name: 'status', description: 'Estado de la orden' })
  @ApiQuery({ name: 'page', required: false, description: 'Número de página' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Elementos por página',
  })
  @ApiResponse({ status: 200, description: 'Órdenes obtenidas exitosamente' })
  findOrdersByStatus(
    @Param('status') status: string,
    @Query() paginationOptions: PaginationOptions,
  ) {
    return this.ordersService.findOrdersByStatus(status, paginationOptions);
  }

  @Get('get-all-orders-by-user/:userId')
  @ApiOperation({
    summary: 'Obtener órdenes de un usuario',
    description: 'Devuelve todas las órdenes de un usuario.',
  })
  @ApiParam({ name: 'userId', description: 'ID del usuario' })
  @ApiQuery({ name: 'page', required: false, description: 'Número de página' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Elementos por página',
  })
  @ApiResponse({ status: 200, description: 'Órdenes obtenidas exitosamente' })
  findOrdersByUser(
    @Param('userId') userId: string,
    @Query() paginationOptions: PaginationOptions,
  ) {
    return this.ordersService.findOrdersByUser(userId, paginationOptions);
  }

  @Get('find-order/:id')
  @ApiOperation({
    summary: 'Obtener una orden por ID',
    description: 'Devuelve los datos de una orden por su ID.',
  })
  @ApiParam({ name: 'id', description: 'ID de la orden' })
  @ApiResponse({ status: 200, description: 'Orden encontrada' })
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch('update-order/:id')
  @ApiOperation({
    summary: 'Actualizar una orden',
    description: 'Actualiza los datos de una orden.',
  })
  @ApiParam({ name: 'id', description: 'ID de la orden' })
  @ApiBody({ type: UpdateOrderDto })
  @ApiResponse({ status: 200, description: 'Orden actualizada exitosamente' })
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(id, updateOrderDto);
  }

  @Patch('cancel-order/:id')
  @ApiOperation({
    summary: 'Cancelar una orden',
    description: 'Cancela una orden por su ID.',
  })
  @ApiParam({ name: 'id', description: 'ID de la orden' })
  @ApiResponse({ status: 200, description: 'Orden cancelada exitosamente' })
  cancelOrder(@Param('id') id: string) {
    return this.ordersService.cancelOrder(id);
  }

  @Delete('delete-order/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar (lógico) una orden',
    description: 'Elimina lógicamente una orden.',
  })
  @ApiParam({ name: 'id', description: 'ID de la orden' })
  @ApiResponse({ status: 204, description: 'Orden eliminada exitosamente' })
  remove(@Param('id') id: string) {
    return this.ordersService.remove(id);
  }

  // =============  TRANSACCIONES  =============
  @Post('transactions')
  @HttpCode(HttpStatus.CREATED)
  createTransaction(@Body() createTransactionDto: CreateTransactionDto) {
    return this.ordersService.createTransaction(createTransactionDto);
  }

  @Get(':id/transactions')
  findTransactionsByOrder(@Param('id') orderId: string) {
    return this.ordersService.findTransactionsByOrder(orderId);
  }

  @Patch('transactions/:id')
  updateTransaction(
    @Param('id') id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
  ) {
    return this.ordersService.updateTransaction(id, updateTransactionDto);
  }
}
