import { IsEmail, IsOptional, IsString, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCurrentUserDto {
  @ApiPropertyOptional({
    description: 'Email del usuario',
    example: 'nuevo@ejemplo.com',
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    description: 'Nombres del usuario',
    example: 'Juan Carlos',
  })
  @IsString()
  @IsOptional()
  names?: string;

  @ApiPropertyOptional({
    description: 'Apellidos del usuario',
    example: 'Pérez González',
  })
  @IsString()
  @IsOptional()
  surnames?: string;

  @ApiPropertyOptional({
    description: 'Número de teléfono del usuario',
    example: '+1234567890',
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Fecha de nacimiento del usuario',
    example: '1990-01-01',
  })
  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;
}
