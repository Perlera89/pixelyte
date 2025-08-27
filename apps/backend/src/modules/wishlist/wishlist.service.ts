import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';
import {
  AddToWishlistDto,
  SyncWishlistDto,
  RemoveFromWishlistDto,
} from './dto/wishlist.dto';

@Injectable()
export class WishlistService {
  constructor(private prisma: PrismaService) {}

  async addItem(userId: string, addToWishlistDto: AddToWishlistDto) {
    const { productId, variantId } = addToWishlistDto;
    // Verificar que el producto existe y está activo
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    if (!product.isActive) {
      throw new BadRequestException('El producto no está disponible');
    }

    // Verificar que la variante existe si se proporciona
    if (variantId) {
      const variant = await this.prisma.productVariant.findUnique({
        where: { id: variantId },
      });

      if (!variant) {
        throw new NotFoundException('Variante de producto no encontrada');
      }

      if (!variant.isActive) {
        throw new BadRequestException(
          'La variante del producto no está disponible',
        );
      }
    }

    // Obtener o crear la wishlist por defecto del usuario
    let wishlist = await this.prisma.wishlist.findFirst({
      where: { userId, isDefault: true },
    });

    if (!wishlist) {
      wishlist = await this.prisma.wishlist.create({
        data: {
          userId,
          name: 'Mi Lista de Deseos',
          isDefault: true,
        },
      });
    }

    // Verificar si el producto ya está en la wishlist
    const existingItem = await this.prisma.wishlistItem.findFirst({
      where: {
        wishlistId: wishlist.id,
        productId,
        variantId: variantId || null,
      },
    });

    if (existingItem) {
      throw new BadRequestException('El producto ya está en la wishlist');
    }

    // Agregar el producto a la wishlist
    return this.prisma.wishlistItem.create({
      data: {
        wishlistId: wishlist.id,
        productId,
        variantId,
      },
      include: {
        product: {
          include: {
            productImages: {
              where: { isPrimary: true },
              take: 1,
            },
            brand: true,
          },
        },
        variant: {
          include: {
            productImage: true,
          },
        },
      },
    });
  }

  async getWishlist(userId: string) {
    // Obtener la wishlist por defecto del usuario
    const wishlist = await this.prisma.wishlist.findFirst({
      where: { userId, isDefault: true },
      include: {
        items: {
          include: {
            product: {
              include: {
                productImages: {
                  where: { isPrimary: true },
                  take: 1,
                },
                brand: true,
                category: true,
              },
            },
            variant: {
              include: {
                productImage: true,
              },
            },
          },
          orderBy: { addedAt: 'desc' },
        },
      },
    });

    if (!wishlist) {
      return { id: null, items: [] };
    }

    // Formatear la respuesta para que sea consistente
    const formattedItems = wishlist.items.map((item) =>
      this.formatWishlistItemResponse(item),
    );

    return {
      id: wishlist.id,
      items: formattedItems,
    };
  }

  async removeItem(
    userId: string,
    removeFromWishlistDto: RemoveFromWishlistDto,
  ) {
    const { productId, variantId } = removeFromWishlistDto;
    // Obtener la wishlist por defecto del usuario
    const wishlist = await this.prisma.wishlist.findFirst({
      where: { userId, isDefault: true },
    });

    if (!wishlist) {
      throw new NotFoundException('Wishlist no encontrada');
    }

    // Buscar y eliminar el item
    const deletedItem = await this.prisma.wishlistItem.deleteMany({
      where: {
        wishlistId: wishlist.id,
        productId,
        variantId: variantId || null,
      },
    });

    if (deletedItem.count === 0) {
      throw new NotFoundException('Producto no encontrado en la wishlist');
    }

    return { message: 'Producto eliminado de la wishlist exitosamente' };
  }

  async clearWishlist(userId: string) {
    // Obtener la wishlist por defecto del usuario
    const wishlist = await this.prisma.wishlist.findFirst({
      where: { userId, isDefault: true },
    });

    if (!wishlist) {
      throw new NotFoundException('Wishlist no encontrada');
    }

    // Eliminar todos los items de la wishlist
    await this.prisma.wishlistItem.deleteMany({
      where: { wishlistId: wishlist.id },
    });

    return { message: 'Wishlist limpiada exitosamente' };
  }

