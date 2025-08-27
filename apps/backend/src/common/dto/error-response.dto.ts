import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({
    description: 'Código de estado HTTP',
    example: 400,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Mensaje de error principal',
    example: 'Validation failed',
  })
  message: string;

  @ApiProperty({
    description: 'Código de error específico para el frontend',
    example: 'VALIDATION_ERROR',
    required: false,
  })
  code?: string;

  @ApiProperty({
    description: 'Detalles adicionales del error',
    example: ['email must be a valid email', 'password is too short'],
    required: false,
    type: [String],
  })
  details?: string[];

  @ApiProperty({
    description: 'Timestamp del error',
    example: '2024-01-15T10:30:00.000Z',
  })
  timestamp: string;

  @ApiProperty({
    description: 'Ruta donde ocurrió el error',
    example: '/api/users/profile',
  })
  path: string;

  @ApiProperty({
    description: 'ID único del error para tracking',
    example: 'err_1234567890',
    required: false,
  })
  errorId?: string;
}

export class ValidationErrorResponseDto extends ErrorResponseDto {
  @ApiProperty({
    description: 'Errores de validación por campo',
    example: {
      email: ['must be a valid email'],
      password: ['must be at least 8 characters long'],
    },
    required: false,
  })
  fieldErrors?: Record<string, string[]>;
}

export class PrismaErrorResponseDto extends ErrorResponseDto {
  @ApiProperty({
    description: 'Código de error específico de Prisma',
    example: 'P2002',
    required: false,
  })
  prismaCode?: string;

  @ApiProperty({
    description: 'Campo que causó el error',
    example: 'email',
    required: false,
  })
  field?: string;
}
