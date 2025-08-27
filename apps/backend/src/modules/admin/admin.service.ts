import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';
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
import { OrderStatus, ProductStatus } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // Dashboard Methods
  async getDashboardMetrics(): Promise<DashboardMetricsDto> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Ejecutar todas las consultas en paralelo para mejor rendimiento
    const [
      totalSalesResult,
      totalOrders,
      totalProducts,
      totalUsers,
      monthlySalesResult,
      monthlyOrders,
      lowStockProducts,
      pendingOrders,
    ] = await Promise.all([
      // Total de ventas del año
      this.prisma.order.aggregate({
        where: {
          status: { not: OrderStatus.CANCELLED },
          createdAt: { gte: startOfYear },
        },
        _sum: { totalPrice: true },
      }),
      // Total de órdenes del año
      this.prisma.order.count({
        where: {
          status: { not: OrderStatus.CANCELLED },
          createdAt: { gte: startOfYear },
        },
      }),
      // Total de productos activos
      this.prisma.product.count({
        where: { isActive: true },
      }),
      // Total de usuarios registrados
      this.prisma.user.count(),
      // Ventas del mes actual
      this.prisma.order.aggregate({
        where: {
          status: { not: OrderStatus.CANCELLED },
          createdAt: { gte: startOfMonth },
        },
        _sum: { totalPrice: true },
      }),
      // Órdenes del mes actual
      this.prisma.order.count({
        where: {
          status: { not: OrderStatus.CANCELLED },
          createdAt: { gte: startOfMonth },
        },
      }),
      // Productos con stock bajo (menos de 10 unidades)
      this.prisma.productVariant.count({
        where: {
          inventoryQuantity: { lt: 10 },
          isActive: true,
        },
      }),
      // Órdenes pendientes
      this.prisma.order.count({
        where: { status: OrderStatus.PENDING },
      }),
    ]);

    return {
      totalSales: Number(totalSalesResult._sum.totalPrice || 0),
      totalOrders,
      totalProducts,
      totalUsers,
      monthlySales: Number(monthlySalesResult._sum.totalPrice || 0),
      monthlyOrders,
      lowStockProducts,
      pendingOrders,
    };
  }

  async getSalesChartData(days: number = 30): Promise<SalesChartDataDto[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const salesData = await this.prisma.order.groupBy({
      by: ['createdAt'],
      where: {
        status: { not: OrderStatus.CANCELLED },
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        totalPrice: true,
      },
      _count: {
        id: true,
      },
    });

    // Agrupar por día
    const dailyData = new Map<string, { sales: number; orders: number }>();

    salesData.forEach((item) => {
      const date = item.createdAt.toISOString().split('T')[0];
      const existing = dailyData.get(date) || { sales: 0, orders: 0 };

      dailyData.set(date, {
        sales: existing.sales + Number(item._sum.totalPrice || 0),
        orders: existing.orders + item._count.id,
      });
    });

    // Convertir a array y ordenar por fecha
    return Array.from(dailyData.entries())
      .map(([date, data]) => ({
        date,
        sales: data.sales,
        orders: data.orders,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  // Product Management Methods
  async getProducts(query: AdminProductsQueryDto) {
    const {
      page = 1,
      limit = 20,
      search,
      categoryId,
      brandId,
      status,
      isActive,
    } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (categoryId) where.categoryId = categoryId;
    if (brandId) where.brandId = brandId;
    if (status) where.status = status;
    if (typeof isActive === 'boolean') where.isActive = isActive;

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: {
          category: { select: { name: true, slug: true } },
          brand: { select: { name: true, slug: true } },
          productImages: {
            where: { isPrimary: true },
            select: { url: true, altText: true },
          },
          variants: {
            select: {
              id: true,
              sku: true,
              price: true,
              inventoryQuantity: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async createProduct(data: CreateProductDto) {
    // Verificar que el SKU sea único
    const existingSku = await this.prisma.product.findUnique({
      where: { sku: data.sku },
    });

    if (existingSku) {
      throw new BadRequestException('El SKU ya existe');
    }

    // Verificar que el slug sea único
    const existingSlug = await this.prisma.product.findUnique({
      where: { slug: data.slug },
    });

    if (existingSlug) {
      throw new BadRequestException('El slug ya existe');
    }

    // Verificar que la categoría existe
    const category = await this.prisma.category.findUnique({
      where: { id: data.categoryId },
    });

    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }

    // Verificar que la marca existe (si se proporciona)
    if (data.brandId) {
      const brand = await this.prisma.brand.findUnique({
        where: { id: data.brandId },
      });

      if (!brand) {
        throw new NotFoundException('Marca no encontrada');
      }
    }

    return this.prisma.product.create({
      data: {
        ...data,
        basePrice: data.basePrice,
        compareAtPrice: data.compareAtPrice,
        costPrice: data.costPrice,
        weight: data.weight,
      },
      include: {
        category: { select: { name: true, slug: true } },
        brand: { select: { name: true, slug: true } },
      },
    });
  }

  async updateProduct(id: string, data: UpdateProductDto) {
    const product = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    // Verificar que la categoría existe (si se proporciona)
    if (data.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: data.categoryId },
      });

      if (!category) {
        throw new NotFoundException('Categoría no encontrada');
      }
    }

    // Verificar que la marca existe (si se proporciona)
    if (data.brandId) {
      const brand = await this.prisma.brand.findUnique({
        where: { id: data.brandId },
      });

      if (!brand) {
        throw new NotFoundException('Marca no encontrada');
      }
    }

    return this.prisma.product.update({
      where: { id },
      data: {
        ...data,
        basePrice: data.basePrice,
        compareAtPrice: data.compareAtPrice,
        costPrice: data.costPrice,
        weight: data.weight,
      },
      include: {
        category: { select: { name: true, slug: true } },
        brand: { select: { name: true, slug: true } },
      },
    });
  }

  async deleteProduct(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        orderItems: true,
        wishlistItems: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    // Verificar si el producto tiene órdenes asociadas
    if (product.orderItems.length > 0) {
      throw new BadRequestException(
        'No se puede eliminar el producto porque tiene órdenes asociadas. Considere desactivarlo en su lugar.',
      );
    }

    // Eliminar elementos de wishlist primero
    if (product.wishlistItems.length > 0) {
      await this.prisma.wishlistItem.deleteMany({
        where: { productId: id },
      });
    }

    return this.prisma.product.delete({
      where: { id },
    });
  }

  // Order Management Methods
  async getOrders(query: AdminOrdersQueryDto) {
    const { page = 1, limit = 20, status, search, dateFrom, dateTo } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status) where.status = status;

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo + 'T23:59:59.999Z');
    }

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          orderItems: {
            include: {
              product: { select: { name: true, slug: true } },
              variant: { select: { title: true, sku: true } },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getOrder(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                name: true,
                slug: true,
                productImages: {
                  where: { isPrimary: true },
                  select: { url: true, altText: true },
                },
              },
            },
            variant: { select: { title: true, sku: true } },
          },
        },
        transactions: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Orden no encontrada');
    }

    return order;
  }

  async updateOrderStatus(id: string, data: UpdateOrderStatusDto) {
    const order = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException('Orden no encontrada');
    }

    const updateData: any = {
      status: data.status,
    };

    if (data.notes) {
      updateData.notes = data.notes;
    }

    // Actualizar timestamps según el estado
    if (data.status === OrderStatus.PROCESSING && !order.processedAt) {
      updateData.processedAt = new Date();
    } else if (data.status === OrderStatus.CANCELLED && !order.cancelledAt) {
      updateData.cancelledAt = new Date();
    }

    return this.prisma.order.update({
      where: { id },
      data: updateData,
    });
  }

  // User Management Methods
  async getUsers(query: AdminUsersQueryDto) {
    const { page = 1, limit = 20, search, isActive, role } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { names: { contains: search, mode: 'insensitive' } },
        { surnames: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (typeof isActive === 'boolean') where.isActive = isActive;
    if (role) where.role = role;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          names: true,
          surnames: true,
          role: true,
          isActive: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
          profile: {
            select: {
              avatarUrl: true,
              location: true,
            },
          },
          _count: {
            select: {
              productReview: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUser(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        names: true,
        surnames: true,
        phone: true,
        dateOfBirth: true,
        role: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        profile: true,
        addresses: true,
        _count: {
          select: {
            productReview: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user;
  }

  async updateUserStatus(id: string, data: UpdateUserStatusDto) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        isActive: data.isActive,
      },
      select: {
        id: true,
        email: true,
        names: true,
        surnames: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    });
  }

  // Category Management Methods
  async getCategories() {
    return this.prisma.category.findMany({
      include: {
        parent: { select: { name: true, slug: true } },
        children: { select: { id: true, name: true, slug: true } },
        _count: {
          select: { products: true },
        },
      },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  }

  async createCategory(data: CreateCategoryDto) {
    // Verificar que el slug sea único
    const existingSlug = await this.prisma.category.findUnique({
      where: { slug: data.slug },
    });

    if (existingSlug) {
      throw new BadRequestException('El slug ya existe');
    }

    // Verificar que la categoría padre existe (si se proporciona)
    if (data.parentId) {
      const parent = await this.prisma.category.findUnique({
        where: { id: data.parentId },
      });

      if (!parent) {
        throw new NotFoundException('Categoría padre no encontrada');
      }
    }

    return this.prisma.category.create({
      data,
      include: {
        parent: { select: { name: true, slug: true } },
        children: { select: { id: true, name: true, slug: true } },
      },
    });
  }

  async updateCategory(id: string, data: UpdateCategoryDto) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }

    // Verificar que el slug sea único (si se proporciona)
    if (data.slug && data.slug !== category.slug) {
      const existingSlug = await this.prisma.category.findUnique({
        where: { slug: data.slug },
      });

      if (existingSlug) {
        throw new BadRequestException('El slug ya existe');
      }
    }

    // Verificar que la categoría padre existe (si se proporciona)
    if (data.parentId) {
      const parent = await this.prisma.category.findUnique({
        where: { id: data.parentId },
      });

      if (!parent) {
        throw new NotFoundException('Categoría padre no encontrada');
      }

      // Evitar referencias circulares
      if (data.parentId === id) {
        throw new BadRequestException(
          'Una categoría no puede ser padre de sí misma',
        );
      }
    }

    return this.prisma.category.update({
      where: { id },
      data,
      include: {
        parent: { select: { name: true, slug: true } },
        children: { select: { id: true, name: true, slug: true } },
      },
    });
  }

  async deleteCategory(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        products: true,
        children: true,
      },
    });

    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }

    // Verificar si la categoría tiene productos asociados
    if (category.products.length > 0) {
      throw new BadRequestException(
        'No se puede eliminar la categoría porque tiene productos asociados',
      );
    }

    // Verificar si la categoría tiene subcategorías
    if (category.children.length > 0) {
      throw new BadRequestException(
        'No se puede eliminar la categoría porque tiene subcategorías',
      );
    }

    return this.prisma.category.delete({
      where: { id },
    });
  }

  // Brand Management Methods
  async getBrands() {
    return this.prisma.brand.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async createBrand(data: CreateBrandDto) {
    // Verificar que el nombre sea único
    const existingName = await this.prisma.brand.findUnique({
      where: { name: data.name },
    });

    if (existingName) {
      throw new BadRequestException('El nombre de la marca ya existe');
    }

    // Verificar que el slug sea único
    const existingSlug = await this.prisma.brand.findUnique({
      where: { slug: data.slug },
    });

    if (existingSlug) {
      throw new BadRequestException('El slug ya existe');
    }

    return this.prisma.brand.create({
      data,
    });
  }

  async updateBrand(id: string, data: UpdateBrandDto) {
    const brand = await this.prisma.brand.findUnique({
      where: { id },
    });

    if (!brand) {
      throw new NotFoundException('Marca no encontrada');
    }

    // Verificar que el nombre sea único (si se proporciona)
    if (data.name && data.name !== brand.name) {
      const existingName = await this.prisma.brand.findUnique({
        where: { name: data.name },
      });

      if (existingName) {
        throw new BadRequestException('El nombre de la marca ya existe');
      }
    }

    // Verificar que el slug sea único (si se proporciona)
    if (data.slug && data.slug !== brand.slug) {
      const existingSlug = await this.prisma.brand.findUnique({
        where: { slug: data.slug },
      });

      if (existingSlug) {
        throw new BadRequestException('El slug ya existe');
      }
    }

    return this.prisma.brand.update({
      where: { id },
      data,
    });
  }

  async deleteBrand(id: string) {
    const brand = await this.prisma.brand.findUnique({
      where: { id },
      include: {
        products: true,
      },
    });

    if (!brand) {
      throw new NotFoundException('Marca no encontrada');
    }

    // Verificar si la marca tiene productos asociados
    if (brand.products.length > 0) {
      throw new BadRequestException(
        'No se puede eliminar la marca porque tiene productos asociados',
      );
    }

    return this.prisma.brand.delete({
      where: { id },
    });
  }
}
