import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsIn,
  IsJSON,
  IsOptional,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateTransactionDto {
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @IsString()
  @IsOptional()
  parentId?: string;

  @IsString()
  @IsIn(['AUTHORIZATION', 'CAPTURE', 'SALE', 'VOID', 'REFUND'])
  kind: string;

  @IsString()
  @IsNotEmpty()
  gateway: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Transform(({ value }) => parseFloat(value))
  amount: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsString()
  @IsOptional()
  gatewayTransactionId?: string;

  @IsJSON()
  @IsOptional()
  gatewayResponse?: any;
}

export class UpdateTransactionDto {
  @IsString()
  @IsIn(['PENDING', 'SUCCESS', 'FAILURE', 'ERROR', 'CANCELLED'])
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  gatewayTransactionId?: string;

  @IsJSON()
  @IsOptional()
  gatewayResponse?: any;
}
