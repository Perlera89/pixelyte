import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiBody,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { WishlistService } from './wishlist.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  AddToWishlistDto,
  SyncWishlistDto,
  RemoveFromWishlistDto,
} from './dto/wishlist.dto';

@ApiTags('12. Wishlist')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Post('items')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Agregar producto a la wishlist',
    description: 'Agrega un producto a la wishlist del usuario.',
  })
  @ApiBody({ type: AddToWishlistDto })
  @ApiResponse({
    status: 201,
    description: 'Producto agregado a la wishlist exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Producto ya está en la wishlist' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  addItem(
    @Body() addToWishlistDto: AddToWishlistDto,
    @CurrentUser() user: any,
  ) {
    return this.wishlistService.addItem(user.id, addToWishlistDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Obtener wishlist',
    description: 'Obtiene la lista de productos en la wishlist del usuario.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de productos en la wishlist',
  })
  getWishlist(@CurrentUser() user: any) {
    return this.wishlistService.getWishlist(user.id);
  }

  @Delete('items/:productId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Eliminar producto de la wishlist',
    description: 'Elimina un producto específico de la wishlist del usuario.',
  })
  @ApiParam({ name: 'productId', description: 'ID del producto a eliminar' })
  @ApiResponse({
    status: 200,
    description: 'Producto eliminado de la wishlist exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Producto no encontrado en la wishlist',
  })
  removeItem(@Param('productId') productId: string, @CurrentUser() user: any) {
    return this.wishlistService.removeItem(user.id, { productId });
  }

  @Delete('items')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Eliminar producto específico de la wishlist',
    description:
      'Elimina un producto con variante específica de la wishlist del usuario.',
  })
  @ApiBody({ type: RemoveFromWishlistDto })
  @ApiResponse({
    status: 200,
    description: 'Producto eliminado de la wishlist exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Producto no encontrado en la wishlist',
  })
  removeSpecificItem(
    @Body() removeFromWishlistDto: RemoveFromWishlistDto,
    @CurrentUser() user: any,
  ) {
    return this.wishlistService.removeItem(user.id, removeFromWishlistDto);
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Limpiar wishlist',
    description: 'Elimina todos los productos de la wishlist del usuario.',
  })
  @ApiResponse({
    status: 200,
    description: 'Wishlist limpiada exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Wishlist no encontrada' })
  clearWishlist(@CurrentUser() user: any) {
    return this.wishlistService.clearWishlist(user.id);
  }

  @Post('sync')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Sincronizar wishlist',
    description:
      'Sincroniza la wishlist local (localStorage) con la wishlist persistente del usuario. Realiza merge inteligente de items.',
  })
  @ApiBody({ type: SyncWishlistDto })
  @ApiResponse({
    status: 200,
    description: 'Wishlist sincronizada exitosamente',
    schema: {
      properties: {
        wishlistId: { type: 'string' },
        items: { type: 'array' },
        totalItems: { type: 'number' },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Usuario no autenticado' })
  syncWishlist(
    @CurrentUser() user: any,
    @Body() syncWishlistDto: SyncWishlistDto,
  ) {
    return this.wishlistService.syncWishlist(user.id, syncWishlistDto);
  }
}
