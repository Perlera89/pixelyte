import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Req,
  Headers,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiExtraModels,
  ApiHeader,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  RegisterDto,
  LoginDto,
  AuthResponseDto,
  RefreshTokenDto,
  ValidateTokenResponseDto,
} from './dto/auth.dto';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('1. Autorización')
@ApiExtraModels(AuthResponseDto)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Registro
  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Registrar un nuevo usuario',
    description: 'Crea una cuenta de usuario. Público.',
  })
  @ApiBody({
    type: RegisterDto,
    examples: {
      ejemplo: {
        summary: 'Ejemplo de registro',
        value: {
          email: 'usuario@ejemplo.com',
          names: 'Juan',
          surnames: 'Pérez',
          password: 'password123',
          phone: '+1234567890',
          dateOfBirth: '1990-01-01',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description:
      'Usuario registrado exitosamente. Devuelve el token JWT y datos del usuario.',
    type: AuthResponseDto,
    schema: {
      example: {
        token:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1dWlkLXVzdWFyaW8iLCJlbWFpbCI6InVzdWFyaW9AZWplbXBsby5jb20iLCJyb2xlIjoiVVNFUiIsImlhdCI6MTcwNTMxNzYwMCwiZXhwIjoxNzA1NDA0MDAwfQ.example-signature',
        refreshToken:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1dWlkLXVzdWFyaW8iLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTcwNTMxNzYwMCwiZXhwIjoxNzA2MTgyNDAwfQ.refresh-signature',
        isAuthenticated: true,
        user: {
          id: 'uuid-del-usuario',
          email: 'usuario@ejemplo.com',
          names: 'Juan Carlos',
          surnames: 'Pérez González',
          role: 'USER',
          isActive: true,
          emailVerified: false,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos',
    schema: {
      example: {
        statusCode: 400,
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: [
          'email must be a valid email',
          'password must be at least 8 characters',
        ],
        timestamp: '2024-01-15T10:30:00.000Z',
        path: '/api/auth/register',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'El email ya está registrado',
    schema: {
      example: {
        statusCode: 409,
        message: 'Email already exists',
        code: 'EMAIL_ALREADY_EXISTS',
        timestamp: '2024-01-15T10:30:00.000Z',
        path: '/api/auth/register',
      },
    },
  })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  // Inicio de sesión
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Iniciar sesión',
    description: 'Autentica un usuario y devuelve un token JWT. Público.',
  })
  @ApiBody({
    type: LoginDto,
    examples: {
      ejemplo: {
        summary: 'Ejemplo de login',
        value: {
          email: 'usuario@ejemplo.com',
          password: 'password123',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description:
      'Inicio de sesión exitoso. Devuelve el token y datos del usuario.',
    type: AuthResponseDto,
    schema: {
      example: {
        token:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1dWlkLXVzdWFyaW8iLCJlbWFpbCI6InVzdWFyaW9AZWplbXBsby5jb20iLCJyb2xlIjoiVVNFUiIsImlhdCI6MTcwNTMxNzYwMCwiZXhwIjoxNzA1NDA0MDAwfQ.example-signature',
        refreshToken:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1dWlkLXVzdWFyaW8iLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTcwNTMxNzYwMCwiZXhwIjoxNzA2MTgyNDAwfQ.refresh-signature',
        isAuthenticated: true,
        user: {
          id: 'uuid-del-usuario',
          email: 'usuario@ejemplo.com',
          names: 'Juan Carlos',
          surnames: 'Pérez González',
          role: 'USER',
          isActive: true,
          emailVerified: true,
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciales inválidas',
    schema: {
      example: {
        statusCode: 401,
        message: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS',
        timestamp: '2024-01-15T10:30:00.000Z',
        path: '/api/auth/login',
      },
    },
  })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refrescar token',
    description:
      'Obtiene un nuevo token de acceso usando un refresh token. Público.',
  })
  @ApiBody({
    type: RefreshTokenDto,
    examples: {
      ejemplo: {
        summary: 'Ejemplo de refresh token',
        value: {
          refreshToken: 'refresh-token',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Token refrescado exitosamente',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Token de refresco inválido' })
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<AuthResponseDto> {
    return this.authService.refreshToken(refreshTokenDto);
  }

  @Public()
  @Get('validate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Validar token',
    description: 'Valida un token JWT. Público.',
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Validación de token exitosa',
    type: ValidateTokenResponseDto,
    schema: {
      example: {
        isValid: true,
        user: {
          id: 'uuid-del-usuario',
          email: 'usuario@ejemplo.com',
          role: 'USER',
        },
      },
    },
  })
  async validateToken(
    @Headers('authorization') authHeader: string,
  ): Promise<ValidateTokenResponseDto> {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { isValid: false };
    }
    const token = authHeader.split(' ')[1];
    return this.authService.validateToken(token);
  }

  // Obtener perfil del usuario actual
  @Get('me')
  @ApiOperation({
    summary: 'Obtener perfil del usuario actual',
    description: 'Devuelve los datos del usuario autenticado.',
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil del usuario obtenido exitosamente',
    schema: {
      example: {
        id: 'uuid-del-usuario',
        email: 'usuario@ejemplo.com',
        names: 'Juan',
        surnames: 'Pérez',
        role: 'USER',
        phone: '+1234567890',
        dateOfBirth: '1990-01-01',
        isActive: true,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async getProfile(@Req() req) {
    // El usuario ya está validado por el JWT guardado en req.user
    return this.authService.getProfile(req.user.sub);
  }
}
