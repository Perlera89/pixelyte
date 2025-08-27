import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Ejemplos de autenticación JWT para Swagger
 */

export class JwtTokenExampleDto {
  @ApiProperty({
    description: 'Token JWT de acceso',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1dWlkLXVzdWFyaW8iLCJlbWFpbCI6InVzdWFyaW9AZWplbXBsby5jb20iLCJyb2xlIjoiVVNFUiIsImlhdCI6MTcwNTMxNzYwMCwiZXhwIjoxNzA1NDA0MDAwfQ.example-signature',
    format: 'JWT',
  })
  access_token: string;

  @ApiProperty({
    description: 'Tipo de token',
    example: 'Bearer',
  })
  token_type: string;

  @ApiProperty({
    description: 'Tiempo de expiración en segundos',
    example: 86400,
  })
  expires_in: number;

  @ApiPropertyOptional({
    description: 'Token de renovación',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1dWlkLXVzdWFyaW8iLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTcwNTMxNzYwMCwiZXhwIjoxNzA2MTgyNDAwfQ.refresh-signature',
    format: 'JWT',
  })
  refresh_token?: string;
}

export class JwtPayloadExampleDto {
  @ApiProperty({
    description: 'Subject - ID del usuario',
    example: 'uuid-usuario',
  })
  sub: string;

  @ApiProperty({
    description: 'Email del usuario',
    example: 'usuario@ejemplo.com',
  })
  email: string;

  @ApiProperty({
    description: 'Rol del usuario',
    example: 'USER',
    enum: ['USER', 'ADMIN', 'MODERATOR'],
  })
  role: string;

  @ApiProperty({
    description: 'Issued At - Timestamp de creación',
    example: 1705317600,
  })
  iat: number;

  @ApiProperty({
    description: 'Expiration Time - Timestamp de expiración',
    example: 1705404000,
  })
  exp: number;
}

export class AuthHeaderExampleDto {
  @ApiProperty({
    description: 'Header de autorización con Bearer token',
    example:
      'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1dWlkLXVzdWFyaW8iLCJlbWFpbCI6InVzdWFyaW9AZWplbXBsby5jb20iLCJyb2xlIjoiVVNFUiIsImlhdCI6MTcwNTMxNzYwMCwiZXhwIjoxNzA1NDA0MDAwfQ.example-signature',
  })
  Authorization: string;
}

export class LoginExampleDto {
  @ApiProperty({
    description: 'Email del usuario',
    example: 'usuario@ejemplo.com',
    format: 'email',
  })
  email: string;

  @ApiProperty({
    description: 'Contraseña del usuario',
    example: 'MiContraseñaSegura123!',
    minLength: 8,
  })
  password: string;
}

export class RegisterExampleDto {
  @ApiProperty({
    description: 'Email único del usuario',
    example: 'nuevo@ejemplo.com',
    format: 'email',
  })
  email: string;

  @ApiProperty({
    description: 'Nombres del usuario',
    example: 'Juan Carlos',
    minLength: 2,
    maxLength: 100,
  })
  names: string;

  @ApiProperty({
    description: 'Apellidos del usuario',
    example: 'Pérez González',
    minLength: 2,
    maxLength: 100,
  })
  surnames: string;

  @ApiProperty({
    description: 'Contraseña segura (mínimo 8 caracteres)',
    example: 'MiContraseñaSegura123!',
    minLength: 8,
  })
  password: string;

  @ApiPropertyOptional({
    description: 'Número de teléfono',
    example: '+57 300 123 4567',
  })
  phone?: string;

  @ApiPropertyOptional({
    description: 'Fecha de nacimiento',
    example: '1990-01-15',
    format: 'date',
  })
  dateOfBirth?: string;
}

export class AuthResponseExampleDto {
  @ApiProperty({
    description: 'Token JWT de acceso',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1dWlkLXVzdWFyaW8iLCJlbWFpbCI6InVzdWFyaW9AZWplbXBsby5jb20iLCJyb2xlIjoiVVNFUiIsImlhdCI6MTcwNTMxNzYwMCwiZXhwIjoxNzA1NDA0MDAwfQ.example-signature',
  })
  token: string;

  @ApiPropertyOptional({
    description: 'Token de renovación',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1dWlkLXVzdWFyaW8iLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTcwNTMxNzYwMCwiZXhwIjoxNzA2MTgyNDAwfQ.refresh-signature',
  })
  refreshToken?: string;

  @ApiProperty({
    description: 'Indica si el usuario está autenticado',
    example: true,
  })
  isAuthenticated: boolean;

