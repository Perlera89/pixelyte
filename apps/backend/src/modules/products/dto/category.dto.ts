import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBoolean,
  IsNumber,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiPropertyOptional({
    description: 'ID de la categoría padre (para subcategorías)',
    example: 'uuid-categoria-padre',
  })
  @Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) return undefined;
    return value;
  })
  @IsString()
  @IsOptional()
  parentId?: string;

  @ApiProperty({
    description: 'Nombre de la categoría',
    example: 'Laptops',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Slug de la categoría para URLs amigables',
    example: 'laptops',
  })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiPropertyOptional({
    description: 'Descripción de la categoría',
    example: 'Computadoras portátiles para trabajo y gaming',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description:
      'URL de la imagen de la categoría (se genera automáticamente al subir imagen via campo "image")',
    example:
      'https://your-supabase-url.supabase.co/storage/v1/object/public/categories/image-filename.png',
  })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiPropertyOptional({
    description: 'Icono de la categoría',
    example: 'laptop-icon',
  })
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiPropertyOptional({
    description: 'Orden de visualización de la categoría',
    example: 1,
  })
  @Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) return undefined;
    const num = Number(value);
    return isNaN(num) ? value : num;
  })
  @IsNumber()
  @IsOptional()
  sortOrder?: number;

  @ApiPropertyOptional({
    description: 'Indica si la categoría está activa',
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
    description: 'Título SEO de la categoría',
    example: 'Laptops - Las mejores computadoras portátiles',
  })
  @IsString()
  @IsOptional()
  seoTitle?: string;

  @ApiPropertyOptional({
    description: 'Descripción SEO de la categoría',
    example:
      'Encuentra las mejores laptops para trabajo, gaming y uso personal',
  })
  @IsString()
  @IsOptional()
  seoDescription?: string;
}

export class UpdateCategoryDto {
  @ApiPropertyOptional({
    description: 'ID de la categoría padre (para subcategorías)',
    example: 'uuid-categoria-padre',
  })
  @Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) return undefined;
    return value;
  })
  @IsString()
  @IsOptional()
  parentId?: string;

  @ApiPropertyOptional({
    description: 'Nombre de la categoría',
    example: 'Laptops',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'Slug de la categoría para URLs amigables',
    example: 'laptops',
  })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiPropertyOptional({
    description: 'Descripción de la categoría',
    example: 'Computadoras portátiles para trabajo y gaming',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description:
      'URL de la imagen de la categoría (se genera automáticamente al subir imagen via campo "image")',
    example:
      'https://your-supabase-url.supabase.co/storage/v1/object/public/categories/image-filename.png',
  })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiPropertyOptional({
    description: 'Icono de la categoría',
    example: 'laptop-icon',
  })
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiPropertyOptional({
    description: 'Orden de visualización de la categoría',
    example: 1,
  })
  @Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) return undefined;
    const num = Number(value);
    return isNaN(num) ? value : num;
  })
  @IsNumber()
  @IsOptional()
  sortOrder?: number;

  @ApiPropertyOptional({
    description: 'Indica si la categoría está activa',
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
    description: 'Título SEO de la categoría',
    example: 'Laptops - Las mejores computadoras portátiles',
  })
  @IsString()
  @IsOptional()
  seoTitle?: string;

  @ApiPropertyOptional({
    description: 'Descripción SEO de la categoría',
    example:
      'Encuentra las mejores laptops para trabajo, gaming y uso personal',
  })
  @IsString()
  @IsOptional()
  seoDescription?: string;
}
