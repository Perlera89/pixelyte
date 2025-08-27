import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  IsJSON,
  IsIn,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateInventoryLocationDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsJSON()
  @IsOptional()
  address?: any;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateInventoryLocationDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsJSON()
  @IsOptional()
  address?: any;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class CreateInventoryMovementDto {
  @IsString()
  @IsNotEmpty()
  variantId: string;

  @IsString()
  @IsNotEmpty()
  locationId: string;

  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  quantity: number;

  @IsString()
  @IsIn(['ORDER', 'SALE', 'RESTOCK', 'ADJUSTMENT', 'RETURN'])
  type: string;

  @IsString()
  @IsOptional()
  referenceId?: string;

  @IsString()
  @IsIn(['ORDER', 'ADJUSTMENT', 'RETURN'])
  @IsOptional()
  referenceType?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateInventoryLevelDto {
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  available?: number;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  committed?: number;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  onHand?: number;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  reserved?: number;
}