  @ApiProperty({
    description: 'Información del usuario autenticado',
    example: {
      id: 'uuid-usuario',
      email: 'usuario@ejemplo.com',
      names: 'Juan Carlos',
      surnames: 'Pérez González',
      role: 'USER',
      isActive: true,
      emailVerified: true,
    },
  })
  user: {
    id: string;
    email: string;
    names: string;
    surnames: string;
    role: string;
    isActive: boolean;
    emailVerified: boolean;
  };
}

export class RefreshTokenExampleDto {
  @ApiProperty({
    description: 'Token de renovación válido',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1dWlkLXVzdWFyaW8iLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTcwNTMxNzYwMCwiZXhwIjoxNzA2MTgyNDAwfQ.refresh-signature',
  })
  refreshToken: string;
}

export class ValidateTokenResponseExampleDto {
  @ApiProperty({
    description: 'Indica si el token es válido',
    example: true,
  })
  isValid: boolean;

  @ApiPropertyOptional({
    description: 'Información del usuario si el token es válido',
    example: {
      id: 'uuid-usuario',
      email: 'usuario@ejemplo.com',
      role: 'USER',
    },
  })
  user?: {
    id: string;
    email: string;
    role: string;
  };

  @ApiPropertyOptional({
    description: 'Mensaje de error si el token no es válido',
    example: 'Token expired',
  })
  error?: string;
}

/**
 * Ejemplos de errores de autenticación
 */
export class AuthErrorExamplesDto {
  @ApiProperty({
    description: 'Error de credenciales inválidas',
    example: {
      statusCode: 401,
      message: 'Credenciales inválidas',
      code: 'INVALID_CREDENTIALS',
      timestamp: '2024-01-15T10:30:00.000Z',
      path: '/api/auth/login',
    },
  })
  invalidCredentials: object;

  @ApiProperty({
    description: 'Error de token expirado',
    example: {
      statusCode: 401,
      message: 'Token has expired',
      code: 'TOKEN_EXPIRED',
      timestamp: '2024-01-15T10:30:00.000Z',
      path: '/api/users/profile',
    },
  })
  tokenExpired: object;

  @ApiProperty({
    description: 'Error de token inválido',
    example: {
      statusCode: 401,
      message: 'Invalid token',
      code: 'INVALID_TOKEN',
      timestamp: '2024-01-15T10:30:00.000Z',
      path: '/api/users/profile',
    },
  })
  invalidToken: object;

  @ApiProperty({
    description: 'Error de permisos insuficientes',
    example: {
      statusCode: 403,
      message: 'Insufficient permissions',
      code: 'INSUFFICIENT_PERMISSIONS',
      timestamp: '2024-01-15T10:30:00.000Z',
      path: '/api/admin/dashboard',
    },
  })
  insufficientPermissions: object;

  @ApiProperty({
    description: 'Error de email ya registrado',
    example: {
      statusCode: 409,
      message: 'Email already exists',
      code: 'EMAIL_ALREADY_EXISTS',
      timestamp: '2024-01-15T10:30:00.000Z',
      path: '/api/auth/register',
    },
  })
  emailAlreadyExists: object;
}

/**
 * Guía de uso de JWT
 */
export class JwtUsageGuideDto {
  @ApiProperty({
    description: 'Pasos para autenticarse',
    example: [
      '1. Registrarse con POST /api/auth/register o iniciar sesión con POST /api/auth/login',
      '2. Obtener el token JWT de la respuesta',
      '3. Incluir el token en el header Authorization: Bearer <token>',
      '4. El token expira en 24 horas',
      '5. Usar el refresh token para obtener un nuevo token de acceso',
    ],
  })
  steps: string[];

  @ApiProperty({
    description: 'Ejemplo de uso en JavaScript',
    example: `
// 1. Login
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'user@example.com', password: 'password' })
});
const { token } = await loginResponse.json();

// 2. Usar token en requests posteriores
const protectedResponse = await fetch('/api/users/profile', {
  headers: { 'Authorization': \`Bearer \${token}\` }
});

// 3. Renovar token cuando expire
const refreshResponse = await fetch('/api/auth/refresh', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ refreshToken: refreshToken })
});
    `,
  })
  jsExample: string;

  @ApiProperty({
    description: 'Roles disponibles en el sistema',
    example: {
      USER: 'Usuario regular con acceso a funciones básicas',
      ADMIN: 'Administrador con acceso completo al sistema',
      MODERATOR: 'Moderador con permisos limitados de administración',
    },
  })
  roles: Record<string, string>;
}
