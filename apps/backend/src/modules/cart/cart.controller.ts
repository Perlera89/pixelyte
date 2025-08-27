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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CartService } from './cart.service';
import {
  CreateCartDto,
  CreateCartLineItemDto,
  UpdateCartLineItemDto,
  AddToCartDto,
  UpdateCartItemDto,
  SyncCartDto,
} from './dto/cart.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('12. Carrito')
@ApiBearerAuth()
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('add-cart')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear un nuevo carrito',
    description: 'Crea un nuevo carrito para un usuario o sesión.',
  })
  @ApiBody({ type: CreateCartDto })
  @ApiResponse({ status: 201, description: 'Carrito creado exitosamente' })
  createCart(@Body() createCartDto: CreateCartDto) {
    return this.cartService.createCart(createCartDto);
  }

  @Get('find-cart')
  @ApiOperation({
    summary: 'Buscar un carrito',
    description: 'Busca un carrito por userId o sessionId.',
  })
  @ApiQuery({ name: 'userId', required: false, description: 'ID del usuario' })
  @ApiQuery({
    name: 'sessionId',
    required: false,
    description: 'ID de la sesión',
  })
  @ApiResponse({ status: 200, description: 'Carrito encontrado' })
  findCart(
    @Query('userId') userId?: string,
    @Query('sessionId') sessionId?: string,
  ) {
    return this.cartService.findCart(userId, sessionId);
  }

  @Get('find-cart-summary/:id')
  @ApiOperation({
    summary: 'Obtener resumen de un carrito',
    description: 'Devuelve el resumen de un carrito por su ID.',
  })
  @ApiParam({ name: 'id', description: 'ID del carrito' })
  @ApiResponse({
    status: 200,
    description: 'Resumen del carrito obtenido exitosamente',
  })
  getCartSummary(@Param('id') cartId: string) {
    return this.cartService.getCartSummary(cartId);
  }

  @Post('add-item/:id')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Agregar ítem al carrito',
    description: 'Agrega un ítem al carrito.',
  })
  @ApiParam({ name: 'id', description: 'ID del carrito' })
  @ApiBody({ type: CreateCartLineItemDto })
  @ApiResponse({ status: 201, description: 'Ítem agregado exitosamente' })
  addItemToCart(
    @Param('id') cartId: string,
    @Body() createLineItemDto: CreateCartLineItemDto,
  ) {
    return this.cartService.addItemToCart(cartId, createLineItemDto);
  }

  @Patch('update-item/:itemId')
  @ApiOperation({
    summary: 'Actualizar ítem del carrito',
    description: 'Actualiza un ítem del carrito.',
  })
  @ApiParam({ name: 'itemId', description: 'ID del ítem' })
  @ApiBody({ type: UpdateCartLineItemDto })
  @ApiResponse({ status: 200, description: 'Ítem actualizado exitosamente' })
  updateCartItem(
    @Param('itemId') itemId: string,
    @Body() updateLineItemDto: UpdateCartLineItemDto,
  ) {
    return this.cartService.updateCartItem(itemId, updateLineItemDto);
  }

  @Delete('delete-item/:itemId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar ítem del carrito',
    description: 'Elimina un ítem del carrito.',
  })
  @ApiParam({ name: 'itemId', description: 'ID del ítem' })
  @ApiResponse({ status: 204, description: 'Ítem eliminado exitosamente' })
  removeCartItem(@Param('itemId') itemId: string) {
    return this.cartService.removeCartItem(itemId);
  }

  @Delete('delete-cart/:id/clear')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Vaciar un carrito',
    description: 'Elimina todos los ítems de un carrito.',
  })
  @ApiParam({ name: 'id', description: 'ID del carrito' })
  @ApiResponse({ status: 204, description: 'Carrito vaciado exitosamente' })
  clearCart(@Param('id') cartId: string) {
    return this.cartService.clearCart(cartId);
  }

  @Delete('delete-expired-carts')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Eliminar carritos expirados',
    description: 'Elimina todos los carritos expirados.',
  })
  @ApiResponse({
    status: 200,
    description: 'Carritos expirados eliminados exitosamente',
  })
  cleanExpiredCarts() {
    return this.cartService.cleanExpiredCarts();
  }

  // ========== NEW USER-SPECIFIC CART ENDPOINTS ==========

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Obtener carrito del usuario autenticado',
    description: 'Obtiene el carrito persistente del usuario autenticado.',
  })
  @ApiResponse({ status: 200, description: 'Carrito obtenido exitosamente' })
  @ApiResponse({ status: 401, description: 'Usuario no autenticado' })
  getUserCart(@CurrentUser() user: any) {
    return this.cartService.getUserCart(user.id);
  }

  @Post('items')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Agregar item al carrito del usuario',
    description:
      'Agrega un item al carrito persistente del usuario autenticado.',
  })
  @ApiBody({ type: AddToCartDto })
  @ApiResponse({ status: 201, description: 'Item agregado exitosamente' })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o stock insuficiente',
  })
  @ApiResponse({ status: 401, description: 'Usuario no autenticado' })
  addItemToUserCart(
    @CurrentUser() user: any,
    @Body() addToCartDto: AddToCartDto,
  ) {
    return this.cartService.addItemToUserCart(user.id, addToCartDto);
  }

  @Patch('items/:itemId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Actualizar item del carrito del usuario',
    description: 'Actualiza la cantidad de un item en el carrito del usuario.',
  })
  @ApiParam({ name: 'itemId', description: 'ID del item del carrito' })
  @ApiBody({ type: UpdateCartItemDto })
  @ApiResponse({ status: 200, description: 'Item actualizado exitosamente' })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o stock insuficiente',
  })
  @ApiResponse({ status: 401, description: 'Usuario no autenticado' })
  @ApiResponse({ status: 404, description: 'Item no encontrado' })
  updateUserCartItem(
    @CurrentUser() user: any,
    @Param('itemId') itemId: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
    return this.cartService.updateUserCartItem(
      user.id,
      itemId,
      updateCartItemDto,
    );
  }

  @Delete('items/:itemId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar item del carrito del usuario',
    description: 'Elimina un item del carrito del usuario.',
  })
  @ApiParam({ name: 'itemId', description: 'ID del item del carrito' })
  @ApiResponse({ status: 204, description: 'Item eliminado exitosamente' })
  @ApiResponse({ status: 401, description: 'Usuario no autenticado' })
  @ApiResponse({ status: 404, description: 'Item no encontrado' })
  removeUserCartItem(
    @CurrentUser() user: any,
    @Param('itemId') itemId: string,
  ) {
    return this.cartService.removeUserCartItem(user.id, itemId);
  }

  @Delete('clear')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Vaciar carrito del usuario',
    description: 'Elimina todos los items del carrito del usuario.',
  })
  @ApiResponse({ status: 204, description: 'Carrito vaciado exitosamente' })
  @ApiResponse({ status: 401, description: 'Usuario no autenticado' })
  clearUserCart(@CurrentUser() user: any) {
    return this.cartService.clearUserCart(user.id);
  }

  @Post('sync')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Sincronizar carrito local con servidor',
    description:
      'Sincroniza el carrito local (localStorage) con el carrito persistente del usuario. Realiza merge inteligente de items.',
  })
  @ApiBody({ type: SyncCartDto })
  @ApiResponse({
    status: 200,
    description: 'Carrito sincronizado exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de sincronización inválidos',
  })
  @ApiResponse({ status: 401, description: 'Usuario no autenticado' })
  syncCart(@CurrentUser() user: any, @Body() syncCartDto: SyncCartDto) {
    return this.cartService.syncUserCart(user.id, syncCartDto);
  }
}
