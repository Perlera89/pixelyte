import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsDecimal,
  IsJSON,
  IsIn,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrderItemDto {
  @ApiPropertyOptional({
    description: 'ID de la variante del producto',
    example: 'uuid-variante',
  })
  @IsString()
  @IsOptional()
  variantId?: string;

  @ApiProperty({
    description: 'ID del producto',
    example: 'uuid-producto',
  })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({
    description: 'Cantidad del producto',
    example: 2,
  })
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  quantity: number;

  @ApiProperty({
    description: 'Precio unitario del producto',
    example: 1299.99,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Transform(({ value }) => parseFloat(value))
  price: number;

  @ApiProperty({
    description: 'Título del producto',
    example: 'Laptop Gaming XYZ',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    description: 'Título de la variante',
    example: '16GB RAM, 512GB SSD',
  })
  @IsString()
  @IsOptional()
  variantTitle?: string;

  @ApiPropertyOptional({
    description: 'SKU del producto',
    example: 'LAPTOP001',
  })
  @IsString()
  @IsOptional()
  sku?: string;

  @ApiPropertyOptional({
    description: 'Vendedor del producto',
    example: 'TechStore',
  })
  @IsString()
  @IsOptional()
  vendor?: string;

  @ApiPropertyOptional({
    description: 'Propiedades adicionales del producto',
    example: { color: 'negro', garantia: '2 años' },
  })
  @IsJSON()
  @IsOptional()
  properties?: any;
}

export class CreateOrderDto {
  @IsString()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsIn([
    'PENDING',
    'CONFIRMED',
    'PROCESSING',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED',
    'REFUNDED',
  ])
  @IsOptional()
  status?: string;

  @IsJSON()
  @IsNotEmpty()
  billingAddress: any;

  @IsJSON()
  @IsNotEmpty()
  shippingAddress: any;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsArray()
  @IsOptional()
  tags?: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  @IsNotEmpty()
  items: CreateOrderItemDto[];
}

export class UpdateOrderDto {
  @IsString()
  @IsIn([
    'PENDING',
    'CONFIRMED',
    'PROCESSING',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED',
    'REFUNDED',
  ])
  @IsOptional()
  status?: string;

  @IsString()
  @IsIn([
    'PENDING',
    'AUTHORIZED',
    'PAID',
    'PARTIALLY_PAID',
    'REFUNDED',
    'PARTIALLY_REFUNDED',
    'VOIDED',
  ])
  @IsOptional()
  financialStatus?: string;

  @IsString()
  @IsIn(['UNFULFILLED', 'PARTIAL', 'FULFILLED', 'CANCELLED'])
  @IsOptional()
  fulfillmentStatus?: string;

  @IsJSON()
  @IsOptional()
  billingAddress?: any;

  @IsJSON()
  @IsOptional()
  shippingAddress?: any;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsArray()
  @IsOptional()
  tags?: string[];
}