  async syncWishlist(userId: string, syncWishlistDto: SyncWishlistDto) {
    // Obtener o crear la wishlist por defecto del usuario
    let wishlist = await this.prisma.wishlist.findFirst({
      where: { userId, isDefault: true },
    });

    if (!wishlist) {
      wishlist = await this.prisma.wishlist.create({
        data: {
          userId,
          name: 'Mi Lista de Deseos',
          isDefault: true,
        },
      });
    }

    // Obtener items actuales del servidor
    const serverItems = await this.prisma.wishlistItem.findMany({
      where: { wishlistId: wishlist.id },
      include: {
        product: {
          include: {
            productImages: {
              where: { isPrimary: true },
              take: 1,
            },
            brand: true,
          },
        },
        variant: {
          include: {
            productImage: true,
          },
        },
      },
    });

    const mergedItems: any[] = [];
    const processedItems = new Set<string>();

    // Procesar items de la wishlist local
    for (const localItem of syncWishlistDto.items) {
      // Verificar que el producto existe y está activo
      const product = await this.prisma.product.findUnique({
        where: { id: localItem.productId },
      });

      if (!product || !product.isActive) {
        continue; // Saltar productos no válidos
      }

      // Verificar variante si se proporciona
      if (localItem.variantId) {
        const variant = await this.prisma.productVariant.findUnique({
          where: { id: localItem.variantId },
        });

        if (!variant || !variant.isActive) {
          continue; // Saltar variantes no válidas
        }
      }

      const itemKey = `${localItem.productId}-${localItem.variantId || 'null'}`;

      // Buscar si ya existe en el servidor
      const serverItem = serverItems.find(
        (item) =>
          item.productId === localItem.productId &&
          item.variantId === localItem.variantId,
      );

      if (!serverItem) {
        // Crear nuevo item si no existe en el servidor
        const newItem = await this.prisma.wishlistItem.create({
          data: {
            wishlistId: wishlist.id,
            productId: localItem.productId,
            variantId: localItem.variantId,
          },
          include: {
            product: {
              include: {
                productImages: {
                  where: { isPrimary: true },
                  take: 1,
                },
                brand: true,
              },
            },
            variant: {
              include: {
                productImage: true,
              },
            },
          },
        });

        mergedItems.push(this.formatWishlistItemResponse(newItem));
      } else {
        // Item ya existe en el servidor, mantenerlo
        mergedItems.push(this.formatWishlistItemResponse(serverItem));
      }

      processedItems.add(itemKey);
    }

    // Mantener items del servidor que no estaban en la wishlist local
    for (const serverItem of serverItems) {
      const itemKey = `${serverItem.productId}-${serverItem.variantId || 'null'}`;
      if (!processedItems.has(itemKey)) {
        mergedItems.push(this.formatWishlistItemResponse(serverItem));
      }
    }

    return {
      wishlistId: wishlist.id,
      items: mergedItems,
      totalItems: mergedItems.length,
      message: 'Wishlist sincronizada exitosamente',
    };
  }

  // ========== HELPER METHODS ==========

  /**
   * Formatea la respuesta de un item de wishlist
   */
  private formatWishlistItemResponse(item: any) {
    const product = item.product;
    const variant = item.variant;
    const primaryImage = product.productImages?.[0];

    // Devolver el producto completo con la estructura esperada por el frontend
    return {
      // Información del item de wishlist
      wishlistItemId: item.id,
      addedAt: item.addedAt,

      // Información del producto (estructura compatible con el tipo Product del frontend)
      id: product.id,
      sku: product.sku,
      name: product.name,
      slug: product.slug,
      shortDescription: product.shortDescription,
      longDescription: product.longDescription,
      brandId: product.brandId,
      categoryId: product.categoryId,
      basePrice: product.basePrice,
      compareAtPrice: product.compareAtPrice,
      costPrice: product.costPrice,
      weight: product.weight,
      dimensions: product.dimensions,
      requiresShipping: product.requiresShipping,
      isDigital: product.isDigital,
      isFeatured: product.isFeatured,
      isActive: product.isActive,
      status: product.status,
      seoTitle: product.seoTitle,
      seoDescription: product.seoDescription,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      brand: product.brand,
      category: product.category,
      productImages: product.productImages,

      // Información de variante si existe
      variant: variant
        ? {
            id: variant.id,
            name: variant.name,
            price: variant.price,
            image: variant.productImage
              ? {
                  url: variant.productImage.url,
                  altText: variant.productImage.altText,
                }
              : null,
          }
        : null,
    };
  }
}
