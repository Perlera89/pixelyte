import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import {
  RegisterDto,
  LoginDto,
  AuthResponseDto,
  RefreshTokenDto,
  ValidateTokenResponseDto,
} from './dto/auth.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    // Verificar si el usuario ya existe
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    // Hash de la contraseña
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(registerDto.password, saltRounds);

    // Crear el usuario
    const userData = {
      email: registerDto.email,
      names: registerDto.names,
      surnames: registerDto.surnames,
      passwordHash,
      phone: registerDto.phone,
      dateOfBirth: registerDto.dateOfBirth
        ? new Date(registerDto.dateOfBirth)
        : undefined,
    };

    const user = await this.usersService.createWithHashedPassword(userData);

    // Generar token
    return this.generateTokenResponse(user);
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    // Buscar usuario por email
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar que el usuario esté activo
    if (!user.isActive) {
      throw new UnauthorizedException('Usuario desactivado');
    }

    // Generar token
    return this.generateTokenResponse(user);
  }

  private generateTokenResponse(user: any): AuthResponseDto {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    // Token de acceso con expiración corta
    const token = this.jwtService.sign(payload, { expiresIn: '24h' });

    // Refresh token con expiración más larga
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    return {
      token,
      refreshToken,
      isAuthenticated: true,
      user: {
        id: user.id,
        email: user.email,
        names: user.names,
        surnames: user.surnames,
        role: user.role,
      },
    };
  }

  async refreshToken(
    refreshTokenDto: RefreshTokenDto,
  ): Promise<AuthResponseDto> {
    try {
      // Verificar que el refresh token no esté vacío
      if (!refreshTokenDto.refreshToken) {
        throw new UnauthorizedException('Token de refresco requerido');
      }

      // Verificar el token
      const payload = this.jwtService.verify(refreshTokenDto.refreshToken);

      // Verificar que el payload tenga la estructura esperada
      if (!payload.sub || !payload.email) {
        throw new UnauthorizedException('Token de refresco inválido');
      }

      // Buscar el usuario
      const user = await this.usersService.findOneById(payload.sub);

      if (!user) {
        throw new UnauthorizedException('Usuario no encontrado');
      }

      // Verificar que el usuario esté activo
      if (!user.isActive) {
        throw new UnauthorizedException('Usuario desactivado');
      }

      return this.generateTokenResponse(user);
    } catch (error) {
      // Log del error para debugging
      console.error('Error en refreshToken:', error);

      if (error instanceof UnauthorizedException) {
        throw error;
      }

      // Para otros errores (JWT malformado, expirado, etc.)
      throw new UnauthorizedException('Token de refresco inválido o expirado');
    }
  }

  async validateToken(token: string): Promise<ValidateTokenResponseDto> {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.usersService.findOneById(payload.sub);

      if (!user) {
        return { isValid: false };
      }

      return {
        isValid: true,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      };
    } catch (error) {
      return { isValid: false };
    }
  }

  async validateUser(id: string) {
    return this.usersService.findOne(id);
  }

  async getProfile(userId: string) {
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    return {
      id: user.id,
      email: user.email,
      names: user.names,
      surnames: user.surnames,
      role: user.role,
      phone: user.phone,
      dateOfBirth: user.dateOfBirth,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
