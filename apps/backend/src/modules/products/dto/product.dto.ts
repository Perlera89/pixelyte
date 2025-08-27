import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
  IsNumber,
  IsIn,
  IsJSON,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({
    description: 'SKU único del producto',
    example: 'LAPTOP001',
  })
  @IsString()
  @IsNotEmpty()
  sku: string;

  @ApiProperty({
    description: 'Nombre del producto',
    example: 'Laptop Gaming XYZ',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Slug del producto para URLs amigables',
    example: 'laptop-gaming-xyz',
  })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiPropertyOptional({
    description: 'Descripción corta del producto',
    example: 'Laptop para gaming de alto rendimiento',
  })
  @IsString()
  @IsOptional()
  shortDescription?: string;

  @ApiPropertyOptional({
    description: 'Descripción larga del producto',
    example:
      'Laptop diseñada específicamente para gaming con las últimas tecnologías...',
  })
  @IsString()
  @IsOptional()
  longDescription?: string;

  @ApiPropertyOptional({
    description: 'ID de la marca del producto',
    example: 'uuid-marca',
  })
  @IsString()
  @IsOptional()
  brandId?: string;

  @ApiProperty({
    description: 'ID de la categoría del producto',
    example: 'uuid-categoria',
  })
  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({
    description: 'Precio base del producto',
    example: 1299.99,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Transform(({ value }) => parseFloat(value))
  basePrice: number;

  @ApiPropertyOptional({
    description: 'Precio de comparación (precio original)',
    example: 1499.99,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  @Transform(({ value }) => (value ? parseFloat(value) : undefined))
  compareAtPrice?: number;

  @ApiPropertyOptional({
    description: 'Precio de costo del producto',
    example: 800.0,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  @Transform(({ value }) => (value ? parseFloat(value) : undefined))
  costPrice?: number;

  @ApiPropertyOptional({
    description: 'Peso del producto en gramos',
    example: 2500.0,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  @Transform(({ value }) => (value ? parseFloat(value) : undefined))
  weight?: number;

  @ApiPropertyOptional({
    description: 'Dimensiones del producto en formato JSON',
    example: { length: 35, width: 25, height: 3 },
  })
  @IsJSON()
  @IsOptional()
  dimensions?: any;

  @ApiPropertyOptional({
    description: 'Indica si el producto requiere envío físico',
    example: true,
  })
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean()
  @IsOptional()
  requiresShipping?: boolean;

  @ApiPropertyOptional({
    description: 'Indica si el producto es digital',
    example: false,
  })
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean()
  @IsOptional()
  isDigital?: boolean;

  @ApiPropertyOptional({
    description: 'Indica si el producto está destacado',
    example: true,
  })
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @ApiPropertyOptional({
    description: 'Indica si el producto está activo',
    example: true,
  })
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Estado del producto',
    example: 'ACTIVE',
    enum: ['DRAFT', 'ACTIVE', 'ARCHIVED'],
  })
  @IsString()
  @IsIn(['DRAFT', 'ACTIVE', 'ARCHIVED'])
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({
    description: 'Título SEO del producto',
    example: 'Laptop Gaming XYZ - La mejor para profesionales',
  })
  @IsString()
  @IsOptional()
  seoTitle?: string;

  @ApiPropertyOptional({
    description: 'Descripción SEO del producto',
    example:
      'Descubre la laptop gaming más avanzada del mercado con las mejores especificaciones',
  })
  @IsString()
  @IsOptional()
  seoDescription?: string;
}

export class UpdateProductDto {
  @ApiPropertyOptional({
    description: 'SKU único del producto',
    example: 'LAPTOP001',
  })
  @IsString()
  @IsOptional()
  sku?: string;

  @ApiPropertyOptional({
    description: 'Nombre del producto',
    example: 'Laptop Gaming XYZ',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'Slug del producto para URLs amigables',
    example: 'laptop-gaming-xyz',
  })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiPropertyOptional({
    description: 'Descripción corta del producto',
    example: 'Laptop para gaming de alto rendimiento',
  })
  @IsString()
  @IsOptional()
  shortDescription?: string;

  @ApiPropertyOptional({
    description: 'Descripción larga del producto',
    example:
      'Laptop diseñada específicamente para gaming con las últimas tecnologías...',
  })
  @IsString()
  @IsOptional()
  longDescription?: string;

  @ApiPropertyOptional({
    description: 'ID de la marca del producto',
    example: 'uuid-marca',
  })
  @IsString()
  @IsOptional()
  brandId?: string;

  @ApiPropertyOptional({
    description: 'ID de la categoría del producto',
    example: 'uuid-categoria',
  })
  @IsString()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({
    description: 'Precio base del producto',
    example: 1299.99,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  @Transform(({ value }) => (value ? parseFloat(value) : undefined))
  basePrice?: number;

  @ApiPropertyOptional({
    description: 'Precio de comparación (precio original)',
    example: 1499.99,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  @Transform(({ value }) => (value ? parseFloat(value) : undefined))
  compareAtPrice?: number;

  @ApiPropertyOptional({
    description: 'Precio de costo del producto',
    example: 800.0,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  @Transform(({ value }) => (value ? parseFloat(value) : undefined))
  costPrice?: number;

  @ApiPropertyOptional({
    description: 'Peso del producto en gramos',
    example: 2500.0,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  @Transform(({ value }) => (value ? parseFloat(value) : undefined))
  weight?: number;

  @ApiPropertyOptional({
    description: 'Dimensiones del producto en formato JSON',
    example: { length: 35, width: 25, height: 3 },
  })
  @IsJSON()
  @IsOptional()
  dimensions?: any;

  @ApiPropertyOptional({
    description: 'Indica si el producto requiere envío físico',
    example: true,
  })
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean()
  @IsOptional()
  requiresShipping?: boolean;

  @ApiPropertyOptional({
    description: 'Indica si el producto es digital',
    example: false,
  })
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean()
  @IsOptional()
  isDigital?: boolean;

  @ApiPropertyOptional({
    description: 'Indica si el producto está destacado',
    example: true,
  })
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @ApiPropertyOptional({
    description: 'Indica si el producto está activo',
    example: true,
  })
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Estado del producto',
    example: 'ACTIVE',
    enum: ['DRAFT', 'ACTIVE', 'ARCHIVED'],
  })
  @IsString()
  @IsIn(['DRAFT', 'ACTIVE', 'ARCHIVED'])
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({
    description: 'Título SEO del producto',
    example: 'Laptop Gaming XYZ - La mejor para profesionales',
  })
  @IsString()
  @IsOptional()
  seoTitle?: string;

  @ApiPropertyOptional({
    description: 'Descripción SEO del producto',
    example:
      'Descubre la laptop gaming más avanzada del mercado con las mejores especificaciones',
  })
  @IsString()
  @IsOptional()
  seoDescription?: string;
}
