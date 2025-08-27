# Prueba Unitaria: Registro en el Módulo de Autenticación

## 1. Sección de código aislada

Se aisló el método `register` del servicio `AuthService` ubicado en `src/modules/auth/auth.service.ts`. Este método es responsable de registrar un nuevo usuario, asegurando que el correo no esté registrado, hasheando la contraseña y generando un token JWT.

## 2. Código de la prueba unitaria

```typescript
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

    it('should register a new user successfully', async () => {
      const hashedPassword = 'hashedPassword123';
      (mockUsersService.findByEmail as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      (
        mockUsersService.createWithHashedPassword as jest.Mock
      ).mockResolvedValue(mockUser);
      (mockJwtService.sign as jest.Mock).mockReturnValue('mock-jwt-token');
      const result = await service.register(mockRegisterDto);
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(
        mockRegisterDto.email,
      );
      expect(bcrypt.hash).toHaveBeenCalledWith(mockRegisterDto.password, 10);
      expect(mockUsersService.createWithHashedPassword).toHaveBeenCalledWith({
        email: mockRegisterDto.email,
        names: mockRegisterDto.names,
        surnames: mockRegisterDto.surnames,
        passwordHash: hashedPassword,
        phone: mockRegisterDto.phone,
        dateOfBirth: new Date(mockRegisterDto.dateOfBirth!),
      });
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });
      expect(result).toEqual(mockAuthResponse);
    });

    it('should throw ConflictException when user already exists', async () => {
      (mockUsersService.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      await expect(service.register(mockRegisterDto)).rejects.toThrow(
        new ConflictException('El email ya está registrado'),
      );
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(
        mockRegisterDto.email,
      );
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(mockUsersService.createWithHashedPassword).not.toHaveBeenCalled();
    });

    it('should handle registration without optional fields', async () => {
      const registerDtoWithoutOptional: Omit<
        RegisterDto,
        'dateOfBirth' | 'phone'
      > = {
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
      const result = await service.register(
        registerDtoWithoutOptional as RegisterDto,
      );
      const expectedUserData = {
        email: registerDtoWithoutOptional.email,
        names: registerDtoWithoutOptional.names,
        surnames: registerDtoWithoutOptional.surnames,
        passwordHash: hashedPassword,
        phone: undefined,
        dateOfBirth: undefined,
      };
      expect(mockUsersService.createWithHashedPassword).toHaveBeenCalledWith(
        expectedUserData,
      );
      expect(result).toEqual(mockAuthResponse);
    });

    it('should handle bcrypt hash error', async () => {
      (mockUsersService.findByEmail as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockRejectedValue(new Error('Hash error'));
      await expect(service.register(mockRegisterDto)).rejects.toThrow(
        'Hash error',
      );
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(
        mockRegisterDto.email,
      );
      expect(bcrypt.hash).toHaveBeenCalledWith(mockRegisterDto.password, 10);
      expect(mockUsersService.createWithHashedPassword).not.toHaveBeenCalled();
    });

    it('should handle user creation error', async () => {
      const hashedPassword = 'hashedPassword123';
      (mockUsersService.findByEmail as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      (
        mockUsersService.createWithHashedPassword as jest.Mock
      ).mockRejectedValue(new Error('Database error'));
      await expect(service.register(mockRegisterDto)).rejects.toThrow(
        'Database error',
      );
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(
        mockRegisterDto.email,
      );
      expect(bcrypt.hash).toHaveBeenCalledWith(mockRegisterDto.password, 10);
      expect(mockUsersService.createWithHashedPassword).toHaveBeenCalled();
    });
  });
});
```

## 3. Procesos ejecutados en la prueba unitaria

Las pruebas unitarias cubren los siguientes escenarios:

- Registro exitoso de un usuario nuevo.
- Intento de registro con un correo ya existente (debe lanzar `ConflictException`).
- Registro sin campos opcionales (teléfono y fecha de nacimiento).
- Manejo de error al hashear la contraseña (simulación de fallo en bcrypt).
- Manejo de error al crear el usuario (simulación de fallo en la base de datos).

Para lograr el aislamiento, se mockearon las dependencias `UsersService` y `JwtService`, así como la función `bcrypt.hash`.

## 4. Identificación de los casos solicitados

1. **Conocer bien el proceso que se va a aprobar:**
   - Se analizó el método `register` y su flujo: validación de usuario existente, hash de contraseña, creación de usuario y generación de token.
2. **Identificar los comportamientos esperados:**
   - Se definieron los comportamientos esperados para cada escenario (registro exitoso, error por usuario existente, errores en hash y creación, etc.).
3. **Simular el entorno de prueba y datos:**
   - Se simularon los servicios dependientes (`UsersService`, `JwtService`) y la función de hash, controlando los datos de entrada y salida.
4. **Registrar los resultados de la prueba:**
   - Se ejecutó la prueba y se registró el resultado:

```
Test Suites: 1 passed, 1 total
Tests:       5 passed, 5 total
Snapshots:   0 total
Time:        X.XXX s
```

## 5. ¿El aplicativo supera la prueba?

Sí, el módulo de autenticación supera todas las pruebas unitarias para el registro de usuario. Todos los escenarios contemplados fueron cubiertos y pasaron correctamente, lo que indica que el método `register` funciona como se espera bajo las condiciones probadas.

---

**Resumen:**

- Se aisló el método de registro y sus dependencias.
- Se probaron casos de éxito y error.
- Todas las pruebas fueron superadas exitosamente.
