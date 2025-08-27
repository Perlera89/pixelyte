import { IsOptional, IsString, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PreferredCurrency } from '@prisma/client';

export class CreateUserProfileDto {
  @ApiPropertyOptional({
    description:
      'URL del avatar del usuario (se genera automáticamente al subir imagen via campo "avatar")',
    example:
      'https://your-supabase-url.supabase.co/storage/v1/object/public/avatars/avatar-filename.png',
  })
  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @ApiPropertyOptional({
    description: 'Moneda preferida del usuario',
    example: 'USD',
    enum: PreferredCurrency,
  })
  @IsIn(Object.values(PreferredCurrency))
  @IsOptional()
  preferredCurrency?: PreferredCurrency;

  @ApiPropertyOptional({
    description: 'Biografía del usuario',
    example: 'Desarrollador apasionado por la tecnología',
  })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiPropertyOptional({
    description: 'Ubicación del usuario',
    example: 'Ciudad de México, México',
  })
  @IsString()
  @IsOptional()
  location?: string;
}

export class UpdateUserProfileDto {
  @ApiPropertyOptional({
    description:
      'URL del avatar del usuario (se genera automáticamente al subir imagen via campo "avatar")',
    example:
      'https://your-supabase-url.supabase.co/storage/v1/object/public/avatars/avatar-filename.png',
  })
  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @ApiPropertyOptional({
    description: 'Moneda preferida del usuario',
    example: 'USD',
    enum: PreferredCurrency,
  })
  @IsIn(Object.values(PreferredCurrency))
  @IsOptional()
  preferredCurrency?: PreferredCurrency;

  @ApiPropertyOptional({
    description: 'Biografía del usuario',
    example: 'Desarrollador apasionado por la tecnología',
  })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiPropertyOptional({
    description: 'Ubicación del usuario',
    example: 'Ciudad de México, México',
  })
  @IsString()
  @IsOptional()
  location?: string;
}
