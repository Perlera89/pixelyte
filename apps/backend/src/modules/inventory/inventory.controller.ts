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
  ApiQuery,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import {
  CreateInventoryLocationDto,
  UpdateInventoryLocationDto,
  CreateInventoryMovementDto,
  UpdateInventoryLevelDto,
} from './dto/inventory.dto';
import { PaginationOptions } from '../../common/utils/pagination.util';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('8. Inventario')
@ApiBearerAuth()
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  // =============  UBICACIONES  =============
  @ApiTags('9. Ubicaciones de inventario')
  @Roles('ADMIN')
  @Post('add-location')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Agregar una nueva ubicación',
    description: 'Crea una nueva ubicación de inventario. Requiere rol ADMIN.',
  })
  @ApiBody({ type: CreateInventoryLocationDto })
  @ApiResponse({ status: 201, description: 'Ubicación creada exitosamente' })
  createLocation(@Body() createLocationDto: CreateInventoryLocationDto) {
    return this.inventoryService.createLocation(createLocationDto);
  }

  @ApiTags('9. Ubicaciones de inventario')
  @Get('get-all-locations')
  @ApiOperation({
    summary: 'Obtener lista de ubicaciones',
    description: 'Devuelve una lista paginada de ubicaciones de inventario.',
  })
  @ApiQuery({ name: 'page', required: false, description: 'Número de página' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Elementos por página',
  })
  @ApiQuery({
    name: 'searchQuery',
    required: false,
    description: 'Palabra clave para búsqueda',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de ubicaciones obtenida exitosamente',
  })
  findAllLocations(
    @Query() paginationOptions: PaginationOptions,
    @Query('searchQuery') searchQuery?: string,
  ) {
    return this.inventoryService.findAllLocations({
      ...paginationOptions,
      searchQuery,
    });
  }

  @ApiTags('9. Ubicaciones de inventario')
  @Get('find-location/:id')
  @ApiOperation({
    summary: 'Obtener una ubicación por ID',
    description: 'Devuelve los datos de una ubicación por su ID.',
  })
  @ApiParam({ name: 'id', description: 'ID único de la ubicación' })
  @ApiResponse({ status: 200, description: 'Ubicación encontrada' })
  @ApiResponse({ status: 404, description: 'Ubicación no encontrada' })
  findOneLocation(@Param('id') id: string) {
    return this.inventoryService.findOneLocation(id);
  }

  @ApiTags('9. Ubicaciones de inventario')
  @Roles('ADMIN')
  @Patch('update-location/:id')
  @ApiOperation({
    summary: 'Actualizar una ubicación',
    description: 'Actualiza los datos de una ubicación. Requiere rol ADMIN.',
  })
  @ApiParam({ name: 'id', description: 'ID único de la ubicación' })
  @ApiBody({ type: UpdateInventoryLocationDto })
  @ApiResponse({
    status: 200,
    description: 'Ubicación actualizada exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Ubicación no encontrada' })
  updateLocation(
    @Param('id') id: string,
    @Body() updateLocationDto: UpdateInventoryLocationDto,
  ) {
    return this.inventoryService.updateLocation(id, updateLocationDto);
  }

  @ApiTags('9. Ubicaciones de inventario')
  @Roles('ADMIN')
  @Delete('delete-location/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar (lógico) una ubicación',
    description: 'Elimina lógicamente una ubicación. Requiere rol ADMIN.',
  })
  @ApiParam({ name: 'id', description: 'ID único de la ubicación' })
  @ApiResponse({ status: 204, description: 'Ubicación eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Ubicación no encontrada' })
  removeLocation(@Param('id') id: string) {
    return this.inventoryService.removeLocation(id);
  }

  // =============  NIVELES DE INVENTARIO  =============
  @ApiTags('10. Niveles de inventario')
  @Get('get-all-levels')
  @ApiOperation({
    summary: 'Obtener niveles de inventario',
    description: 'Devuelve los niveles de inventario filtrados.',
  })
  @ApiQuery({
    name: 'variantId',
    required: false,
    description: 'ID de variante',
  })
  @ApiQuery({
    name: 'locationId',
    required: false,
    description: 'ID de ubicación',
  })
  @ApiQuery({ name: 'page', required: false, description: 'Número de página' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Elementos por página',
  })
  @ApiResponse({
    status: 200,
    description: 'Niveles de inventario obtenidos exitosamente',
  })
  getInventoryLevels(
    @Query('variantId') variantId?: string,
    @Query('locationId') locationId?: string,
    @Query() paginationOptions?: PaginationOptions,
  ) {
    return this.inventoryService.getInventoryLevels(
      variantId,
      locationId,
      paginationOptions,
    );
  }

  @ApiTags('10. Niveles de inventario')
  @Roles('ADMIN')
  @Patch('update-level/:variantId/:locationId')
  @ApiOperation({
    summary: 'Actualizar nivel de inventario',
    description:
      'Actualiza el nivel de inventario para una variante y ubicación. Requiere rol ADMIN.',
  })
  @ApiParam({ name: 'variantId', description: 'ID de la variante' })
  @ApiParam({ name: 'locationId', description: 'ID de la ubicación' })
  @ApiBody({ type: UpdateInventoryLevelDto })
  @ApiResponse({
    status: 200,
    description: 'Nivel de inventario actualizado exitosamente',
  })
  updateInventoryLevel(
    @Param('variantId') variantId: string,
    @Param('locationId') locationId: string,
    @Body() updateLevelDto: UpdateInventoryLevelDto,
  ) {
    return this.inventoryService.updateInventoryLevel(
      variantId,
      locationId,
      updateLevelDto,
    );
  }

  // =============  MOVIMIENTOS DE INVENTARIO  =============
  @ApiTags('11. Movimientos de inventario')
  @Roles('ADMIN')
  @Post('add-movement')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Agregar movimiento de inventario',
    description: 'Crea un nuevo movimiento de inventario. Requiere rol ADMIN.',
  })
  @ApiBody({ type: CreateInventoryMovementDto })
  @ApiResponse({ status: 201, description: 'Movimiento creado exitosamente' })
  createMovement(@Body() createMovementDto: CreateInventoryMovementDto) {
    return this.inventoryService.createMovement(createMovementDto);
  }

  @ApiTags('11. Movimientos de inventario')
  @Get('get-all-movements')
  @ApiOperation({
    summary: 'Obtener movimientos de inventario',
    description: 'Devuelve una lista de movimientos de inventario filtrados.',
  })
  @ApiQuery({
    name: 'variantId',
    required: false,
    description: 'ID de variante',
  })
  @ApiQuery({
    name: 'locationId',
    required: false,
    description: 'ID de ubicación',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    description: 'Tipo de movimiento',
  })
  @ApiQuery({ name: 'page', required: false, description: 'Número de página' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Elementos por página',
  })
  @ApiResponse({
    status: 200,
    description: 'Movimientos de inventario obtenidos exitosamente',
  })
  findMovements(
    @Query('variantId') variantId?: string,
    @Query('locationId') locationId?: string,
    @Query('type') type?: string,
    @Query() paginationOptions?: PaginationOptions,
  ) {
    return this.inventoryService.findMovements(
      variantId,
      locationId,
      type,
      paginationOptions,
    );
  }
}
