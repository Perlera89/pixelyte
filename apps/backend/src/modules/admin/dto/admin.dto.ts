import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsEnum,
  IsDecimal,
  IsArray,
  ValidateNested,
  Min,
  Max,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus, ProductStatus } from '@prisma/client';

// Dashboard DTOs
export class DashboardMetricsDto {
  @ApiProperty({ description: 'Total de ventas del período' })
  totalSales: number;

  @ApiProperty({ description: 'Total de órdenes del período' })
  totalOrders: number;

  @ApiProperty({ description: 'Total de productos activos' })
  totalProducts: number;

  @ApiProperty({ description: 'Total de usuarios registrados' })
  totalUsers: number;

  @ApiProperty({ description: 'Ventas del mes actual' })
  monthlySales: number;

  @ApiProperty({ description: 'Órdenes del mes actual' })
  monthlyOrders: number;

  @ApiProperty({ description: 'Productos con stock bajo' })
  lowStockProducts: number;

  @ApiProperty({ description: 'Órdenes pendientes' })
  pendingOrders: number;

  @ApiProperty({ description: 'Total de categorías activas' })
  totalCategories: number;
}

export class SalesChartDataDto {
  @ApiProperty({ description: 'Fecha' })
  date: string;

  @ApiProperty({ description: 'Ventas del día' })
  sales: number;

  @ApiProperty({ description: 'Órdenes del día' })
  orders: number;
}

// Product Management DTOs
export class CreateProductDto {
  @ApiProperty({ description: 'SKU del producto' })
  @IsString()
  sku: string;

