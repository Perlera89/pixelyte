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
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ProductsService } from './products.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { CreateBrandDto, UpdateBrandDto } from './dto/brand.dto';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { ProductFiltersDto, ProductSearchDto } from './dto/product-filters.dto';
import { PaginationOptions } from '../../common/utils/pagination.util';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { ImageValidationPipe } from '../../common/pipes/file-validation.pipe';

@ApiTags('5. Productos')
@ApiBearerAuth()
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // =============  PRODUCTOS  =============
  @ApiTags('5. Productos')
  @Roles('ADMIN')
  @Post('add-product')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FilesInterceptor('images', 10))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Agregar un nuevo producto con imágenes',
    description: 'Crea un nuevo producto con imágenes. Requiere rol ADMIN.',
  })
  @ApiBody({
    description: 'Datos del producto con imágenes',
    schema: {
      type: 'object',
      properties: {
        sku: { type: 'string', example: 'LAPTOP001' },
        name: { type: 'string', example: 'Laptop Gaming XYZ' },
        slug: { type: 'string', example: 'laptop-gaming-xyz' },
        shortDescription: {
          type: 'string',
          example: 'Laptop para gaming de alto rendimiento',
        },
        longDescription: {
          type: 'string',
          example:
            'Laptop diseñada específicamente para gaming con las últimas tecnologías...',
        },
        brandId: { type: 'string', example: 'uuid-marca' },
        categoryId: { type: 'string', example: 'uuid-categoria' },
        basePrice: { type: 'number', example: 1299.99 },
        compareAtPrice: { type: 'number', example: 1499.99 },
        costPrice: { type: 'number', example: 800.0 },
        weight: { type: 'number', example: 2500.0 },
        dimensions: {
          type: 'object',
          example: { length: 35, width: 25, height: 3 },
        },
        requiresShipping: { type: 'boolean', example: true },
        isDigital: { type: 'boolean', example: false },
        isFeatured: { type: 'boolean', example: true },
        isActive: { type: 'boolean', example: true },
        status: {
          type: 'string',
          example: 'ACTIVE',
          enum: ['DRAFT', 'ACTIVE', 'ARCHIVED'],
        },
        seoTitle: {
          type: 'string',
          example: 'Laptop Gaming XYZ - La mejor para profesionales',
        },
        seoDescription: {
          type: 'string',
          example:
            'Descubre la laptop gaming más avanzada del mercado con las mejores especificaciones',
        },
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Archivos de imágenes del producto (máximo 10)',
        },
      },
      required: ['sku', 'name', 'slug', 'categoryId', 'basePrice'],
    },
  })
  @ApiResponse({ status: 201, description: 'Producto creado exitosamente' })
  create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFiles(new ImageValidationPipe()) images?: Express.Multer.File[],
  ) {
    return this.productsService.createProduct(createProductDto, images);
  }

  @ApiTags('5. Productos')
  @Public()
  @Get('get-all-products')
  @ApiOperation({
    summary: 'Obtener lista paginada de productos',
    description: 'Devuelve una lista paginada de productos.',
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
    description: 'Lista de productos obtenida exitosamente',
  })
  findAll(
    @Query() paginationOptions: PaginationOptions,
    @Query('searchQuery') searchQuery?: string,
  ) {
    return this.productsService.findAllProducts({
      ...paginationOptions,
      searchQuery,
    });
  }

  @ApiTags('5. Productos')
  @Public()
  @Get('featured')
  @ApiOperation({
    summary: 'Obtener productos destacados',
    description: 'Devuelve una lista de productos marcados como destacados.',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Número máximo de productos a devolver (por defecto 12)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de productos destacados obtenida exitosamente',
  })
  getFeaturedProducts(@Query('limit') limit?: number) {
    return this.productsService.getFeaturedProducts(limit ? Number(limit) : 12);
  }

  @ApiTags('5. Productos')
  @Public()
  @Get('search')
  @ApiOperation({
    summary: 'Buscar productos con filtros avanzados',
    description:
      'Busca productos aplicando múltiples filtros y opciones de ordenamiento.',
  })
  @ApiResponse({
    status: 200,
    description: 'Resultados de búsqueda obtenidos exitosamente',
  })
  searchProductsWithFilters(@Query() filters: ProductFiltersDto) {
    return this.productsService.searchProductsWithFilters(filters);
  }

  @ApiTags('5. Productos')
  @Public()
  @Get('search-simple')
  @ApiOperation({
    summary: 'Búsqueda simple de productos',
    description: 'Busca productos por término de búsqueda simple.',
  })
  @ApiQuery({
    name: 'q',
    required: true,
    description: 'Término de búsqueda',
  })
  @ApiQuery({ name: 'page', required: false, description: 'Número de página' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Elementos por página',
  })
  @ApiResponse({
    status: 200,
    description: 'Resultados de búsqueda obtenidos exitosamente',
  })
  searchProducts(@Query() searchDto: ProductSearchDto) {
    if (!searchDto.q) {
      return {
        data: [],
        totalCount: 0,
        page: 1,
        limit: 12,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      };
    }
    return this.productsService.searchProducts(searchDto.q, {
      page: searchDto.page,
      limit: searchDto.limit,
    });
  }

  @ApiTags('5. Productos')
  @Public()
  @Get('category/:categorySlug')
  @ApiOperation({
    summary: 'Obtener productos por categoría',
    description: 'Devuelve productos filtrados por slug de categoría.',
  })
  @ApiParam({
    name: 'categorySlug',
    description: 'Slug de la categoría',
    example: 'laptops',
  })
  @ApiQuery({ name: 'page', required: false, description: 'Número de página' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Elementos por página',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    description: 'Campo de ordenamiento',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    description: 'Orden (asc/desc)',
  })
  @ApiResponse({
    status: 200,
    description: 'Productos de la categoría obtenidos exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Categoría no encontrada' })
  getProductsByCategory(
    @Param('categorySlug') categorySlug: string,
    @Query() paginationOptions: PaginationOptions,
  ) {
    return this.productsService.getProductsByCategory(
      categorySlug,
      paginationOptions,
    );
  }

  @ApiTags('5. Productos')
  @Public()
  @Get('find-product/:id')
  @ApiOperation({
    summary: 'Obtener un producto por ID',
    description: 'Devuelve los datos de un producto por su ID.',
  })
  @ApiParam({ name: 'id', description: 'ID único del producto' })
  @ApiResponse({ status: 200, description: 'Producto encontrado' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  findOne(@Param('id') id: string) {
    return this.productsService.findOneProduct(id);
  }

  @ApiTags('5. Productos')
  @Public()
  @Get(':id/related')
  @ApiOperation({
    summary: 'Obtener productos relacionados',
    description:
      'Devuelve productos relacionados basados en categoría y marca.',
  })
  @ApiParam({ name: 'id', description: 'ID único del producto' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Número máximo de productos relacionados (por defecto 8)',
  })
  @ApiResponse({
    status: 200,
    description: 'Productos relacionados obtenidos exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  getRelatedProducts(@Param('id') id: string, @Query('limit') limit?: number) {
    return this.productsService.getRelatedProducts(
      id,
      limit ? Number(limit) : 8,
    );
  }

  @ApiTags('5. Productos')
  @Roles('ADMIN')
  @Patch('update-product/:id')
  @UseInterceptors(FilesInterceptor('images', 10))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Actualizar un producto con imágenes',
    description:
      'Actualiza los datos de un producto con imágenes. Requiere rol ADMIN.',
  })
  @ApiBody({
    description: 'Datos del producto a actualizar con imágenes opcionales',
    schema: {
      type: 'object',
      properties: {
        sku: { type: 'string', example: 'LAPTOP001' },
        name: { type: 'string', example: 'Laptop Gaming XYZ' },
        slug: { type: 'string', example: 'laptop-gaming-xyz' },
        shortDescription: {
          type: 'string',
          example: 'Laptop para gaming de alto rendimiento',
        },
        longDescription: {
          type: 'string',
          example:
            'Laptop diseñada específicamente para gaming con las últimas tecnologías...',
        },
        brandId: { type: 'string', example: 'uuid-marca' },
        categoryId: { type: 'string', example: 'uuid-categoria' },
        basePrice: { type: 'number', example: 1299.99 },
        compareAtPrice: { type: 'number', example: 1499.99 },
        costPrice: { type: 'number', example: 800.0 },
        weight: { type: 'number', example: 2500.0 },
        dimensions: {
          type: 'object',
          example: { length: 35, width: 25, height: 3 },
        },
        requiresShipping: { type: 'boolean', example: true },
        isDigital: { type: 'boolean', example: false },
        isFeatured: { type: 'boolean', example: true },
        isActive: { type: 'boolean', example: true },
        status: {
          type: 'string',
          example: 'ACTIVE',
          enum: ['DRAFT', 'ACTIVE', 'ARCHIVED'],
        },
        seoTitle: {
          type: 'string',
          example: 'Laptop Gaming XYZ - La mejor para profesionales',
        },
        seoDescription: {
          type: 'string',
          example:
            'Descubre la laptop gaming más avanzada del mercado con las mejores especificaciones',
        },
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description:
            'Archivos de imágenes adicionales del producto (máximo 10)',
        },
      },
    },
  })
  @ApiParam({ name: 'id', description: 'ID único del producto' })
  @ApiResponse({
    status: 200,
    description: 'Producto actualizado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFiles(new ImageValidationPipe()) images?: Express.Multer.File[],
  ) {
    return this.productsService.updateProduct(id, updateProductDto, images);
  }

  @ApiTags('5. Productos')
  @Roles('ADMIN')
  @Delete('delete-product/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar (lógico) un producto',
    description: 'Elimina lógicamente un producto. Requiere rol ADMIN.',
  })
  @ApiParam({ name: 'id', description: 'ID único del producto' })
  @ApiResponse({ status: 204, description: 'Producto eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  removeProduct(@Param('id') id: string) {
    return this.productsService.removeProduct(id);
  }

  @ApiTags('5. Productos')
  @Roles('ADMIN')
  @Post('add-product-images/:id')
  @UseInterceptors(FilesInterceptor('images', 10))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Agregar imágenes adicionales a un producto',
    description:
      'Agrega imágenes adicionales a un producto existente. Requiere rol ADMIN.',
  })
  @ApiBody({
    description: 'Imágenes adicionales para el producto',
    schema: {
      type: 'object',
      properties: {
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Archivos de imágenes adicionales (máximo 10)',
        },
      },
      required: ['images'],
    },
  })
  @ApiParam({ name: 'id', description: 'ID único del producto' })
  @ApiResponse({ status: 201, description: 'Imágenes agregadas exitosamente' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado' })
  addProductImages(
    @Param('id') id: string,
    @UploadedFiles(new ImageValidationPipe()) images: Express.Multer.File[],
  ) {
    return this.productsService.addProductImages(id, images);
  }

  @ApiTags('5. Productos')
  @Roles('ADMIN')
  @Delete('delete-product-image/:productId/:imageId')
  @ApiOperation({
    summary: 'Eliminar una imagen específica de un producto',
    description:
      'Elimina una imagen específica de un producto. Requiere rol ADMIN.',
  })
  @ApiParam({ name: 'productId', description: 'ID único del producto' })
  @ApiParam({ name: 'imageId', description: 'ID único de la imagen' })
  @ApiResponse({ status: 200, description: 'Imagen eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Producto o imagen no encontrada' })
  removeProductImage(
    @Param('productId') productId: string,
    @Param('imageId') imageId: string,
  ) {
    return this.productsService.removeProductImage(productId, imageId);
  }

  // =============  CATEGORÍAS  =============
  @ApiTags('6. Categorías')
  @Roles('ADMIN')
  @Post('add-category')
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Agregar una nueva categoría con imagen',
    description: 'Crea una nueva categoría con imagen. Requiere rol ADMIN.',
  })
  @ApiBody({
    description: 'Datos de la categoría con imagen',
    schema: {
      type: 'object',
      properties: {
        parentId: { type: 'string', example: 'uuid-categoria-padre' },
        name: { type: 'string', example: 'Laptops' },
        slug: { type: 'string', example: 'laptops' },
        description: {
          type: 'string',
          example: 'Computadoras portátiles para trabajo y gaming',
        },
        icon: { type: 'string', example: 'laptop-icon' },
        sortOrder: { type: 'number', example: 1 },
        isActive: { type: 'boolean', example: true },
        seoTitle: {
          type: 'string',
          example: 'Laptops - Las mejores computadoras portátiles',
        },
        seoDescription: {
          type: 'string',
          example:
            'Encuentra las mejores laptops para trabajo, gaming y uso personal',
        },
        image: {
          type: 'string',
          format: 'binary',
          description: 'Archivo de imagen para la categoría',
        },
      },
      required: ['name', 'slug'],
    },
  })
  @ApiResponse({ status: 201, description: 'Categoría creada exitosamente' })
  createCategory(
    @Body() createCategoryDto: CreateCategoryDto,
    @UploadedFile(new ImageValidationPipe()) image?: Express.Multer.File,
  ) {
    return this.productsService.createCategory(createCategoryDto, image);
  }

  @ApiTags('6. Categorías')
  @Get('get-all-categories')
  @ApiOperation({
    summary: 'Obtener lista paginada de categorías',
    description: 'Devuelve una lista paginada de categorías.',
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
    description: 'Lista de categorías obtenida exitosamente',
  })
  findAllCategories(
    @Query() paginationOptions: PaginationOptions,
    @Query('searchQuery') searchQuery?: string,
  ) {
    return this.productsService.findAllCategories({
      ...paginationOptions,
      searchQuery,
    });
  }

  @ApiTags('6. Categorías')
  @Get('find-category/:id')
  @ApiOperation({
    summary: 'Obtener una categoría por ID',
    description: 'Devuelve los datos de una categoría por su ID.',
  })
  @ApiParam({ name: 'id', description: 'ID único de la categoría' })
  @ApiResponse({ status: 200, description: 'Categoría encontrada' })
  @ApiResponse({ status: 404, description: 'Categoría no encontrada' })
  findOneCategory(@Param('id') id: string) {
    return this.productsService.findOneCategory(id);
  }

  @ApiTags('6. Categorías')
  @Roles('ADMIN')
  @Patch('update-category/:id')
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Actualizar una categoría con imagen',
    description:
      'Actualiza los datos de una categoría con imagen. Requiere rol ADMIN.',
  })
  @ApiBody({
    description: 'Datos de la categoría a actualizar con imagen opcional',
    schema: {
      type: 'object',
      properties: {
        parentId: { type: 'string', example: 'uuid-categoria-padre' },
        name: { type: 'string', example: 'Laptops' },
        slug: { type: 'string', example: 'laptops' },
        description: {
          type: 'string',
          example: 'Computadoras portátiles para trabajo y gaming',
        },
        icon: { type: 'string', example: 'laptop-icon' },
        sortOrder: { type: 'number', example: 1 },
        isActive: { type: 'boolean', example: true },
        seoTitle: {
          type: 'string',
          example: 'Laptops - Las mejores computadoras portátiles',
        },
        seoDescription: {
          type: 'string',
          example:
            'Encuentra las mejores laptops para trabajo, gaming y uso personal',
        },
        image: {
          type: 'string',
          format: 'binary',
          description: 'Archivo de imagen para actualizar la categoría',
        },
      },
    },
  })
  @ApiParam({ name: 'id', description: 'ID único de la categoría' })
  @ApiResponse({
    status: 200,
    description: 'Categoría actualizada exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Categoría no encontrada' })
  updateCategory(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @UploadedFile(new ImageValidationPipe()) image?: Express.Multer.File,
  ) {
    return this.productsService.updateCategory(id, updateCategoryDto, image);
  }

  @ApiTags('6. Categorías')
  @Roles('ADMIN')
  @Delete('delete-category/:id')
  @ApiOperation({
    summary: 'Eliminar (lógico) una categoría',
    description: 'Elimina lógicamente una categoría. Requiere rol ADMIN.',
  })
  @ApiParam({ name: 'id', description: 'ID único de la categoría' })
  @ApiResponse({ status: 204, description: 'Categoría eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Categoría no encontrada' })
  removeCategory(@Param('id') id: string) {
    return this.productsService.removeCategory(id);
  }

  // =============  MARCAS  =============
  @ApiTags('7. Marcas')
  @Roles('ADMIN')
  @Post('add-brand')
  @UseInterceptors(FileInterceptor('logo'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Agregar una nueva marca con logo',
    description: 'Crea una nueva marca con logo. Requiere rol ADMIN.',
  })
  @ApiBody({
    description: 'Datos de la marca con logo',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Nike' },
        slug: { type: 'string', example: 'nike' },
        description: {
          type: 'string',
          example:
            'Marca deportiva estadounidense especializada en calzado, ropa y accesorios deportivos',
        },
        websiteUrl: { type: 'string', example: 'https://www.nike.com' },
        isActive: { type: 'boolean', example: true },
        logo: {
          type: 'string',
          format: 'binary',
          description: 'Archivo de imagen para el logo de la marca',
        },
      },
      required: ['name', 'slug'],
    },
  })
  @ApiResponse({ status: 201, description: 'Marca creada exitosamente' })
  createBrand(
    @Body() createBrandDto: CreateBrandDto,
    @UploadedFile(new ImageValidationPipe()) logo?: Express.Multer.File,
  ) {
    return this.productsService.createBrand(createBrandDto, logo);
  }

  @ApiTags('7. Marcas')
  @Get('get-all-brands')
  @ApiOperation({
    summary: 'Obtener lista paginada de marcas',
    description: 'Devuelve una lista paginada de marcas.',
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
    description: 'Lista de marcas obtenida exitosamente',
  })
  findAllBrands(
    @Query() paginationOptions: PaginationOptions,
    @Query('searchQuery') searchQuery?: string,
  ) {
    return this.productsService.findAllBrands({
      ...paginationOptions,
      searchQuery,
    });
  }

  @ApiTags('7. Marcas')
  @Get('find-brand/:id')
  @ApiOperation({
    summary: 'Obtener una marca por ID',
    description: 'Devuelve los datos de una marca por su ID.',
  })
  @ApiParam({ name: 'id', description: 'ID único de la marca' })
  @ApiResponse({ status: 200, description: 'Marca encontrada' })
  @ApiResponse({ status: 404, description: 'Marca no encontrada' })
  findOneBrand(@Param('id') id: string) {
    return this.productsService.findOneBrand(id);
  }

  @ApiTags('7. Marcas')
  @Roles('ADMIN')
  @Patch('update-brand/:id')
  @UseInterceptors(FileInterceptor('logo'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Actualizar una marca con logo',
    description:
      'Actualiza los datos de una marca con logo. Requiere rol ADMIN.',
  })
  @ApiBody({
    description: 'Datos de la marca a actualizar con logo opcional',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Nike' },
        slug: { type: 'string', example: 'nike' },
        description: {
          type: 'string',
          example:
            'Marca deportiva estadounidense especializada en calzado, ropa y accesorios deportivos',
        },
        websiteUrl: { type: 'string', example: 'https://www.nike.com' },
        isActive: { type: 'boolean', example: true },
        logo: {
          type: 'string',
          format: 'binary',
          description: 'Archivo de imagen para actualizar el logo de la marca',
        },
      },
    },
  })
  @ApiParam({ name: 'id', description: 'ID único de la marca' })
  @ApiResponse({ status: 200, description: 'Marca actualizada exitosamente' })
  @ApiResponse({ status: 404, description: 'Marca no encontrada' })
  updateBrand(
    @Param('id') id: string,
    @Body() updateBrandDto: UpdateBrandDto,
    @UploadedFile(new ImageValidationPipe()) logo?: Express.Multer.File,
  ) {
    return this.productsService.updateBrand(id, updateBrandDto, logo);
  }

  @ApiTags('7. Marcas')
  @Roles('ADMIN')
  @Delete('delete-brand/:id')
  @ApiOperation({
    summary: 'Eliminar (lógico) una marca',
    description: 'Elimina lógicamente una marca. Requiere rol ADMIN.',
  })
  @ApiParam({ name: 'id', description: 'ID único de la marca' })
  @ApiResponse({ status: 204, description: 'Marca eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Marca no encontrada' })
  removeBrand(@Param('id') id: string) {
    return this.productsService.removeBrand(id);
  }
}
