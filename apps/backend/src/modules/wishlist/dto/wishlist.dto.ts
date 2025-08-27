import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class AddToWishlistDto {
  @ApiProperty({ description: 'ID del producto' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({
    description: 'ID de la variante del producto (opcional)',
    required: false,
  })
  @IsString()
  @IsOptional()
  variantId?: string;
}

export class WishlistItemDto {
  @ApiProperty({ description: 'ID del producto' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({
    description: 'ID de la variante del producto (opcional)',
    required: false,
  })
  @IsString()
  @IsOptional()
  variantId?: string;
}

export class SyncWishlistDto {
  @ApiProperty({
    description: 'Items de la wishlist local a sincronizar',
    type: [WishlistItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WishlistItemDto)
  items: WishlistItemDto[];
}

export class RemoveFromWishlistDto {
  @ApiProperty({ description: 'ID del producto a eliminar' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({
    description: 'ID de la variante del producto (opcional)',
    required: false,
  })
  @IsString()
  @IsOptional()
  variantId?: string;
}
