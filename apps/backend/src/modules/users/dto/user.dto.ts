import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsPhoneNumber,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'Email del usuario',
    example: 'usuario@ejemplo.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Nombres del usuario',
    example: 'Juan Carlos',
  })
  @IsString()
  @IsNotEmpty()
  names: string;

  @ApiProperty({
    description: 'Apellidos del usuario',
    example: 'Pérez González',
  })
  @IsString()
  @IsNotEmpty()
  surnames: string;

  @ApiPropertyOptional({
    description: 'Número de teléfono del usuario',
    example: '+1234567890',
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({
    description: 'Contraseña del usuario',
    example: 'contraseña123',
    minLength: 6,
  })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiPropertyOptional({
    description: 'Fecha de nacimiento del usuario',
    example: '1990-01-01',
  })
  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;
}

export class UpdateUserDto {
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

export class UserResponseDto {
  @ApiProperty({
    description: 'ID único del usuario',
    example: 'uuid-123456',
  })
  id: string;

  @ApiProperty({
    description: 'Email del usuario',
    example: 'usuario@ejemplo.com',
  })
  email: string;

  @ApiProperty({
    description: 'Nombres del usuario',
    example: 'Juan Carlos',
  })
  names: string;

  @ApiProperty({
    description: 'Apellidos del usuario',
    example: 'Pérez González',
  })
  surnames: string;

  @ApiPropertyOptional({
    description: 'Número de teléfono del usuario',
    example: '+1234567890',
  })
  phone?: string;

  @ApiPropertyOptional({
    description: 'Fecha de nacimiento del usuario',
  })
  dateOfBirth?: Date;

  @ApiProperty({
    description: 'Estado de verificación del email',
    example: false,
  })
  emailVerified: boolean;

  @ApiProperty({
    description: 'Rol del usuario en el sistema',
    example: 'USER',
  })
  role: string;

  @ApiProperty({
    description: 'Estado activo del usuario',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Fecha de creación del usuario',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de última actualización del usuario',
  })
  updatedAt: Date;
}
