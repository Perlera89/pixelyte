import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';
import {
  CreateInventoryLocationDto,
  UpdateInventoryLocationDto,
  CreateInventoryMovementDto,
  UpdateInventoryLevelDto,
} from './dto/inventory.dto';
import {
  PaginationOptions,
  PaginationHelper,
  PaginatedResult,
} from '../../common/utils/pagination.util';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  // =============  UBICACIONES DE INVENTARIO  =============
  async createLocation(createLocationDto: CreateInventoryLocationDto) {
    return this.prisma.inventoryLocation.create({
      data: createLocationDto,
    });
  }

  async findAllLocations(
    paginationOptions: PaginationOptions,
  ): Promise<PaginatedResult<any>> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'name',
      sortOrder = 'asc',
      searchQuery,
    } = paginationOptions;
    const offset = PaginationHelper.calculateOffset(page, limit);
    const where: any = {};
    if (searchQuery) {
      where.OR = [
        { name: { contains: searchQuery, mode: 'insensitive' } },
        { description: { contains: searchQuery, mode: 'insensitive' } },
      ];
    }
    const [locations, totalCount] = await Promise.all([
      this.prisma.inventoryLocation.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: {
            select: { inventoryLevel: true },
          },
        },
      }),
      this.prisma.inventoryLocation.count({ where }),
    ]);
    return PaginationHelper.createPaginatedResult(
      locations,
      totalCount,
      page,
      limit,
    );
  }

  async findOneLocation(id: string) {
    const location = await this.prisma.inventoryLocation.findUnique({
      where: { id },
      include: {
        inventoryLevel: {
          include: {
            variant: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    sku: true,
                  },
                },
              },
            },
          },
        },
        _count: {
          select: { inventoryLevel: true },
        },
      },
    });

    if (!location) {
      throw new NotFoundException('Ubicación de inventario no encontrada');
    }

    return location;
  }

  async updateLocation(
    id: string,
    updateLocationDto: UpdateInventoryLocationDto,
  ) {
    await this.findOneLocation(id);

    return this.prisma.inventoryLocation.update({
      where: { id },
      data: updateLocationDto,
    });
  }

  async removeLocation(id: string) {
    await this.findOneLocation(id);

    // Verificar si tiene niveles de inventario asociados
    const inventoryCount = await this.prisma.inventoryLevel.count({
      where: { locationId: id },
    });

    if (inventoryCount > 0) {
      throw new BadRequestException(
        'No se puede eliminar la ubicación porque tiene inventario asociado',
      );
    }

    return this.prisma.inventoryLocation.delete({
      where: { id },
    });
  }

  // =============  NIVELES DE INVENTARIO  =============
  async getInventoryLevels(
    variantId?: string,
    locationId?: string,
    paginationOptions?: PaginationOptions,
  ): Promise<PaginatedResult<any>> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'updatedAt',
      sortOrder = 'desc',
    } = paginationOptions || {};
    const offset = PaginationHelper.calculateOffset(page, limit);

    const where: any = {};
    if (variantId) where.variantId = variantId;
    if (locationId) where.locationId = locationId;

    const [levels, totalCount] = await Promise.all([
      this.prisma.inventoryLevel.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          variant: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  sku: true,
                },
              },
            },
          },
          location: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      this.prisma.inventoryLevel.count({ where }),
    ]);

    return PaginationHelper.createPaginatedResult(
      levels,
      totalCount,
      page,
      limit,
    );
  }

  async updateInventoryLevel(
    variantId: string,
    locationId: string,
    updateLevelDto: UpdateInventoryLevelDto,
  ) {
    // Verificar que la variante existe
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: variantId },
    });

    if (!variant) {
      throw new NotFoundException('Variante de producto no encontrada');
    }

    // Verificar que la ubicación existe
    const location = await this.prisma.inventoryLocation.findUnique({
      where: { id: locationId },
    });

    if (!location) {
      throw new NotFoundException('Ubicación de inventario no encontrada');
    }

    return this.prisma.inventoryLevel.upsert({
      where: {
        variantId_locationId: {
          variantId,
          locationId,
        },
      },
      update: updateLevelDto,
      create: {
        variantId,
        locationId,
        ...updateLevelDto,
      },
      include: {
        variant: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
              },
            },
          },
        },
        location: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  // =============  MOVIMIENTOS DE INVENTARIO  =============
  async createMovement(createMovementDto: CreateInventoryMovementDto) {
    // Verificar que la variante existe
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: createMovementDto.variantId },
    });

    if (!variant) {
      throw new NotFoundException('Variante de producto no encontrada');
    }

    // Verificar que la ubicación existe
    const location = await this.prisma.inventoryLocation.findUnique({
      where: { id: createMovementDto.locationId },
    });

    if (!location) {
      throw new NotFoundException('Ubicación de inventario no encontrada');
    }

    // Crear el movimiento
    const movement = await this.prisma.inventoryMovement.create({
      data: {
        ...createMovementDto,
        type: createMovementDto.type as any,
        referenceType: createMovementDto.referenceType as any,
      },
      include: {
        variant: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
              },
            },
          },
        },
        location: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Actualizar el nivel de inventario según el tipo de movimiento
    await this.updateInventoryAfterMovement(movement);

    return movement;
  }

  async findMovements(
    variantId?: string,
    locationId?: string,
    type?: string,
    paginationOptions?: PaginationOptions,
  ): Promise<PaginatedResult<any>> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = paginationOptions || {};
    const offset = PaginationHelper.calculateOffset(page, limit);

    const where: any = {};
    if (variantId) where.variantId = variantId;
    if (locationId) where.locationId = locationId;
    if (type) where.type = type as any;

    const [movements, totalCount] = await Promise.all([
      this.prisma.inventoryMovement.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          variant: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  sku: true,
                },
              },
            },
          },
          location: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      this.prisma.inventoryMovement.count({ where }),
    ]);

    return PaginationHelper.createPaginatedResult(
      movements,
      totalCount,
      page,
      limit,
    );
  }

  // Ajuste de inventario rápido
  async adjustInventory(
    variantId: string,
    locationId: string,
    newQuantity: number,
    reason: string,
  ) {
    const currentLevel = await this.prisma.inventoryLevel.findUnique({
      where: {
        variantId_locationId: {
          variantId,
          locationId,
        },
      },
    });

    const currentQuantity = currentLevel?.available || 0;
    const difference = newQuantity - currentQuantity;

    if (difference !== 0) {
      // Crear movimiento de ajuste
      await this.createMovement({
        variantId,
        locationId,
        quantity: Math.abs(difference),
        type: 'ADJUSTMENT',
        referenceType: 'ADJUSTMENT',
        notes: reason,
      });
    }

    return {
      variantId,
      locationId,
      previousQuantity: currentQuantity,
      newQuantity,
      difference,
      reason,
    };
  }

  // Obtener resumen de inventario
  async getInventorySummary() {
    const [
      totalVariants,
      totalLocations,
      lowStockVariants,
      outOfStockVariants,
      totalValue,
    ] = await Promise.all([
      this.prisma.productVariant.count({ where: { isActive: true } }),
      this.prisma.inventoryLocation.count({ where: { isActive: true } }),
      this.prisma.inventoryLevel.count({
        where: {
          available: { lte: 10 },
          variant: { isActive: true },
        },
      }),
      this.prisma.inventoryLevel.count({
        where: {
          available: 0,
          variant: { isActive: true },
        },
      }),
      this.prisma.inventoryLevel.aggregate({
        _sum: {
          available: true,
        },
        where: {
          variant: { isActive: true },
        },
      }),
    ]);

    return {
      totalVariants,
      totalLocations,
      lowStockVariants,
      outOfStockVariants,
      totalStockUnits: totalValue._sum.available || 0,
    };
  }

  // Método privado para actualizar inventario después de un movimiento
  private async updateInventoryAfterMovement(movement: any) {
    const { variantId, locationId, quantity, type } = movement;

    const currentLevel = await this.prisma.inventoryLevel.findUnique({
      where: {
        variantId_locationId: {
          variantId,
          locationId,
        },
      },
    });

    let availableChange = 0;
    let onHandChange = 0;

    switch (type) {
      case 'RESTOCK':
        availableChange = quantity;
        onHandChange = quantity;
        break;
      case 'SALE':
      case 'ORDER':
        availableChange = -quantity;
        onHandChange = -quantity;
        break;
      case 'ADJUSTMENT':
        // Para ajustes, el quantity ya incluye la dirección (+ o -)
        availableChange = quantity;
        onHandChange = quantity;
        break;
      case 'RETURN':
        availableChange = quantity;
        onHandChange = quantity;
        break;
    }

    const newAvailable = (currentLevel?.available || 0) + availableChange;
    const newOnHand = (currentLevel?.onHand || 0) + onHandChange;

    await this.prisma.inventoryLevel.upsert({
      where: {
        variantId_locationId: {
          variantId,
          locationId,
        },
      },
      update: {
        available: Math.max(0, newAvailable),
        onHand: Math.max(0, newOnHand),
      },
      create: {
        variantId,
        locationId,
        available: Math.max(0, newAvailable),
        onHand: Math.max(0, newOnHand),
      },
    });

    // Actualizar también el inventoryQuantity en la variante del producto
    await this.prisma.productVariant.update({
      where: { id: variantId },
      data: {
        inventoryQuantity: Math.max(0, newAvailable),
      },
    });
  }
}
