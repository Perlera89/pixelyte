import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEmail,
  IsObject,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddressDto {
  @ApiProperty({
    description: 'País',
    example: 'Colombia',
  })
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiProperty({
    description: 'Estado o provincia',
    example: 'Cundinamarca',
  })
  @IsString()
  @IsNotEmpty()
  stateProvince: string;

  @ApiProperty({
    description: 'Ciudad',
    example: 'Bogotá',
  })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({
    description: 'Código postal',
    example: '110111',
  })
  @IsString()
  @IsNotEmpty()
  postalCode: string;

  @ApiProperty({
    description: 'Dirección principal',
    example: 'Calle 123 #45-67',
  })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiPropertyOptional({
    description: 'Línea adicional de dirección',
    example: 'Apartamento 101',
  })
  @IsString()
  @IsOptional()
  addressLine?: string;

  @ApiPropertyOptional({
    description: 'Nombre completo del destinatario',
    example: 'Juan Pérez',
  })
  @IsString()
  @IsOptional()
  fullName?: string;

  @ApiPropertyOptional({
    description: 'Teléfono de contacto',
    example: '+57 300 123 4567',
  })
  @IsString()
  @IsOptional()
  phone?: string;
}

export class PaymentMethodDto {
  @ApiProperty({
    description: 'Tipo de método de pago',
    example: 'credit_card',
    enum: [
      'credit_card',
      'debit_card',
      'paypal',
      'bank_transfer',
      'cash_on_delivery',
    ],
  })
  @IsEnum([
    'credit_card',
    'debit_card',
    'paypal',
    'bank_transfer',
    'cash_on_delivery',
  ])
  type: string;

  @ApiPropertyOptional({
    description: 'Información adicional del método de pago',
    example: { last4: '1234', brand: 'visa' },
  })
  @IsObject()
  @IsOptional()
  details?: any;
}

export class CheckoutDto {
  @ApiProperty({
    description: 'Dirección de envío',
    type: AddressDto,
  })
  @ValidateNested()
  @Type(() => AddressDto)
  @IsNotEmpty()
  shippingAddress: AddressDto;

  @ApiProperty({
    description: 'Dirección de facturación',
    type: AddressDto,
  })
  @ValidateNested()
  @Type(() => AddressDto)
  @IsNotEmpty()
  billingAddress: AddressDto;

  @ApiProperty({
    description: 'Método de pago',
    type: PaymentMethodDto,
  })
  @ValidateNested()
  @Type(() => PaymentMethodDto)
  @IsNotEmpty()
  paymentMethod: PaymentMethodDto;

  @ApiPropertyOptional({
    description: 'Notas adicionales para la orden',
    example: 'Entregar en horario de oficina',
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Email para confirmación (si es diferente al del usuario)',
    example: 'otro@email.com',
  })
  @IsEmail()
  @IsOptional()
  email?: string;
}

export class OrderSummaryDto {
  @ApiProperty({
    description: 'ID de la orden creada',
    example: 'uuid-orden',
  })
  id: string;

  @ApiProperty({
    description: 'Número de orden único',
    example: '202412250001',
  })
  orderNumber: string;

  @ApiProperty({
    description: 'Estado de la orden',
    example: 'PENDING',
  })
  status: string;

  @ApiProperty({
    description: 'Total de la orden',
    example: 1299.99,
  })
  totalPrice: number;

  @ApiProperty({
    description: 'Fecha de creación',
    example: '2024-12-25T10:30:00Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Items de la orden',
    type: 'array',
  })
  items: any[];
}
