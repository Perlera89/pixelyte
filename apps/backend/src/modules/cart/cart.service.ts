import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';
import {
  CreateCartDto,
  CreateCartLineItemDto,
  UpdateCartLineItemDto,
  AddToCartDto,
  UpdateCartItemDto,
  SyncCartDto,
  CartItemDto,
} from './dto/cart.dto';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async createCart(createCartDto: CreateCartDto) {
    return this.prisma.cart.create({
      data: {
        ...createCartDto,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
      },
      include: {
        lineItems: {
          include: {
            variant: {
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
                productImage: true,
              },
            },
          },
        },
      },
    });
  }

  async findCart(userId?: string, sessionId?: string) {
    if (!userId && !sessionId) {
      throw new BadRequestException('Se requiere userId o sessionId');
    }

    const where: any = {};
    if (userId) where.userId = userId;
    if (sessionId) where.sessionId = sessionId;

    const cart = await this.prisma.cart.findFirst({
      where,
      include: {
        lineItems: {
          include: {
            variant: {
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
                productImage: true,
              },
            },
          },
        },
      },
    });

    if (!cart) {
      // Crear carrito automáticamente si no existe
      return this.createCart({ userId, sessionId });
    }

    return cart;
  }

  async addItemToCart(
    cartId: string,
    createLineItemDto: CreateCartLineItemDto,
  ) {
    // Verificar que el carrito existe
    const cart = await this.prisma.cart.findUnique({
      where: { id: cartId },
    });

    if (!cart) {
      throw new NotFoundException('Carrito no encontrado');
    }

    // Verificar que la variante existe y está disponible
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: createLineItemDto.variantId },
      include: {
        product: true,
      },
    });

    if (!variant) {
      throw new NotFoundException('Variante de producto no encontrada');
    }

    if (!variant.isActive || !variant.product.isActive) {
      throw new BadRequestException('El producto no está disponible');
    }

    // Verificar stock disponible
    if (
      variant.inventoryPolicy === 'DENY' &&
      variant.inventoryQuantity < createLineItemDto.quantity
    ) {
      throw new BadRequestException('Stock insuficiente');
    }

    // Verificar si el item ya existe en el carrito
    const existingItem = await this.prisma.cartLineItem.findUnique({
      where: {
        cartId_variantId: {
          cartId,
          variantId: createLineItemDto.variantId,
        },
      },
    });

    if (existingItem) {
      // Actualizar cantidad si ya existe
      const newQuantity = existingItem.quantity + createLineItemDto.quantity;

      if (
        variant.inventoryPolicy === 'DENY' &&
        variant.inventoryQuantity < newQuantity
      ) {
        throw new BadRequestException('Stock insuficiente');
      }

      return this.prisma.cartLineItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: newQuantity,
          properties: createLineItemDto.properties,
        },
        include: {
          variant: {
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
              productImage: true,
            },
          },
        },
      });
    }

    // Crear nuevo item
    return this.prisma.cartLineItem.create({
      data: {
        cartId,
        ...createLineItemDto,
      },
      include: {
        variant: {
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
            productImage: true,
          },
        },
      },
    });
  }

  async updateCartItem(
    itemId: string,
    updateLineItemDto: UpdateCartLineItemDto,
  ) {
    const existingItem = await this.prisma.cartLineItem.findUnique({
      where: { id: itemId },
      include: {
        variant: true,
      },
    });

    if (!existingItem) {
      throw new NotFoundException('Item del carrito no encontrado');
    }

    // Verificar stock si se actualiza la cantidad
    if (updateLineItemDto.quantity !== undefined) {
      if (updateLineItemDto.quantity <= 0) {
        throw new BadRequestException('La cantidad debe ser mayor a 0');
      }

      if (
        existingItem.variant.inventoryPolicy === 'DENY' &&
        existingItem.variant.inventoryQuantity < updateLineItemDto.quantity
      ) {
        throw new BadRequestException('Stock insuficiente');
      }
    }

    return this.prisma.cartLineItem.update({
      where: { id: itemId },
      data: updateLineItemDto,
      include: {
        variant: {
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
            productImage: true,
          },
        },
      },
    });
  }

  async removeCartItem(itemId: string) {
    const existingItem = await this.prisma.cartLineItem.findUnique({
      where: { id: itemId },
    });

    if (!existingItem) {
      throw new NotFoundException('Item del carrito no encontrado');
    }

    return this.prisma.cartLineItem.delete({
      where: { id: itemId },
    });
  }

  async clearCart(cartId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { id: cartId },
    });

    if (!cart) {
      throw new NotFoundException('Carrito no encontrado');
    }

    await this.prisma.cartLineItem.deleteMany({
      where: { cartId },
    });

    return { message: 'Carrito vaciado exitosamente' };
  }

  async getCartSummary(cartId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { id: cartId },
      include: {
        lineItems: {
          include: {
            variant: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });

    if (!cart) {
      throw new NotFoundException('Carrito no encontrado');
    }

    let subtotal = 0;
    let totalItems = 0;

    cart.lineItems.forEach((item) => {
      subtotal += item.variant.price.toNumber() * item.quantity;
      totalItems += item.quantity;
    });

    return {
      cartId: cart.id,
      totalItems,
      subtotal,
      currency: cart.currency,
      items: cart.lineItems.map((item) => ({
        id: item.id,
        variantId: item.variantId,
        quantity: item.quantity,
        price: item.variant.price,
        total: item.variant.price.toNumber() * item.quantity,
        product: {
          id: item.variant.product.id,
          name: item.variant.product.name,
          slug: item.variant.product.slug,
        },
        variant: {
          id: item.variant.id,
          title: item.variant.title,
          sku: item.variant.sku,
        },
        properties: item.properties,
      })),
    };
  }

  // Limpiar carritos expirados
  async cleanExpiredCarts() {
    const result = await this.prisma.cart.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    return { deletedCarts: result.count };
  }

  // ========== NEW USER-SPECIFIC CART METHODS ==========

  /**
   * Obtiene o crea el carrito del usuario autenticado
   */
  async getUserCart(userId: string) {
    let cart = await this.prisma.cart.findFirst({
      where: { userId },
      include: {
        lineItems: {
          include: {
            variant: {
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
                productImage: true,
              },
            },
          },
        },
      },
    });

    if (!cart) {
      // Crear carrito automáticamente si no existe
      cart = await this.createCart({ userId });
    }

    return this.formatCartResponse(cart);
  }

  /**
   * Agrega un item al carrito del usuario con validación de stock
   */
  async addItemToUserCart(userId: string, addToCartDto: AddToCartDto) {
    // Obtener o crear carrito del usuario
    const cart = await this.getUserCartEntity(userId);

    // Verificar que la variante existe y está disponible
    let variant = await this.prisma.productVariant.findUnique({
      where: { id: addToCartDto.variantId },
      include: {
        product: true,
      },
    });

    // Si no se encuentra la variante, intentar buscar por productId
    if (!variant) {
      variant = await this.prisma.productVariant.findFirst({
        where: {
          productId: addToCartDto.variantId, // Usar variantId como productId
          isActive: true,
        },
        include: {
          product: true,
        },
      });
    }

    if (!variant) {
      throw new NotFoundException('Producto o variante no encontrada');
    }

    if (!variant.isActive || !variant.product.isActive) {
      throw new BadRequestException('El producto no está disponible');
    }

    // Verificar stock disponible
    if (
      variant.inventoryPolicy === 'DENY' &&
      variant.inventoryQuantity < addToCartDto.quantity
    ) {
      throw new BadRequestException(
        `Stock insuficiente. Solo hay ${variant.inventoryQuantity} unidades disponibles`,
      );
    }

    // Verificar si el item ya existe en el carrito
    const existingItem = await this.prisma.cartLineItem.findUnique({
      where: {
        cartId_variantId: {
          cartId: cart.id,
          variantId: addToCartDto.variantId,
        },
      },
    });

    if (existingItem) {
      // Actualizar cantidad si ya existe
      const newQuantity = existingItem.quantity + addToCartDto.quantity;

      if (
        variant.inventoryPolicy === 'DENY' &&
        variant.inventoryQuantity < newQuantity
      ) {
        throw new BadRequestException(
          `Stock insuficiente. Solo hay ${variant.inventoryQuantity} unidades disponibles`,
        );
      }

      const updatedItem = await this.prisma.cartLineItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: newQuantity,
          properties: addToCartDto.properties,
        },
        include: {
          variant: {
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
              productImage: true,
            },
          },
        },
      });

      return this.formatCartItemResponse(updatedItem);
    }

    // Crear nuevo item
    const newItem = await this.prisma.cartLineItem.create({
      data: {
        cartId: cart.id,
        ...addToCartDto,
      },
      include: {
        variant: {
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
            productImage: true,
          },
        },
      },
    });

    return this.formatCartItemResponse(newItem);
  }

  /**
   * Actualiza un item del carrito del usuario
   */
  async updateUserCartItem(
    userId: string,
    itemId: string,
    updateCartItemDto: UpdateCartItemDto,
  ) {
    const existingItem = await this.prisma.cartLineItem.findUnique({
      where: { id: itemId },
      include: {
        cart: true,
        variant: true,
      },
    });

    if (!existingItem) {
      throw new NotFoundException('Item del carrito no encontrado');
    }

    // Verificar que el item pertenece al usuario
    if (existingItem.cart.userId !== userId) {
      throw new ForbiddenException(
        'No tienes permisos para modificar este item',
      );
    }

    // Verificar stock si se actualiza la cantidad
    if (updateCartItemDto.quantity !== undefined) {
      if (updateCartItemDto.quantity <= 0) {
        throw new BadRequestException('La cantidad debe ser mayor a 0');
      }

      if (
        existingItem.variant.inventoryPolicy === 'DENY' &&
        existingItem.variant.inventoryQuantity < updateCartItemDto.quantity
      ) {
        throw new BadRequestException(
          `Stock insuficiente. Solo hay ${existingItem.variant.inventoryQuantity} unidades disponibles`,
        );
      }
    }

    const updatedItem = await this.prisma.cartLineItem.update({
      where: { id: itemId },
      data: updateCartItemDto,
      include: {
        variant: {
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
            productImage: true,
          },
        },
      },
    });

    return this.formatCartItemResponse(updatedItem);
  }

  /**
   * Elimina un item del carrito del usuario
   */
  async removeUserCartItem(userId: string, itemId: string) {
    const existingItem = await this.prisma.cartLineItem.findUnique({
      where: { id: itemId },
      include: {
        cart: true,
      },
    });

    if (!existingItem) {
      throw new NotFoundException('Item del carrito no encontrado');
    }

    // Verificar que el item pertenece al usuario
    if (existingItem.cart.userId !== userId) {
      throw new ForbiddenException(
        'No tienes permisos para eliminar este item',
      );
    }

    await this.prisma.cartLineItem.delete({
      where: { id: itemId },
    });

    return { message: 'Item eliminado exitosamente' };
  }

  /**
   * Vacía el carrito del usuario
   */
  async clearUserCart(userId: string) {
    const cart = await this.getUserCartEntity(userId);

    await this.prisma.cartLineItem.deleteMany({
      where: { cartId: cart.id },
    });

    return { message: 'Carrito vaciado exitosamente' };
  }

  /**
   * Sincroniza el carrito local con el carrito del servidor
   * Implementa lógica de merge inteligente
   */
  async syncUserCart(userId: string, syncCartDto: SyncCartDto) {
    const serverCart = await this.getUserCartEntity(userId);

    // Obtener items actuales del servidor
    const serverItems = await this.prisma.cartLineItem.findMany({
      where: { cartId: serverCart.id },
      include: {
        variant: {
          include: {
            product: true,
          },
        },
      },
    });

    const mergedItems: any[] = [];
    const processedVariantIds = new Set<string>();

    // Procesar items del carrito local
    for (const localItem of syncCartDto.items) {
      // Primero intentar encontrar la variante directamente
      let variant = await this.prisma.productVariant.findUnique({
        where: { id: localItem.variantId },
        include: { product: true },
      });

      // Si no se encuentra la variante, intentar buscar por productId
      if (!variant) {
        // Buscar la primera variante activa del producto
        variant = await this.prisma.productVariant.findFirst({
          where: {
            productId: localItem.variantId, // Usar variantId como productId
            isActive: true,
          },
          include: { product: true },
        });
      }

      if (!variant || !variant.isActive || !variant.product.isActive) {
        continue; // Saltar items no válidos
      }

      // Buscar si ya existe en el servidor (usar el ID real de la variante)
      const serverItem = serverItems.find(
        (item) => item.variantId === variant.id,
      );

      let finalQuantity = localItem.quantity;

      if (serverItem) {
        // Merge: usar la cantidad mayor entre local y servidor
        finalQuantity = Math.max(localItem.quantity, serverItem.quantity);
      }

      // Verificar stock disponible
      if (
        variant.inventoryPolicy === 'DENY' &&
        variant.inventoryQuantity < finalQuantity
      ) {
        finalQuantity = Math.min(finalQuantity, variant.inventoryQuantity);
      }

      if (finalQuantity > 0) {
        // Crear o actualizar item (usar el ID real de la variante)
        const mergedItem = await this.prisma.cartLineItem.upsert({
          where: {
            cartId_variantId: {
              cartId: serverCart.id,
              variantId: variant.id,
            },
          },
          update: {
            quantity: finalQuantity,
            properties: localItem.properties,
          },
          create: {
            cartId: serverCart.id,
            variantId: variant.id,
            quantity: finalQuantity,
            properties: localItem.properties,
          },
          include: {
            variant: {
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
                productImage: true,
              },
            },
          },
        });

        mergedItems.push(this.formatCartItemResponse(mergedItem));
      }

      processedVariantIds.add(variant.id);
    }

    // Mantener items del servidor que no estaban en el carrito local
    for (const serverItem of serverItems) {
      if (!processedVariantIds.has(serverItem.variantId)) {
        mergedItems.push(this.formatCartItemResponse(serverItem));
      }
    }

    // Calcular totales
    const subtotal = mergedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    return {
      cartId: serverCart.id,
      items: mergedItems,
      totalItems: mergedItems.reduce((sum, item) => sum + item.quantity, 0),
      subtotal,
      currency: serverCart.currency,
      message: 'Carrito sincronizado exitosamente',
    };
  }

  // ========== HELPER METHODS ==========

  /**
   * Obtiene la entidad del carrito del usuario (sin formatear)
   */
  private async getUserCartEntity(userId: string) {
    let cart = await this.prisma.cart.findFirst({
      where: { userId },
    });

    if (!cart) {
      cart = await this.createCart({ userId });
    }

    return cart;
  }

  /**
   * Formatea la respuesta del carrito
   */
  private formatCartResponse(cart: any) {
    let subtotal = 0;
    let totalItems = 0;

    const formattedItems = cart.lineItems.map((item: any) => {
      const itemTotal = item.variant.price.toNumber() * item.quantity;
      subtotal += itemTotal;
      totalItems += item.quantity;

      return this.formatCartItemResponse(item);
    });

    return {
      id: cart.id,
      items: formattedItems,
      totalItems,
      subtotal,
      currency: cart.currency,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    };
  }

  /**
   * Formatea la respuesta de un item del carrito
   */
  private formatCartItemResponse(item: any) {
    return {
      id: item.id,
      variantId: item.variantId,
      quantity: item.quantity,
      price: item.variant.price.toNumber(),
      total: item.variant.price.toNumber() * item.quantity,
      properties: item.properties,
      product: {
        id: item.variant.product.id,
        name: item.variant.product.name,
        slug: item.variant.product.slug,
        image: item.variant.product.productImages[0]?.url || null,
        brand: item.variant.product.brand?.name || null,
      },
      variant: {
        id: item.variant.id,
        title: item.variant.title,
        sku: item.variant.sku,
        inventoryQuantity: item.variant.inventoryQuantity,
        inventoryPolicy: item.variant.inventoryPolicy,
      },
    };
  }
}
