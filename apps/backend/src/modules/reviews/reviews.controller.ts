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
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import {
  CreateProductReviewDto,
  UpdateProductReviewDto,
  CreateReviewVoteDto,
} from './dto/review.dto';
import { PaginationOptions } from '../../common/utils/pagination.util';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('13. Reseñas')
@ApiBearerAuth()
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post('add-review')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Agregar una reseña',
    description: 'Crea una nueva reseña para un producto.',
  })
  @ApiBody({ type: CreateProductReviewDto })
  @ApiResponse({ status: 201, description: 'Reseña creada exitosamente' })
  create(
    @Body() createReviewDto: CreateProductReviewDto,
    @CurrentUser() user: any,
  ) {
    return this.reviewsService.createReview({
      ...createReviewDto,
      userId: user.id,
    });
  }

  @Get('get-all-reviews-by-product/:productId')
  @ApiOperation({
    summary: 'Obtener reseñas de un producto',
    description: 'Devuelve todas las reseñas de un producto.',
  })
  @ApiParam({ name: 'productId', description: 'ID del producto' })
  @ApiQuery({ name: 'page', required: false, description: 'Número de página' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Elementos por página',
  })
  @ApiQuery({
    name: 'searchQuery',
    required: false,
    description: 'Palabra clave para búsqueda en título o contenido',
  })
  @ApiResponse({ status: 200, description: 'Reseñas obtenidas exitosamente' })
  findReviewsByProduct(
    @Param('productId') productId: string,
    @Query() paginationOptions: PaginationOptions,
    @Query('searchQuery') searchQuery?: string,
  ) {
    return this.reviewsService.findReviewsByProduct(productId, {
      ...paginationOptions,
      searchQuery,
    });
  }

  @Get('get-review-stats/:productId')
  @ApiOperation({
    summary: 'Obtener estadísticas de reseñas',
    description: 'Devuelve estadísticas de reseñas para un producto.',
  })
  @ApiParam({ name: 'productId', description: 'ID del producto' })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas obtenidas exitosamente',
  })
  getProductReviewStats(@Param('productId') productId: string) {
    return this.reviewsService.getProductReviewStats(productId);
  }

  @Get('get-all-reviews-by-user/:userId')
  @ApiOperation({
    summary: 'Obtener reseñas de un usuario',
    description: 'Devuelve todas las reseñas hechas por un usuario.',
  })
  @ApiParam({ name: 'userId', description: 'ID del usuario' })
  @ApiQuery({ name: 'page', required: false, description: 'Número de página' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Elementos por página',
  })
  @ApiResponse({ status: 200, description: 'Reseñas obtenidas exitosamente' })
  findReviewsByUser(
    @Param('userId') userId: string,
    @Query() paginationOptions: PaginationOptions,
  ) {
    return this.reviewsService.findReviewsByUser(userId, paginationOptions);
  }

  @Get('find-review/:id')
  @ApiOperation({
    summary: 'Obtener una reseña por ID',
    description: 'Devuelve los datos de una reseña por su ID.',
  })
  @ApiParam({ name: 'id', description: 'ID de la reseña' })
  @ApiResponse({ status: 200, description: 'Reseña encontrada' })
  findOne(@Param('id') id: string) {
    return this.reviewsService.findOneReview(id);
  }

  @Patch('update-review/:id')
  @ApiOperation({
    summary: 'Actualizar una reseña',
    description: 'Actualiza los datos de una reseña.',
  })
  @ApiParam({ name: 'id', description: 'ID de la reseña' })
  @ApiBody({ type: UpdateProductReviewDto })
  @ApiResponse({ status: 200, description: 'Reseña actualizada exitosamente' })
  update(
    @Param('id') id: string,
    @Body() updateReviewDto: UpdateProductReviewDto,
    @Query('userId') userId?: string,
  ) {
    return this.reviewsService.updateReview(id, updateReviewDto, userId);
  }

  @Delete('delete-review/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar (lógico) una reseña',
    description: 'Elimina lógicamente una reseña.',
  })
  @ApiParam({ name: 'id', description: 'ID de la reseña' })
  @ApiResponse({ status: 204, description: 'Reseña eliminada exitosamente' })
  remove(@Param('id') id: string, @Query('userId') userId?: string) {
    return this.reviewsService.removeReview(id, userId);
  }

  @Post('vote')
  @HttpCode(HttpStatus.CREATED)
  voteReview(@Body() createVoteDto: CreateReviewVoteDto) {
    return this.reviewsService.voteReview(createVoteDto);
  }
}
