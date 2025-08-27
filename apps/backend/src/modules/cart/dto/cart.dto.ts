import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsJSON,
  IsArray,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCartDto {
  @IsString()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsOptional()
  sessionId?: string;

  @IsString()
  @IsOptional()
  currency?: string;
}

export class AddToCartDto {
  @ApiProperty({ description: 'ID de la variante del producto' })
  @IsString()
  @IsNotEmpty()
  variantId: string;

  @ApiProperty({
    description: 'Cantidad del producto',
    minimum: 1,
    maximum: 99,
  })
  @IsNumber()
  @Min(1)
  @Max(99)
  @Transform(({ value }) => parseInt(value))
  quantity: number;

  @ApiProperty({
    description: 'Propiedades adicionales del item',
    required: false,
  })
  @IsJSON()
  @IsOptional()
  properties?: any;
}

export class UpdateCartItemDto {
  @ApiProperty({
    description: 'Nueva cantidad del producto',
    minimum: 1,
    maximum: 99,
  })
  @IsNumber()
  @Min(1)
  @Max(99)
  @Transform(({ value }) => parseInt(value))
  @IsOptional()
  quantity?: number;

  @ApiProperty({
    description: 'Propiedades adicionales del item',
    required: false,
  })
  @IsJSON()
  @IsOptional()
  properties?: any;
}

export class CartItemDto {
  @ApiProperty({ description: 'ID de la variante del producto' })
  @IsString()
  @IsNotEmpty()
  variantId: string;

  @ApiProperty({
    description: 'Cantidad del producto',
    minimum: 1,
    maximum: 99,
  })
  @IsNumber()
  @Min(1)
  @Max(99)
  quantity: number;

  @ApiProperty({
    description: 'Propiedades adicionales del item',
    required: false,
  })
  @IsJSON()
  @IsOptional()
  properties?: any;
}

export class SyncCartDto {
  @ApiProperty({
    description: 'Items del carrito local a sincronizar',
    type: [CartItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartItemDto)
  items: CartItemDto[];
}

// Legacy DTOs for backward compatibility
export class CreateCartLineItemDto extends AddToCartDto {}
export class UpdateCartLineItemDto extends UpdateCartItemDto {}
