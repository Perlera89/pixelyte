import { IsNotEmpty, IsOptional, IsString, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserAddressDto {
  @ApiProperty({
    description: 'País de la dirección',
    example: 'México',
  })
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiProperty({
    description: 'Estado o provincia de la dirección',
    example: 'Ciudad de México',
  })
  @IsString()
  @IsNotEmpty()
  stateProvice: string;

  @ApiProperty({
    description: 'Ciudad de la dirección',
    example: 'Coyoacán',
  })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({
    description: 'Código postal de la dirección',
    example: '06100',
  })
  @IsString()
  @IsNotEmpty()
  postalCode: string;

  @ApiProperty({
    description: 'Dirección principal',
    example: 'Av. Reforma 123',
  })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiPropertyOptional({
    description: 'Línea adicional de dirección',
    example: 'Apartamento 4B',
  })
  @IsString()
  @IsOptional()
  addressLine?: string;

  @ApiPropertyOptional({
    description: 'Indica si es la dirección por defecto',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}

export class UpdateUserAddressDto {
  @ApiPropertyOptional({
    description: 'País de la dirección',
    example: 'México',
  })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional({
    description: 'Estado o provincia de la dirección',
    example: 'Ciudad de México',
  })
  @IsString()
  @IsOptional()
  stateProvice?: string;

  @ApiPropertyOptional({
    description: 'Ciudad de la dirección',
    example: 'Coyoacán',
  })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({
    description: 'Código postal de la dirección',
    example: '06100',
  })
  @IsString()
  @IsOptional()
  postalCode?: string;

  @ApiPropertyOptional({
    description: 'Dirección principal',
    example: 'Av. Reforma 123',
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({
    description: 'Línea adicional de dirección',
    example: 'Apartamento 4B',
  })
  @IsString()
  @IsOptional()
  addressLine?: string;

  @ApiPropertyOptional({
    description: 'Indica si es la dirección por defecto',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
