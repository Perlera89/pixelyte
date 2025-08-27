import { IsNotEmpty, IsOptional, IsString, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBrandDto {
  @ApiProperty({
    description: 'Nombre de la marca',
    example: 'Nike',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Identificador único de la marca (URL-friendly)',
    example: 'nike',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiPropertyOptional({
    description: 'Descripción de la marca',
    example:
      'Marca deportiva estadounidense especializada en calzado, ropa y accesorios deportivos',
    type: String,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description:
      'URL del logo de la marca (se genera automáticamente al subir imagen via campo "logo")',
    example:
      'https://your-supabase-url.supabase.co/storage/v1/object/public/brands/logo-filename.png',
    type: String,
  })
  @IsString()
  @IsOptional()
  logoUrl?: string;

  @ApiPropertyOptional({
    description: 'URL del sitio web oficial de la marca',
    example: 'https://www.nike.com',
    type: String,
  })
  @IsString()
  @IsOptional()
  websiteUrl?: string;

  @ApiPropertyOptional({
    description: 'Estado activo/inactivo de la marca',
    example: true,
    type: Boolean,
    default: true,
  })
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateBrandDto {
  @ApiPropertyOptional({
    description: 'Nombre de la marca',
    example: 'Nike',
    type: String,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'Identificador único de la marca (URL-friendly)',
    example: 'nike',
    type: String,
  })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiPropertyOptional({
    description: 'Descripción de la marca',
    example:
      'Marca deportiva estadounidense especializada en calzado, ropa y accesorios deportivos',
    type: String,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description:
      'URL del logo de la marca (se genera automáticamente al subir imagen via campo "logo")',
    example:
      'https://your-supabase-url.supabase.co/storage/v1/object/public/brands/logo-filename.png',
    type: String,
  })
  @IsString()
  @IsOptional()
  logoUrl?: string;

  @ApiPropertyOptional({
    description: 'URL del sitio web oficial de la marca',
    example: 'https://www.nike.com',
    type: String,
  })
  @IsString()
  @IsOptional()
  websiteUrl?: string;

  @ApiPropertyOptional({
    description: 'Estado activo/inactivo de la marca',
    example: true,
    type: Boolean,
  })
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
