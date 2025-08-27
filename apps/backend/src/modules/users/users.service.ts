import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';
import { SupabaseService } from '../../common/services/supabase.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
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
import * as bcrypt from 'bcrypt';
import {
  PaginationOptions,
  PaginationHelper,
  PaginatedResult,
} from '../../common/utils/pagination.util';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private supabaseService: SupabaseService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('El usuario ya existe con este email');
    }

    const passwordHash = await bcrypt.hash(createUserDto.password, 10);

    const { password, ...userData } = createUserDto;

    return this.prisma.user.create({
      data: {
        ...userData,
        passwordHash,
        dateOfBirth: createUserDto.dateOfBirth
          ? new Date(createUserDto.dateOfBirth)
          : null,
      },
      select: {
        id: true,
        email: true,
        names: true,
        surnames: true,
        phone: true,
        dateOfBirth: true,
        emailVerified: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async createWithHashedPassword(userData: {
    email: string;
    names: string;
    surnames: string;
    passwordHash: string;
    phone?: string;
    dateOfBirth?: Date;
  }) {
    return this.prisma.user.create({
      data: {
        ...userData,
      },
      select: {
        id: true,
        email: true,
        names: true,
        surnames: true,
        phone: true,
        dateOfBirth: true,
        emailVerified: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findAll(
    paginationOptions: PaginationOptions,
  ): Promise<PaginatedResult<any>> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = paginationOptions;
    const offset = PaginationHelper.calculateOffset(page, limit);

    const [users, totalCount] = await Promise.all([
      this.prisma.user.findMany({
        skip: offset,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          email: true,
          names: true,
          surnames: true,
          phone: true,
          dateOfBirth: true,
          emailVerified: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.user.count(),
    ]);

    return PaginationHelper.createPaginatedResult(
      users,
      totalCount,
      page,
      limit,
    );
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        names: true,
        surnames: true,
        phone: true,
        dateOfBirth: true,
        emailVerified: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        profile: true,
        addresses: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user;
  }

  // Método alternativo que no lanza excepción para uso interno
  async findOneById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        names: true,
        surnames: true,
        phone: true,
        dateOfBirth: true,
        emailVerified: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        profile: true,
        addresses: true,
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        names: true,
        surnames: true,
        phone: true,
        dateOfBirth: true,
        passwordHash: true,
        emailVerified: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.findOne(id); // Verifica que el usuario existe

    return this.prisma.user.update({
      where: { id },
      data: {
        ...updateUserDto,
        dateOfBirth: updateUserDto.dateOfBirth
          ? new Date(updateUserDto.dateOfBirth)
          : undefined,
      },
      select: {
        id: true,
        email: true,
        names: true,
        surnames: true,
        phone: true,
        dateOfBirth: true,
        emailVerified: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Verifica que el usuario existe

    return this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // Métodos para direcciones
  async createAddress(userId: string, createAddressDto: CreateUserAddressDto) {
    await this.findOne(userId); // Verifica que el usuario existe

    // Si es la dirección por defecto, desactivar otras direcciones por defecto
    if (createAddressDto.isDefault) {
      await this.prisma.userAddress.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.userAddress.create({
      data: {
        ...createAddressDto,
        userId,
      },
    });
  }

  async findUserAddresses(userId: string) {
    await this.findOne(userId); // Verifica que el usuario existe

    return this.prisma.userAddress.findMany({
      where: { userId },
      orderBy: { isDefault: 'desc' },
    });
  }

  async updateAddress(
    userId: string,
    addressId: string,
    updateAddressDto: UpdateUserAddressDto,
  ) {
    const address = await this.prisma.userAddress.findFirst({
      where: { id: addressId, userId },
    });

    if (!address) {
      throw new NotFoundException('Dirección no encontrada');
    }

    // Si es la dirección por defecto, desactivar otras direcciones por defecto
    if (updateAddressDto.isDefault) {
      await this.prisma.userAddress.updateMany({
        where: { userId, isDefault: true, id: { not: addressId } },
        data: { isDefault: false },
      });
    }

    return this.prisma.userAddress.update({
      where: { id: addressId },
      data: updateAddressDto,
    });
  }

  async removeAddress(userId: string, addressId: string) {
    const address = await this.prisma.userAddress.findFirst({
      where: { id: addressId, userId },
    });

    if (!address) {
      throw new NotFoundException('Dirección no encontrada');
    }

    return this.prisma.userAddress.delete({
      where: { id: addressId },
    });
  }

  // Métodos para perfil
  async createOrUpdateProfile(
    userId: string,
    profileDto: CreateUserProfileDto | UpdateUserProfileDto,
    avatar?: Express.Multer.File,
  ) {
    await this.findOne(userId); // Verifica que el usuario exists

    let avatarUrl: string | undefined;

    // Si se proporciona un archivo de avatar, subirlo a Supabase
    if (avatar) {
      // Obtener el perfil existente para eliminar el avatar anterior si existe
      const existingProfile = await this.prisma.userProfile.findUnique({
        where: { userId },
      });

      // Eliminar el avatar anterior si existe
      if (existingProfile?.avatarUrl) {
        await this.supabaseService.deleteImage(existingProfile.avatarUrl);
      }

      // Subir el nuevo avatar
      avatarUrl = await this.supabaseService.uploadImage(
        avatar,
        'images',
        'avatars',
      );
    }

    // Preparar los datos del perfil
    const profileData = {
      ...profileDto,
      ...(avatarUrl && { avatarUrl }),
    };

    return this.prisma.userProfile.upsert({
      where: { userId },
      update: profileData,
      create: {
        ...profileData,
        userId,
      },
    });
  }

  async findUserProfile(userId: string) {
    await this.findOne(userId); // Verifica que el usuario exists

    return this.prisma.userProfile.findUnique({
      where: { userId },
    });
  }

  // Métodos para gestión de perfil del usuario actual
  async updateCurrentUser(
    userId: string,
    updateCurrentUserDto: UpdateCurrentUserDto,
  ) {
    const user = await this.findOne(userId);

    // Si se está actualizando el email, verificar que sea único
    if (
      updateCurrentUserDto.email &&
      updateCurrentUserDto.email !== user.email
    ) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: updateCurrentUserDto.email },
      });

      if (existingUser) {
        throw new ConflictException('El email ya está en uso por otro usuario');
      }
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        ...updateCurrentUserDto,
        dateOfBirth: updateCurrentUserDto.dateOfBirth
          ? new Date(updateCurrentUserDto.dateOfBirth)
          : undefined,
      },
      select: {
        id: true,
        email: true,
        names: true,
        surnames: true,
        phone: true,
        dateOfBirth: true,
        emailVerified: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        profile: true,
        addresses: true,
      },
    });
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        passwordHash: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Verificar que la contraseña actual sea correcta
    const isCurrentPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.passwordHash,
    );

    if (!isCurrentPasswordValid) {
      throw new BadRequestException('La contraseña actual es incorrecta');
    }

    // Generar hash de la nueva contraseña
    const newPasswordHash = await bcrypt.hash(
      changePasswordDto.newPassword,
      10,
    );

    // Actualizar la contraseña
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    return { message: 'Contraseña actualizada exitosamente' };
  }

  // Métodos para gestión de direcciones del usuario actual
  async getCurrentUserAddresses(userId: string) {
    await this.findOne(userId);

    return this.prisma.userAddress.findMany({
      where: { userId },
      orderBy: { isDefault: 'desc' },
    });
  }

  async createCurrentUserAddress(
    userId: string,
    createAddressDto: CreateUserAddressDto,
  ) {
    await this.findOne(userId);

    // Si es la dirección por defecto, desactivar otras direcciones por defecto
    if (createAddressDto.isDefault) {
      await this.prisma.userAddress.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.userAddress.create({
      data: {
        ...createAddressDto,
        userId,
      },
    });
  }

  async updateCurrentUserAddress(
    userId: string,
    addressId: string,
    updateAddressDto: UpdateUserAddressDto,
  ) {
    const address = await this.prisma.userAddress.findFirst({
      where: { id: addressId, userId },
    });

    if (!address) {
      throw new NotFoundException('Dirección no encontrada');
    }

    // Si es la dirección por defecto, desactivar otras direcciones por defecto
    if (updateAddressDto.isDefault) {
      await this.prisma.userAddress.updateMany({
        where: { userId, isDefault: true, id: { not: addressId } },
        data: { isDefault: false },
      });
    }

    return this.prisma.userAddress.update({
      where: { id: addressId },
      data: updateAddressDto,
    });
  }

  async removeCurrentUserAddress(userId: string, addressId: string) {
    const address = await this.prisma.userAddress.findFirst({
      where: { id: addressId, userId },
    });

    if (!address) {
      throw new NotFoundException('Dirección no encontrada');
    }

    return this.prisma.userAddress.delete({
      where: { id: addressId },
    });
  }
}