  @ApiProperty({ description: 'Nombre del producto' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Slug del producto' })
  @IsString()
  slug: string;

  @ApiProperty({ description: 'Descripción corta', required: false })
  @IsOptional()
  @IsString()
  shortDescription?: string;

  @ApiProperty({ description: 'Descripción larga', required: false })
  @IsOptional()
  @IsString()
  longDescription?: string;

  @ApiProperty({ description: 'ID de la marca', required: false })
  @IsOptional()
  @IsUUID()
  brandId?: string;

  @ApiProperty({ description: 'ID de la categoría' })
  @IsUUID()
  categoryId: string;

  @ApiProperty({ description: 'Precio base' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  basePrice: number;

  @ApiProperty({ description: 'Precio de comparación', required: false })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  compareAtPrice?: number;

  @ApiProperty({ description: 'Precio de costo', required: false })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  costPrice?: number;

  @ApiProperty({ description: 'Peso del producto', required: false })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  weight?: number;

  @ApiProperty({ description: 'Requiere envío', default: true })
  @IsOptional()
  @IsBoolean()
  requiresShipping?: boolean;

  @ApiProperty({ description: 'Es producto digital', default: false })
  @IsOptional()
  @IsBoolean()
  isDigital?: boolean;

  @ApiProperty({ description: 'Es producto destacado', default: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiProperty({ description: 'Está activo', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: 'Estado del producto', enum: ProductStatus })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @ApiProperty({ description: 'Título SEO', required: false })
  @IsOptional()
  @IsString()
  seoTitle?: string;

  @ApiProperty({ description: 'Descripción SEO', required: false })
  @IsOptional()
  @IsString()
  seoDescription?: string;
}

export class UpdateProductDto {
  @ApiProperty({ description: 'Nombre del producto', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Descripción corta', required: false })
  @IsOptional()
  @IsString()
  shortDescription?: string;

  @ApiProperty({ description: 'Descripción larga', required: false })
  @IsOptional()
  @IsString()
  longDescription?: string;

  @ApiProperty({ description: 'ID de la marca', required: false })
  @IsOptional()
  @IsUUID()
  brandId?: string;

  @ApiProperty({ description: 'ID de la categoría', required: false })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiProperty({ description: 'Precio base', required: false })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  basePrice?: number;

  @ApiProperty({ description: 'Precio de comparación', required: false })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  compareAtPrice?: number;

  @ApiProperty({ description: 'Precio de costo', required: false })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  costPrice?: number;

  @ApiProperty({ description: 'Peso del producto', required: false })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  weight?: number;

  @ApiProperty({ description: 'Requiere envío', required: false })
  @IsOptional()
  @IsBoolean()
  requiresShipping?: boolean;

  @ApiProperty({ description: 'Es producto digital', required: false })
  @IsOptional()
  @IsBoolean()
  isDigital?: boolean;

  @ApiProperty({ description: 'Es producto destacado', required: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiProperty({ description: 'Está activo', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    description: 'Estado del producto',
    enum: ProductStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @ApiProperty({ description: 'Título SEO', required: false })
  @IsOptional()
  @IsString()
  seoTitle?: string;

  @ApiProperty({ description: 'Descripción SEO', required: false })
  @IsOptional()
  @IsString()
  seoDescription?: string;
}

// Order Management DTOs
export class UpdateOrderStatusDto {
  @ApiProperty({ description: 'Nuevo estado de la orden', enum: OrderStatus })
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @ApiProperty({ description: 'Notas adicionales', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

// User Management DTOs
export class UpdateUserStatusDto {
  @ApiProperty({ description: 'Estado activo del usuario' })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({ description: 'Razón del cambio', required: false })
  @IsOptional()
  @IsString()
  reason?: string;
}

// Category Management DTOs
export class CreateCategoryDto {
  @ApiProperty({ description: 'ID de la categoría padre', required: false })
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @ApiProperty({ description: 'Nombre de la categoría' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Slug de la categoría' })
  @IsString()
  slug: string;

  @ApiProperty({ description: 'Descripción de la categoría', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'URL de la imagen', required: false })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({ description: 'Icono de la categoría', required: false })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({ description: 'Orden de clasificación', default: 0 })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @ApiProperty({ description: 'Está activa', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: 'Título SEO', required: false })
  @IsOptional()
  @IsString()
  seoTitle?: string;

  @ApiProperty({ description: 'Descripción SEO', required: false })
  @IsOptional()
  @IsString()
  seoDescription?: string;
}

export class UpdateCategoryDto {
  @ApiProperty({ description: 'ID de la categoría padre', required: false })
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @ApiProperty({ description: 'Nombre de la categoría', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Slug de la categoría', required: false })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiProperty({ description: 'Descripción de la categoría', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'URL de la imagen', required: false })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({ description: 'Icono de la categoría', required: false })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({ description: 'Orden de clasificación', required: false })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @ApiProperty({ description: 'Está activa', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: 'Título SEO', required: false })
  @IsOptional()
  @IsString()
  seoTitle?: string;

  @ApiProperty({ description: 'Descripción SEO', required: false })
  @IsOptional()
  @IsString()
  seoDescription?: string;
}

// Brand Management DTOs
export class CreateBrandDto {
  @ApiProperty({ description: 'Nombre de la marca' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Slug de la marca' })
  @IsString()
  slug: string;

  @ApiProperty({ description: 'Descripción de la marca', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'URL del logo', required: false })
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiProperty({ description: 'URL del sitio web', required: false })
  @IsOptional()
  @IsString()
  websiteUrl?: string;

  @ApiProperty({ description: 'Está activa', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateBrandDto {
  @ApiProperty({ description: 'Nombre de la marca', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Slug de la marca', required: false })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiProperty({ description: 'Descripción de la marca', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'URL del logo', required: false })
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiProperty({ description: 'URL del sitio web', required: false })
  @IsOptional()
  @IsString()
  websiteUrl?: string;

  @ApiProperty({ description: 'Está activa', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

// Query DTOs
export class AdminProductsQueryDto {
  @ApiProperty({ description: 'Página', required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Límite por página',
    required: false,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiProperty({ description: 'Buscar por nombre o SKU', required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ description: 'Filtrar por categoría', required: false })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiProperty({ description: 'Filtrar por marca', required: false })
  @IsOptional()
  @IsUUID()
  brandId?: string;

  @ApiProperty({
    description: 'Filtrar por estado',
    enum: ProductStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @ApiProperty({ description: 'Filtrar por activo', required: false })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;
}

export class AdminOrdersQueryDto {
  @ApiProperty({ description: 'Página', required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Límite por página',
    required: false,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiProperty({
    description: 'Filtrar por estado',
    enum: OrderStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiProperty({
    description: 'Buscar por número de orden o email',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ description: 'Fecha desde (YYYY-MM-DD)', required: false })
  @IsOptional()
  @IsString()
  dateFrom?: string;

  @ApiProperty({ description: 'Fecha hasta (YYYY-MM-DD)', required: false })
  @IsOptional()
  @IsString()
  dateTo?: string;
}

export class AdminUsersQueryDto {
  @ApiProperty({ description: 'Página', required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Límite por página',
    required: false,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiProperty({ description: 'Buscar por nombre o email', required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ description: 'Filtrar por activo', required: false })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    description: 'Filtrar por rol',
    enum: ['USER', 'ADMIN'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['USER', 'ADMIN'])
  role?: 'USER' | 'ADMIN';
}
