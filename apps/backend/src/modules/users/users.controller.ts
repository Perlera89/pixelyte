import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageValidationPipe } from '../../common/pipes/file-validation.pipe';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from './dto/user.dto';
import {
  CreateUserAddressDto,
  UpdateUserAddressDto,
} from './dto/user-address.dto';
import {
  CreateUserProfileDto,
  UpdateUserProfileDto,
} from './dto/user-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateCurrentUserDto } from './dto/update-current-user.dto';
import { PaginationOptions } from '../../common/utils/pagination.util';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('2. Usuarios')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Crear usuario
   * Permite registrar un nuevo usuario. Solo para administradores.
   */
  @Roles('ADMIN')
  @Post('add-user')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear un nuevo usuario (admin)',
    description: 'Permite registrar un nuevo usuario.',
  })
  @ApiBody({
    type: CreateUserDto,
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
    description: 'Usuario creado exitosamente. Devuelve los datos del usuario.',
    type: UserResponseDto,
    schema: {
      example: {
        id: 'uuid-del-usuario',
        email: 'usuario@ejemplo.com',
        names: 'Juan',
        surnames: 'Pérez',
        phone: '+1234567890',
        dateOfBirth: '1990-01-01',
        emailVerified: false,
        role: 'USER',
        isActive: true,
        createdAt: '2024-07-14T12:00:00.000Z',
        updatedAt: '2024-07-14T12:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 409, description: 'El email ya está registrado' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Roles('ADMIN')
  @Get('get-all-users')
  @ApiOperation({
    summary: 'Obtener lista paginada de usuarios (admin)',
    description: 'Devuelve una lista paginada de usuarios.',
  })
  @ApiQuery({ name: 'page', required: false, description: 'Número de página' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Elementos por página',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    description: 'Campo para ordenar',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    description: 'Orden ascendente o descendente',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuarios obtenida exitosamente',
    isArray: true,
    type: UserResponseDto,
  })
  findAll(@Query() paginationOptions: PaginationOptions) {
    return this.usersService.findAll(paginationOptions);
  }

  @Roles('ADMIN')
  @Get('find-user/:id')
  @ApiOperation({
    summary: 'Obtener un usuario por Id (admin)',
    description: 'Devuelve los datos de un usuario por su Id.',
  })
  @ApiParam({ name: 'id', description: 'uuid-usuario' })
  @ApiResponse({
    status: 200,
    description: 'Usuario encontrado',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Roles('ADMIN')
  @Patch('update-users/:id')
  @ApiOperation({
    summary: 'Actualizar un usuario (admin)',
    description: 'Actualiza los datos de un usuario por su Id.',
  })
  @ApiParam({ name: 'id', description: 'uuid-usuario' })
  @ApiResponse({
    status: 200,
    description: 'Usuario actualizado exitosamente',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Roles('ADMIN')
  @Delete('delete-user/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Desactivar (eliminar lógicamente) un usuario',
    description:
      'Desactiva un usuario por su ID (borrado lógico). Requiere rol ADMIN.',
  })
  @ApiParam({ name: 'id', description: 'ID único del usuario' })
  @ApiResponse({ status: 204, description: 'Usuario desactivado exitosamente' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @ApiTags('3. Direcciones de usuario')
  @Post('user/:id/add-address')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Agregar dirección a un usuario',
    description: 'Agrega una nueva dirección a un usuario.',
  })
  @ApiParam({ name: 'id', description: 'ID único del usuario' })
  @ApiBody({ type: CreateUserAddressDto })
  @ApiResponse({ status: 201, description: 'Dirección agregada exitosamente' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  createAddress(
    @Param('id') userId: string,
    @Body() createAddressDto: CreateUserAddressDto,
  ) {
    return this.usersService.createAddress(userId, createAddressDto);
  }

  @ApiTags('3. Direcciones de usuario')
  @Get('user/:id/get-all-addresses')
  @ApiOperation({
    summary: 'Obtener direcciones de un usuario',
    description: 'Devuelve todas las direcciones de un usuario.',
  })
  @ApiParam({ name: 'id', description: 'ID único del usuario' })
  @ApiResponse({
    status: 200,
    description: 'Direcciones obtenidas exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  findUserAddresses(@Param('id') userId: string) {
    return this.usersService.findUserAddresses(userId);
  }

  @ApiTags('3. Direcciones de usuario')
  @Patch('user/:id/update-address/:addressId')
  @ApiOperation({
    summary: 'Actualizar dirección de un usuario',
    description: 'Actualiza una dirección de un usuario.',
  })
  @ApiParam({ name: 'id', description: 'ID único del usuario' })
  @ApiParam({ name: 'addressId', description: 'ID único de la dirección' })
  @ApiBody({ type: UpdateUserAddressDto })
  @ApiResponse({
    status: 200,
    description: 'Dirección actualizada exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario o dirección no encontrada',
  })
  updateAddress(
    @Param('id') userId: string,
    @Param('addressId') addressId: string,
    @Body() updateAddressDto: UpdateUserAddressDto,
  ) {
    return this.usersService.updateAddress(userId, addressId, updateAddressDto);
  }

  @ApiTags('3. Direcciones de usuario')
  @Delete('user/:id/delete-address/:addressId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar dirección de un usuario',
    description: 'Elimina una dirección de un usuario.',
  })
  @ApiParam({ name: 'id', description: 'ID único del usuario' })
  @ApiParam({ name: 'addressId', description: 'ID único de la dirección' })
  @ApiResponse({ status: 204, description: 'Dirección eliminada exitosamente' })
  @ApiResponse({
    status: 404,
    description: 'Usuario o dirección no encontrada',
  })
  removeAddress(
    @Param('id') userId: string,
    @Param('addressId') addressId: string,
  ) {
    return this.usersService.removeAddress(userId, addressId);
  }

  @ApiTags('4. Perfil de usuario')
  @Post('user/:id/add-profile')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Crear o actualizar perfil de usuario con avatar',
    description: 'Crea o actualiza el perfil de un usuario con avatar.',
  })
  @ApiBody({
    description: 'Datos del perfil de usuario con avatar',
    schema: {
      type: 'object',
      properties: {
        preferredCurrency: {
          type: 'string',
          example: 'USD',
          enum: ['USD', 'EUR', 'MXN'],
        },
        bio: {
          type: 'string',
          example: 'Desarrollador apasionado por la tecnología',
        },
        location: { type: 'string', example: 'Ciudad de México, México' },
        avatar: {
          type: 'string',
          format: 'binary',
          description: 'Archivo de imagen para el avatar del usuario',
        },
      },
    },
  })
  @ApiParam({ name: 'id', description: 'ID único del usuario' })
  @ApiResponse({
    status: 201,
    description: 'Perfil creado/actualizado exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  createProfile(
    @Param('id') userId: string,
    @Body() createProfileDto: CreateUserProfileDto,
    @UploadedFile(new ImageValidationPipe()) avatar?: Express.Multer.File,
  ) {
    return this.usersService.createOrUpdateProfile(
      userId,
      createProfileDto,
      avatar,
    );
  }

  @ApiTags('4. Perfil de usuario')
  @Get('user/:id/get-profile')
  @ApiOperation({
    summary: 'Obtener perfil de un usuario',
    description: 'Devuelve el perfil de un usuario.',
  })
  @ApiParam({ name: 'id', description: 'ID único del usuario' })
  @ApiResponse({ status: 200, description: 'Perfil obtenido exitosamente' })
  @ApiResponse({ status: 404, description: 'Usuario o perfil no encontrado' })
  findUserProfile(@Param('id') userId: string) {
    return this.usersService.findUserProfile(userId);
  }

  @ApiTags('4. Perfil de usuario')
  @Patch('user/:id/update-profile')
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Actualizar perfil de usuario con avatar',
    description: 'Actualiza el perfil de un usuario con avatar.',
  })
  @ApiBody({
    description: 'Datos del perfil de usuario a actualizar con avatar opcional',
    schema: {
      type: 'object',
      properties: {
        preferredCurrency: {
          type: 'string',
          example: 'USD',
          enum: ['USD', 'EUR', 'MXN'],
        },
        bio: {
          type: 'string',
          example: 'Desarrollador apasionado por la tecnología',
        },
        location: { type: 'string', example: 'Ciudad de México, México' },
        avatar: {
          type: 'string',
          format: 'binary',
          description:
            'Archivo de imagen para actualizar el avatar del usuario',
        },
      },
    },
  })
  @ApiParam({ name: 'id', description: 'ID único del usuario' })
  @ApiResponse({ status: 200, description: 'Perfil actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  updateProfile(
    @Param('id') userId: string,
    @Body() updateProfileDto: UpdateUserProfileDto,
    @UploadedFile(new ImageValidationPipe()) avatar?: Express.Multer.File,
  ) {
    return this.usersService.createOrUpdateProfile(
      userId,
      updateProfileDto,
      avatar,
    );
  }

  @Get('me')
  @ApiOperation({ summary: 'Obtener información del usuario actual' })
  @ApiResponse({
    status: 200,
    description: 'Información del usuario actual',
    type: UserResponseDto,
  })
  getCurrentUser(@CurrentUser() user: any) {
    return this.usersService.findOne(user.id);
  }

  @ApiTags('5. Gestión de perfil del usuario actual')
  @Patch('profile')
  @ApiOperation({
    summary: 'Actualizar perfil del usuario actual',
    description:
      'Permite al usuario actualizar su información personal incluyendo email con validación de unicidad.',
  })
  @ApiBody({
    type: UpdateCurrentUserDto,
    examples: {
      ejemplo: {
        summary: 'Ejemplo de actualización de perfil',
        value: {
          email: 'nuevo@ejemplo.com',
          names: 'Juan Carlos',
          surnames: 'Pérez González',
          phone: '+1234567890',
          dateOfBirth: '1990-01-01',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil actualizado exitosamente',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 409, description: 'El email ya está en uso' })
  updateCurrentUserProfile(
    @CurrentUser() user: any,
    @Body() updateCurrentUserDto: UpdateCurrentUserDto,
  ) {
    return this.usersService.updateCurrentUser(user.id, updateCurrentUserDto);
  }

  @ApiTags('5. Gestión de perfil del usuario actual')
  @Patch('password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cambiar contraseña del usuario actual',
    description:
      'Permite al usuario cambiar su contraseña validando la contraseña actual.',
  })
  @ApiBody({
    type: ChangePasswordDto,
    examples: {
      ejemplo: {
        summary: 'Ejemplo de cambio de contraseña',
        value: {
          currentPassword: 'contraseñaActual123',
          newPassword: 'nuevaContraseña456',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Contraseña actualizada exitosamente',
    schema: {
      example: {
        message: 'Contraseña actualizada exitosamente',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Contraseña actual incorrecta o datos inválidos',
  })
  changePassword(
    @CurrentUser() user: any,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(user.id, changePasswordDto);
  }

  @ApiTags('5. Gestión de perfil del usuario actual')
  @Get('addresses')
  @ApiOperation({
    summary: 'Obtener direcciones del usuario actual',
    description: 'Devuelve todas las direcciones del usuario autenticado.',
  })
  @ApiResponse({
    status: 200,
    description: 'Direcciones obtenidas exitosamente',
    isArray: true,
  })
  getCurrentUserAddresses(@CurrentUser() user: any) {
    return this.usersService.getCurrentUserAddresses(user.id);
  }

  @ApiTags('5. Gestión de perfil del usuario actual')
  @Post('addresses')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Agregar dirección al usuario actual',
    description: 'Permite al usuario agregar una nueva dirección a su perfil.',
  })
  @ApiBody({
    type: CreateUserAddressDto,
    examples: {
      ejemplo: {
        summary: 'Ejemplo de nueva dirección',
        value: {
          country: 'México',
          stateProvice: 'Ciudad de México',
          city: 'Coyoacán',
          postalCode: '06100',
          address: 'Av. Reforma 123',
          addressLine: 'Apartamento 4B',
          isDefault: true,
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Dirección agregada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  createCurrentUserAddress(
    @CurrentUser() user: any,
    @Body() createAddressDto: CreateUserAddressDto,
  ) {
    return this.usersService.createCurrentUserAddress(
      user.id,
      createAddressDto,
    );
  }

  @ApiTags('5. Gestión de perfil del usuario actual')
  @Patch('addresses/:addressId')
  @ApiOperation({
    summary: 'Actualizar dirección del usuario actual',
    description: 'Permite al usuario actualizar una de sus direcciones.',
  })
  @ApiParam({ name: 'addressId', description: 'ID único de la dirección' })
  @ApiBody({ type: UpdateUserAddressDto })
  @ApiResponse({
    status: 200,
    description: 'Dirección actualizada exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Dirección no encontrada' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  updateCurrentUserAddress(
    @CurrentUser() user: any,
    @Param('addressId') addressId: string,
    @Body() updateAddressDto: UpdateUserAddressDto,
  ) {
    return this.usersService.updateCurrentUserAddress(
      user.id,
      addressId,
      updateAddressDto,
    );
  }

  @ApiTags('5. Gestión de perfil del usuario actual')
  @Delete('addresses/:addressId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar dirección del usuario actual',
    description: 'Permite al usuario eliminar una de sus direcciones.',
  })
  @ApiParam({ name: 'addressId', description: 'ID único de la dirección' })
  @ApiResponse({ status: 204, description: 'Dirección eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Dirección no encontrada' })
  removeCurrentUserAddress(
    @CurrentUser() user: any,
    @Param('addressId') addressId: string,
  ) {
    return this.usersService.removeCurrentUserAddress(user.id, addressId);
  }
}
