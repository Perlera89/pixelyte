import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsDateString,
  IsPhoneNumber,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Email del usuario',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'John',
    description: 'Nombres del usuario',
  })
  @IsString()
  names: string;

  @ApiProperty({
    example: 'Doe',
    description: 'Apellidos del usuario',
  })
  @IsString()
  surnames: string;

  @ApiProperty({
    example: 'password123',
    description: 'Contraseña del usuario (mínimo 6 caracteres)',
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    example: '+1234567890',
    description: 'Teléfono del usuario',
    required: false,
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    example: '1990-01-01',
    description: 'Fecha de nacimiento del usuario',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;
}

export class LoginDto {
  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'Email del usuario',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'Contraseña del usuario',
  })
  @IsString()
  password: string;
}

export class AuthResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Token de acceso JWT',
  })
  token: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Token de refresco JWT',
  })
  refreshToken: string;

  @ApiProperty({
    example: true,
    description: 'Indica si el usuario está autenticado',
  })
  isAuthenticated: boolean;

  @ApiProperty({
    description: 'Información del usuario',
  })
  user: {
    id: string;
    email: string;
    names: string;
    surnames: string;
    role: string;
  };
}

export class RefreshTokenDto {
  @ApiProperty({
    example: 'refresh-token',
    description: 'Token de refresh',
  })
  @IsString()
  refreshToken: string;
}

export class ValidateTokenResponseDto {
  @ApiProperty({
    example: true,
    description: 'Indica si el token es válido',
  })
  isValid: boolean;

  @ApiProperty({
    description: 'Información del usuario (si el token es válido)',
  })
  user?: {
    id: string;
    email: string;
    role: string;
  };
}
