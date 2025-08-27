// Importaciones necesarias
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { RegisterDto, AuthResponseDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUsersService = {
    findByEmail: jest.fn(),
    createWithHashedPassword: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Pruebas del método register
  describe('register', () => {
    const mockRegisterDto: RegisterDto = {
      email: 'test@example.com',
      names: 'John',
      surnames: 'Doe',
      password: 'password123',
      phone: '+1234567890',
      dateOfBirth: '1990-01-01',
    };

    const mockUser = {
      id: '1',
      email: 'test@example.com',
      names: 'John',
      surnames: 'Doe',
      phone: '+1234567890',
      dateOfBirth: new Date('1990-01-01'),
      emailVerified: false,
      role: 'USER',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockAuthResponse: AuthResponseDto = {
      access_token: 'mock-jwt-token',
      token_type: 'Bearer',
      expires_in: 24 * 60 * 60,
      user: {
        id: '1',
        email: 'test@example.com',
        names: 'John',
        surnames: 'Doe',
        role: 'USER',
      },
    };

    it('✅ Debe registrar un nuevo usuario exitosamente', async () => {
      const hashedPassword = 'hashedPassword123';

      (mockUsersService.findByEmail as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      (
        mockUsersService.createWithHashedPassword as jest.Mock
      ).mockResolvedValue(mockUser);
      (mockJwtService.sign as jest.Mock).mockReturnValue('mock-jwt-token');

      const result = await service.register(mockRegisterDto);

      expect(result).toEqual(mockAuthResponse);
    });

    it('🚫 Debe lanzar ConflictException si el usuario ya existe', async () => {
      (mockUsersService.findByEmail as jest.Mock).mockResolvedValue(mockUser);

      await expect(service.register(mockRegisterDto)).rejects.toThrow(
        new ConflictException('El email ya está registrado'),
      );
    });

    it('🟡 Debe registrar sin campos opcionales', async () => {
      const dtoSinOpcionales: Omit<RegisterDto, 'dateOfBirth' | 'phone'> = {
        email: 'test@example.com',
        names: 'John',
        surnames: 'Doe',
        password: 'password123',
      };

      const hashedPassword = 'hashedPassword123';
      (mockUsersService.findByEmail as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      (
        mockUsersService.createWithHashedPassword as jest.Mock
      ).mockResolvedValue(mockUser);
      (mockJwtService.sign as jest.Mock).mockReturnValue('mock-jwt-token');

      const result = await service.register(dtoSinOpcionales as RegisterDto);
      expect(result).toEqual(mockAuthResponse);
    });

    it('❌ Debe manejar error al hashear la contraseña', async () => {
      (mockUsersService.findByEmail as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockRejectedValue(new Error('Hash error'));

      await expect(service.register(mockRegisterDto)).rejects.toThrow(
        'Hash error',
      );
    });

    it('❌ Debe manejar error al crear el usuario', async () => {
      const hashedPassword = 'hashedPassword123';
      (mockUsersService.findByEmail as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      (
        mockUsersService.createWithHashedPassword as jest.Mock
      ).mockRejectedValue(new Error('Database error'));

      await expect(service.register(mockRegisterDto)).rejects.toThrow(
        'Database error',
      );
    });
  });
});
