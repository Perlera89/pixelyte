import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';
import { SupabaseService } from '../../common/services/supabase.service';
import { LoggerService } from '../../common/services/logger.service';
import { ErrorUtil } from '../../common/utils/error.util';
import { ErrorCodes } from '../../common/enums/error-codes.enum';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { CreateBrandDto, UpdateBrandDto } from './dto/brand.dto';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import {
  PaginationOptions,
  PaginationHelper,
  PaginatedResult,
} from '../../common/utils/pagination.util';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private supabaseService: SupabaseService,
    private logger: LoggerService,
  ) {}

  // =============  CATEGORÍAS  =============
  async createCategory(
    createCategoryDto: CreateCategoryDto,
    image?: Express.Multer.File,
  ) {
    const existingCategory = await this.prisma.category.findUnique({
      where: { slug: createCategoryDto.slug },
    });

    if (existingCategory) {
      this.logger.logBusinessEvent('category_creation_failed', {
        slug: createCategoryDto.slug,
        reason: 'duplicate_slug',
      });
      ErrorUtil.throwAlreadyExists('Category', 'slug');
    }

    let imageUrl: string | undefined;
    if (image) {
      imageUrl = await this.supabaseService.uploadImage(
        image,
        'images',
        'categories',
      );
    }

    return this.prisma.category.create({
      data: {
        ...createCategoryDto,
        imageUrl: imageUrl || createCategoryDto.imageUrl,
      },
      include: {
        parent: true,
        children: true,
      },
    });
  }

  async findAllCategories(
    paginationOptions: PaginationOptions,
  ): Promise<PaginatedResult<any>> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'sortOrder',
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
    const [categories, totalCount] = await Promise.all([
      this.prisma.category.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          parent: true,
          children: true,
          _count: {
            select: { products: true },
          },
        },
      }),
      this.prisma.category.count({ where }),
    ]);
    return PaginationHelper.createPaginatedResult(
      categories,
      totalCount,
      page,
      limit,
    );
  }

  async findOneCategory(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
        products: {
          take: 10,
          include: {
            brand: true,
            productImages: {
              where: { isPrimary: true },
              take: 1,
            },
          },
        },
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }

    return category;
  }

  async updateCategory(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
    image?: Express.Multer.File,
  ) {
    const existingCategory = await this.findOneCategory(id);

    if (updateCategoryDto.slug) {
      const existingSlugCategory = await this.prisma.category.findFirst({
        where: { slug: updateCategoryDto.slug, id: { not: id } },
      });

      if (existingSlugCategory) {
        throw new ConflictException('Ya existe una categoría con este slug');
      }
    }

    let imageUrl: string | undefined;
    if (image) {
      if (existingCategory.imageUrl) {
        await this.supabaseService.deleteImage(existingCategory.imageUrl);
      }
      imageUrl = await this.supabaseService.uploadImage(
        image,
        'images',
        'categories',
      );
    }

    return this.prisma.category.update({
      where: { id },
      data: {
        ...updateCategoryDto,
        ...(imageUrl && { imageUrl }),
      },
      include: {
        parent: true,
        children: true,
      },
    });
  }

  async removeCategory(id: string) {
    await this.findOneCategory(id);

    // Verificar si tiene productos asociados
    const productsCount = await this.prisma.product.count({
      where: { categoryId: id },
    });

    if (productsCount > 0) {
      throw new ConflictException(
        'No se puede eliminar la categoría porque tiene productos asociados',
      );
    }

    return this.prisma.category.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // =============  MARCAS  =============
  async createBrand(
    createBrandDto: CreateBrandDto,
    logo?: Express.Multer.File,
  ) {
    const existingBrand = await this.prisma.brand.findUnique({
      where: { slug: createBrandDto.slug },
    });

    if (existingBrand) {
      throw new ConflictException('Ya existe una marca con este slug');
    }

    let logoUrl: string | undefined;
    if (logo) {
      logoUrl = await this.supabaseService.uploadImage(
        logo,
        'images',
        'brands',
      );
    }

    return this.prisma.brand.create({
      data: {
        ...createBrandDto,
        logoUrl: logoUrl || createBrandDto.logoUrl,
      },
    });
  }

  async findAllBrands(
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
    const [brands, totalCount] = await Promise.all([
      this.prisma.brand.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: {
            select: { products: true },
          },
        },
      }),
      this.prisma.brand.count({ where }),
    ]);
    return PaginationHelper.createPaginatedResult(
      brands,
      totalCount,
      page,
      limit,
    );
  }

  async findOneBrand(id: string) {
    const brand = await this.prisma.brand.findUnique({
      where: { id },
      include: {
        products: {
          take: 10,
          include: {
            category: true,
            productImages: {
              where: { isPrimary: true },
              take: 1,
            },
          },
        },
        _count: {
          select: { products: true },
        },
      },
    });

    if (!brand) {
      throw new NotFoundException('Marca no encontrada');
    }

    return brand;
  }

  async updateBrand(
    id: string,
    updateBrandDto: UpdateBrandDto,
    logo?: Express.Multer.File,
  ) {
    const existingBrand = await this.findOneBrand(id);

    if (updateBrandDto.slug) {
      const existingSlugBrand = await this.prisma.brand.findFirst({
        where: { slug: updateBrandDto.slug, id: { not: id } },
      });

      if (existingSlugBrand) {
        throw new ConflictException('Ya existe una marca con este slug');
      }
    }

    let logoUrl: string | undefined;
    if (logo) {
      if (existingBrand.logoUrl) {
        await this.supabaseService.deleteImage(existingBrand.logoUrl);
      }
      logoUrl = await this.supabaseService.uploadImage(
        logo,
        'images',
        'brands',
      );
    }

    return this.prisma.brand.update({
      where: { id },
      data: {
        ...updateBrandDto,
        ...(logoUrl && { logoUrl }),
      },
    });
  }

  async removeBrand(id: string) {
    await this.findOneBrand(id);

    // Verificar si tiene productos asociados
    const productsCount = await this.prisma.product.count({
      where: { brandId: id },
    });

    if (productsCount > 0) {
      throw new ConflictException(
        'No se puede eliminar la marca porque tiene productos asociados',
      );
    }

    return this.prisma.brand.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // =============  PRODUCTOS  =============
  async createProduct(
    createProductDto: CreateProductDto,
    images?: Express.Multer.File[],
  ) {
    const existingProduct = await this.prisma.product.findUnique({
      where: { sku: createProductDto.sku },
    });

    if (existingProduct) {
      throw new ConflictException('Ya existe un producto con este SKU');
    }

    const slugExists = await this.prisma.product.findUnique({
      where: { slug: createProductDto.slug },
    });

    if (slugExists) {
      throw new ConflictException('Ya existe un producto con este slug');
    }

    const product = await this.prisma.product.create({
      data: {
        ...createProductDto,
        status: createProductDto.status as any,
      },
      include: {
        brand: true,
        category: true,
        productImages: true,
        variants: true,
      },
    });

    if (images && images.length > 0) {
      const imageUrls = await this.supabaseService.uploadMultipleImages(
        images,
        'images',
        'products',
      );

      const productImages = imageUrls.map((url, index) => ({
        productId: product.id,
        url: url,
        altText: `${product.name} - Imagen ${index + 1}`,
        isPrimary: index === 0, // First image is primary
        position: index,
      }));

      await this.prisma.productImage.createMany({
        data: productImages,
      });

      // Return updated product with images
      return this.prisma.product.findUnique({
        where: { id: product.id },
        include: {
          brand: true,
          category: true,
          productImages: true,
          variants: true,
        },
      });
    }

    return product;
  }

  async findAllProducts(
    paginationOptions: PaginationOptions,
  ): Promise<PaginatedResult<any>> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      searchQuery,
    } = paginationOptions;
    const offset = PaginationHelper.calculateOffset(page, limit);
    const where: any = {};
    if (searchQuery) {
      where.OR = [
        { name: { contains: searchQuery, mode: 'insensitive' } },
        { shortDescription: { contains: searchQuery, mode: 'insensitive' } },
        { description: { contains: searchQuery, mode: 'insensitive' } },
        { sku: { contains: searchQuery, mode: 'insensitive' } },
      ];
    }
    const [products, totalCount] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          brand: true,
          category: true,
          productImages: {
            where: { isPrimary: true },
            take: 1,
          },
          _count: {
            select: { variants: true },
          },
        },
      }),
      this.prisma.product.count({ where }),
    ]);
    return PaginationHelper.createPaginatedResult(
      products,
      totalCount,
      page,
      limit,
    );
  }

  async findOneProduct(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        brand: true,
        category: true,
        productImages: true,
        variants: {
          include: {
            productImage: true,
            variantOptionValue: {
              include: {
                optionValue: {
                  include: {
                    productOption: true,
                  },
                },
              },
            },
          },
        },
        options: {
          include: {
            values: true,
          },
        },
        specifications: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    return product;
  }

  async updateProduct(
    id: string,
    updateProductDto: UpdateProductDto,
    images?: Express.Multer.File[],
  ) {
    const existingProduct = await this.findOneProduct(id);

    if (updateProductDto.sku) {
      const existingSkuProduct = await this.prisma.product.findFirst({
        where: { sku: updateProductDto.sku, id: { not: id } },
      });

      if (existingSkuProduct) {
        throw new ConflictException('Ya existe un producto con este SKU');
      }
    }

    if (updateProductDto.slug) {
      const existingSlugProduct = await this.prisma.product.findFirst({
        where: { slug: updateProductDto.slug, id: { not: id } },
      });

      if (existingSlugProduct) {
        throw new ConflictException('Ya existe un producto con este slug');
      }
    }

    const updatedProduct = await this.prisma.product.update({
      where: { id },
      data: {
        ...updateProductDto,
        status: updateProductDto.status as any,
      },
      include: {
        brand: true,
        category: true,
        productImages: true,
        variants: true,
      },
    });

    if (images && images.length > 0) {
      const imageUrls = await this.supabaseService.uploadMultipleImages(
        images,
        'images',
        'products',
      );

      const maxPosition =
        existingProduct.productImages.length > 0
          ? Math.max(
              ...existingProduct.productImages.map((img) => img.position || 0),
            )
          : -1;

      const productImages = imageUrls.map((url, index) => ({
        productId: id,
        url: url,
        altText: `${updatedProduct.name} - Imagen ${maxPosition + index + 2}`,
        isPrimary: existingProduct.productImages.length === 0 && index === 0, // First image is primary only if no existing images
        position: maxPosition + index + 1,
      }));

      await this.prisma.productImage.createMany({
        data: productImages,
      });

      return this.prisma.product.findUnique({
        where: { id },
        include: {
          brand: true,
          category: true,
          productImages: true,
          variants: true,
        },
      });
    }

    return updatedProduct;
  }

  async removeProduct(id: string) {
    await this.findOneProduct(id);

    return this.prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async addProductImages(productId: string, images: Express.Multer.File[]) {
    const product = await this.findOneProduct(productId);

    const imageUrls = await this.supabaseService.uploadMultipleImages(
      images,
      'images',
      'products',
    );

    const maxPosition =
      product.productImages.length > 0
        ? Math.max(...product.productImages.map((img) => img.position || 0))
        : -1;

    const productImages = imageUrls.map((url, index) => ({
      productId,
      url: url,
      altText: `${product.name} - Imagen ${maxPosition + index + 2}`,
      position: maxPosition + index + 1,
    }));

    await this.prisma.productImage.createMany({
      data: productImages,
    });

    return this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        brand: true,
        category: true,
        productImages: true,
        variants: true,
      },
    });
  }

  async removeProductImage(productId: string, imageId: string) {
    await this.findOneProduct(productId);

    const productImage = await this.prisma.productImage.findFirst({
      where: { id: imageId, productId },
    });

    if (!productImage) {
      throw new NotFoundException('Imagen del producto no encontrada');
    }

    await this.supabaseService.deleteImage(productImage.url);

    await this.prisma.productImage.delete({
      where: { id: imageId },
    });

    if (productImage.isPrimary) {
      const nextImage = await this.prisma.productImage.findFirst({
        where: { productId },
        orderBy: { position: 'asc' },
      });

      if (nextImage) {
        await this.prisma.productImage.update({
          where: { id: nextImage.id },
          data: { isPrimary: true },
        });
      }
    }

    return { message: 'Imagen eliminada exitosamente' };
  }

  // Obtener productos destacados
  async getFeaturedProducts(limit: number = 12): Promise<any[]> {
    return this.prisma.product.findMany({
      where: {
        isFeatured: true,
        isActive: true,
        status: 'ACTIVE' as const,
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        brand: { select: { name: true, slug: true } },
        category: { select: { name: true, slug: true } },
        productImages: {
          where: { isPrimary: true },
          take: 1,
          select: { url: true, altText: true },
        },
        _count: {
          select: { productReviews: true },
        },
      },
    });
  }

  // Obtener productos por categoría
  async getProductsByCategory(
    categorySlug: string,
    paginationOptions: PaginationOptions,
  ): Promise<PaginatedResult<any>> {
    const {
      page = 1,
      limit = 12,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = paginationOptions;
    const offset = PaginationHelper.calculateOffset(page, limit);

    // Buscar la categoría por slug
    const category = await this.prisma.category.findUnique({
      where: { slug: categorySlug },
    });

    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }

    const where = {
      categoryId: category.id,
      isActive: true,
      status: 'ACTIVE' as const,
    };

    const [products, totalCount] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          brand: { select: { name: true, slug: true } },
          category: { select: { name: true, slug: true } },
          productImages: {
            where: { isPrimary: true },
            take: 1,
            select: { url: true, altText: true },
          },
          _count: {
            select: { productReviews: true },
          },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return PaginationHelper.createPaginatedResult(
      products,
      totalCount,
      page,
      limit,
    );
  }

  // Obtener productos relacionados
  async getRelatedProducts(
    productId: string,
    limit: number = 8,
  ): Promise<any[]> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { categoryId: true, brandId: true },
    });

    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    // Buscar productos de la misma categoría o marca, excluyendo el producto actual
    const relatedProducts = await this.prisma.product.findMany({
      where: {
        AND: [
          { id: { not: productId } },
          { isActive: true },
          { status: 'ACTIVE' as const },
          {
            OR: [
              { categoryId: product.categoryId },
              { brandId: product.brandId },
            ],
          },
        ],
      },
      take: limit,
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
      include: {
        brand: { select: { name: true, slug: true } },
        category: { select: { name: true, slug: true } },
        productImages: {
          where: { isPrimary: true },
          take: 1,
          select: { url: true, altText: true },
        },
        _count: {
          select: { productReviews: true },
        },
      },
    });

    return relatedProducts;
  }

  // Búsqueda avanzada de productos con filtros
  async searchProductsWithFilters(filters: {
    search?: string;
    categoryId?: string;
    category?: string;
    brandId?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    onSale?: boolean;
    isFeatured?: boolean;
    rating?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }): Promise<PaginatedResult<any>> {
    const {
      search,
      categoryId,
      category,
      brandId,
      brand,
      minPrice,
      maxPrice,
      inStock,
      onSale,
      isFeatured,
      rating,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 12,
    } = filters;

    const offset = PaginationHelper.calculateOffset(page, limit);
    const where: any = {
      isActive: true,
      status: 'ACTIVE' as const,
    };

    // Búsqueda por texto
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { shortDescription: { contains: search, mode: 'insensitive' } },
        { longDescription: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Filtros por categoría
    if (categoryId) {
      where.categoryId = categoryId;
    } else if (category) {
      const categoryRecord = await this.prisma.category.findUnique({
        where: { slug: category },
      });
      if (categoryRecord) {
        where.categoryId = categoryRecord.id;
      }
    }

    // Filtros por marca
    if (brandId) {
      where.brandId = brandId;
    } else if (brand) {
      const brandRecord = await this.prisma.brand.findUnique({
        where: { slug: brand },
      });
      if (brandRecord) {
        where.brandId = brandRecord.id;
      }
    }

    // Filtros por precio
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.basePrice = {};
      if (minPrice !== undefined) where.basePrice.gte = minPrice;
      if (maxPrice !== undefined) where.basePrice.lte = maxPrice;
    }

    // Filtro por productos en oferta
    if (onSale === true) {
      where.compareAtPrice = { not: null };
    }

    // Filtro por productos destacados
    if (typeof isFeatured === 'boolean') {
      where.isFeatured = isFeatured;
    }

    // Configurar ordenamiento
    let orderBy: any = { [sortBy]: sortOrder };
    if (sortBy === 'price') {
      orderBy = { basePrice: sortOrder };
    } else if (sortBy === 'featured') {
      orderBy = [{ isFeatured: 'desc' }, { createdAt: 'desc' }];
    } else if (sortBy === 'rating') {
      // Para rating necesitaremos una subconsulta más compleja
      orderBy = { createdAt: sortOrder }; // Fallback por ahora
    }

    const [products, totalCount] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy,
        include: {
          brand: { select: { name: true, slug: true } },
          category: { select: { name: true, slug: true } },
          productImages: {
            where: { isPrimary: true },
            take: 1,
            select: { url: true, altText: true },
          },
          _count: {
            select: { productReviews: true, variants: true },
          },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    // Si se requiere filtro por stock, necesitamos verificar las variantes
    let filteredProducts = products;
    if (inStock === true) {
      const stockResults = await Promise.all(
        products.map(async (product) => {
          const hasStock = await this.prisma.productVariant.findFirst({
            where: {
              productId: product.id,
              inventoryQuantity: { gt: 0 },
              isActive: true,
            },
          });
          return hasStock ? product : null;
        }),
      );
      filteredProducts = stockResults.filter(
        (product): product is NonNullable<typeof product> => product !== null,
      );
    }

    return PaginationHelper.createPaginatedResult(
      filteredProducts,
      totalCount,
      page,
      limit,
    );
  }

  // Búsqueda simple de productos
  async searchProducts(
    searchQuery: string,
    paginationOptions: PaginationOptions,
  ): Promise<PaginatedResult<any>> {
    const {
      page = 1,
      limit = 12,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = paginationOptions;
    const offset = PaginationHelper.calculateOffset(page, limit);

    const where = {
      AND: [
        { isActive: true },
        { status: 'ACTIVE' as const },
        {
          OR: [
            { name: { contains: searchQuery, mode: 'insensitive' as const } },
            {
              shortDescription: {
                contains: searchQuery,
                mode: 'insensitive' as const,
              },
            },
            {
              longDescription: {
                contains: searchQuery,
                mode: 'insensitive' as const,
              },
            },
            { sku: { contains: searchQuery, mode: 'insensitive' as const } },
          ],
        },
      ],
    };

    const [products, totalCount] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          brand: { select: { name: true, slug: true } },
          category: { select: { name: true, slug: true } },
          productImages: {
            where: { isPrimary: true },
            take: 1,
            select: { url: true, altText: true },
          },
          _count: {
            select: { productReviews: true },
          },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return PaginationHelper.createPaginatedResult(
      products,
      totalCount,
      page,
      limit,
    );
  }
}
